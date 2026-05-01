import { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, MapPin, Calendar, Users, Luggage, Sun, PlusCircle, ArrowRight, Globe, Loader } from "lucide-react";

interface Props {
  onBack: () => void;
  onCreate: (plan: any) => Promise<void>;
}

const TRIP_TYPES = [
  { value: "beach", label: "🏖️ Beach" },
  { value: "mountain", label: "🏔️ Mountain" },
  { value: "city", label: "🏙️ City" },
  { value: "road-trip", label: "🚗 Road Trip" },
  { value: "cultural", label: "🏛️ Cultural" },
];

const WEATHER_TYPES = [
  { value: "sunny", label: "☀️ Sunny" },
  { value: "rainy", label: "🌧️ Rainy" },
  { value: "cold", label: "❄️ Cold" },
  { value: "cloudy", label: "☁️ Cloudy" },
];

export default function PlannerScreen({ onBack, onCreate }: Props) {
  const [dest, setDest] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [type, setType] = useState("");
  const [weather, setWeather] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!dest || !start || !end) {
      setError("Please fill in destination and dates!");
      return;
    }
    setLoading(true);
    try {
      await onCreate({
        destination: dest,
        startDate: start,
        endDate: end,
        tripType: type,
        weather,
        isPrivate
      });
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBack}
        className="flex items-center gap-2 text-sky-600 font-nunito font-bold mb-6 hover:text-sky-700 transition-colors cursor-pointer"
      >
        <ChevronLeft size={20} /> Back to Trips
      </motion.button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-nunito font-black text-sky-900">Plan Adventure</h1>
        <p className="font-caveat text-xl text-sky-600">Fill in the bits to get started ✨</p>
      </motion.div>

      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-xl space-y-6">
        <div>
          <label className="flex items-center gap-2 font-nunito font-bold text-slate-800 mb-2">
            <MapPin size={18} className="text-sky-500" /> Destination
          </label>
          <input
            type="text"
            className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 font-caveat text-xl focus:border-sky-400 outline-hidden transition-all"
            placeholder="e.g. Goa, Manali, Paris..."
            value={dest}
            onChange={(e) => setDest(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 font-nunito font-bold text-slate-800 mb-2">
              <Calendar size={18} className="text-sky-500" /> Start
            </label>
            <input
              type="date"
              className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 font-caveat text-xl focus:border-sky-400 outline-hidden transition-all"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div>
            <label className="flex items-center gap-2 font-nunito font-bold text-slate-800 mb-2">
              <Calendar size={18} className="text-sky-500" /> End
            </label>
            <input
              type="date"
              className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 font-caveat text-xl focus:border-sky-400 outline-hidden transition-all"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 font-nunito font-bold text-slate-800 mb-3">
            <Globe className="text-indigo-500" size={18} /> Privacy
          </label>
          <div className="flex gap-4">
            {[
              { value: false, label: "Public", sub: "Anyone can join" },
              { value: true, label: "Private", sub: "Require approval" }
            ].map((p) => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={String(p.value)}
                onClick={() => setIsPrivate(p.value)}
                className={`flex-1 p-3 rounded-2xl border-2 transition-all text-left cursor-pointer ${
                  isPrivate === p.value
                    ? "bg-indigo-50 border-indigo-500 ring-4 ring-indigo-100"
                    : "bg-white border-slate-100 hover:border-slate-200"
                }`}
              >
                <p className={`font-nunito font-bold ${isPrivate === p.value ? "text-indigo-900" : "text-slate-700"}`}>{p.label}</p>
                <p className="font-caveat text-slate-400 leading-none">{p.sub}</p>
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 font-nunito font-bold text-slate-800 mb-3">
            <Luggage size={18} className="text-emerald-500" /> Trip Type
          </label>
          <div className="flex flex-wrap gap-2">
            {TRIP_TYPES.map(t => (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                key={t.value}
                onClick={() => setType(t.value)}
                className={`px-4 py-2 rounded-full font-caveat text-lg border-2 transition-all cursor-pointer ${
                  type === t.value 
                  ? "bg-sky-100 border-sky-400 text-sky-800" 
                  : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                }`}
              >
                {t.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 font-nunito font-bold text-slate-800 mb-3">
            <Sun size={18} className="text-orange-500" /> Expected Weather
          </label>
          <div className="flex flex-wrap gap-2">
            {WEATHER_TYPES.map(w => (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                key={w.value}
                onClick={() => setWeather(w.value)}
                className={`px-4 py-2 rounded-full font-caveat text-lg border-2 transition-all cursor-pointer ${
                  weather === w.value 
                  ? "bg-orange-100 border-orange-400 text-orange-800" 
                  : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                }`}
              >
                {w.label}
              </motion.button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-center font-caveat text-lg">{error}</p>}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-linear-to-r from-emerald-500 to-sky-500 text-white font-nunito font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <Loader className="animate-spin" size={24} />
          ) : (
            <>
              <PlusCircle size={24} /> Create Trip <ArrowRight size={20} />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
