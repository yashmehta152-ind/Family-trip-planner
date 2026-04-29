import { useState } from "react";
import { Plane, Globe, Star, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  onDone: (name: string) => void;
}

export default function NameScreen({ onDone }: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Please enter your name basics!");
      return;
    }
    onDone(name.trim());
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="flex justify-center gap-4 mb-8">
          {[
            { icon: <Plane className="text-white" />, color: "from-sky-500 to-indigo-500" },
            { icon: <Globe className="text-white" />, color: "from-orange-500 to-pink-500" },
            { icon: <Star className="text-white" />, color: "from-emerald-500 to-sky-500" }
          ].map((item, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
              className={`w-12 h-12 rounded-xl bg-linear-to-br ${item.color} flex items-center justify-center shadow-lg`}
            >
              {item.icon}
            </motion.div>
          ))}
        </div>

        <h1 className="text-5xl font-nunito font-black text-sky-900 mb-2">Family trip planner</h1>
        <p className="text-xl text-sky-600 mb-8 font-caveat">Collaborate and pack together!</p>

        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-sky-100">
          <div className="w-16 h-16 rounded-full bg-linear-to-br from-sky-100 to-pink-100 flex items-center justify-center mx-auto mb-4 text-3xl">
            👤
          </div>
          <h2 className="text-2xl font-nunito font-bold text-slate-800 mb-2">Hello there!</h2>
          <p className="text-slate-500 mb-6 font-caveat text-lg">What should we call you on the trip?</p>
          
          <input
            type="text"
            className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-center text-xl font-caveat focus:outline-hidden focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all mb-2"
            placeholder="e.g. Dad, Maya, Arjun..."
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
          
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            onClick={handleSubmit}
            className="w-full bg-linear-to-r from-sky-500 to-indigo-500 text-white font-nunito font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-sky-200 hover:-translate-y-1 transition-transform active:scale-95"
          >
            Start Planning <ArrowRight size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
