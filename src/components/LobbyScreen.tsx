import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PlusCircle, MapPin, Users, Trash2, ArrowRight, Download, Lock, Globe as GlobeIcon, Clock, Hash, X, Loader } from "lucide-react";
import { TripData } from "../types";

interface Props {
  myName: string;
  trips: any[];
  onJoin: (trip: any) => void;
  onRequestJoin: (tripId: string) => void;
  onJoinByCode: (code: string) => Promise<boolean>;
  onNew: () => void;
  onDelete: (id: string) => void;
  onLogout: () => void;
}

export default function LobbyScreen({ myName, trips, onJoin, onRequestJoin, onJoinByCode, onNew, onDelete, onLogout }: Props) {
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [tripCode, setTripCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  const myTrips = (trips || []).filter((t: any) => t.members.includes(myName));

  const handleJoinByCode = async () => {
    if (!tripCode.trim()) return;
    setJoining(true);
    setCodeError(null);
    const success = await onJoinByCode(tripCode.trim().toUpperCase());
    if (success) {
      setShowCodeInput(false);
      setTripCode("");
    } else {
      setCodeError("Invalid trip code. Please check and try again.");
    }
    setJoining(false);
  };
  const downloadJSON = (trip: any) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trip, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `${trip.plan.destination}_trip.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-pink-500 flex items-center justify-center font-nunito font-black text-white shadow-md">
            {myName[0].toUpperCase()}
          </div>
          <div>
            <p className="font-caveat text-slate-500 leading-none">Logged in as</p>
            <p className="font-nunito font-bold text-slate-800">{myName}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="text-sm font-nunito font-bold text-slate-400 hover:text-slate-600 transition-colors"
        >
          Logout
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <span className="text-5xl block mb-2">✈️</span>
        <h1 className="text-4xl font-nunito font-black text-sky-900">Your Dashboard</h1>
        <p className="font-caveat text-xl text-sky-600">Plan or join an adventure</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNew}
          className="bg-linear-to-r from-sky-500 to-sky-600 text-white font-nunito font-bold py-6 px-4 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-xl shadow-sky-100"
        >
          <PlusCircle size={32} />
          <span>Create New Trip</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCodeInput(true)}
          className="bg-linear-to-r from-indigo-500 to-indigo-600 text-white font-nunito font-bold py-6 px-4 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-xl shadow-indigo-100"
        >
          <Hash size={32} />
          <span>Enter Trip Code</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showCodeInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="bg-white p-6 rounded-3xl border-2 border-indigo-200 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-nunito font-black text-indigo-900">Enter Secret Trip Code</h3>
                <button onClick={() => setShowCodeInput(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. TRP-XJ2"
                  className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-nunito font-bold uppercase focus:outline-hidden focus:border-indigo-300"
                  value={tripCode}
                  onChange={(e) => setTripCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinByCode()}
                />
                <button 
                  onClick={handleJoinByCode}
                  disabled={joining || !tripCode.trim()}
                  className="bg-indigo-500 text-white px-6 rounded-2xl font-nunito font-bold shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50 flex items-center justify-center"
                >
                  {joining ? <Loader className="animate-spin" size={20} /> : "Join"}
                </button>
              </div>
              {codeError && (
                <p className="text-rose-500 text-xs font-bold font-nunito">{codeError}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <h2 className="font-nunito font-black text-slate-400 text-xs uppercase tracking-widest ml-1 mb-2">My Trips</h2>
        {myTrips.length > 0 ? (
          myTrips.map((trip, i) => {
            return (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-slate-100 transition-all group relative cursor-pointer hover:border-sky-200"
                onClick={() => onJoin(trip)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={16} className="text-sky-500" />
                      <h3 className="font-nunito font-bold text-xl text-slate-800">{trip.plan.destination}</h3>
                      <div className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-200 flex items-center gap-1">
                         <Hash size={10} /> {trip.code}
                      </div>
                    </div>
                    <div className="flex gap-4 font-caveat text-slate-500">
                      <span>📅 {new Date(trip.plan.startDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Users size={14} /> {trip.members.length}</span>
                    </div>

                    <div className="mt-3 flex gap-1">
                      {trip.members.map((m: string, i: number) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold border border-white -ml-1 first:ml-0" title={m}>
                          {m[0].toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {trip.createdBy === myName && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(trip.id); }}
                        className="p-2 text-slate-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); downloadJSON(trip); }}
                      className="p-2 text-slate-300 hover:text-sky-500 transition-colors"
                      title="Export as JSON"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="font-caveat text-2xl text-slate-400">Empty dashboard. Create or join a trip!</p>
          </div>
        )}
      </div>
    </div>
  );
}
