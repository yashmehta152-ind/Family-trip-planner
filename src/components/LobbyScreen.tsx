import { motion } from "motion/react";
import { PlusCircle, MapPin, Users, Trash2, ArrowRight, Download, Lock, Globe as GlobeIcon, Clock } from "lucide-react";
import { TripData } from "../types";

interface Props {
  myName: string;
  trips: any[];
  onJoin: (trip: any) => void;
  onRequestJoin: (tripId: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onLogout: () => void;
}

export default function LobbyScreen({ myName, trips, onJoin, onRequestJoin, onNew, onDelete, onLogout }: Props) {
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
        <h1 className="text-4xl font-nunito font-black text-sky-900">Family Trips</h1>
        <p className="font-caveat text-xl text-sky-600">Where shall we go next?</p>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNew}
        className="w-full bg-linear-to-r from-sky-500 to-indigo-500 text-white font-nunito font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-sky-200 mb-10"
      >
        <PlusCircle size={24} /> Plan a New Trip <ArrowRight size={20} />
      </motion.button>

      <div className="space-y-4">
        {trips.length > 0 ? (
          trips.map((trip, i) => {
            const isMember = trip.members.includes(myName);
            const isPrivate = trip.plan.isPrivate;
            const myRequest = trip.joinRequests?.find((r: any) => r.userName === myName);
            const isPending = myRequest?.status === 'pending';
            const isDeclined = myRequest?.status === 'declined';

            return (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-slate-100 transition-all group relative ${
                  isMember || (!isPrivate && !isPending && !isDeclined) ? "cursor-pointer hover:border-sky-200" : ""
                }`}
                onClick={() => {
                  if (isMember) onJoin(trip);
                  else if (!isPrivate) onJoin(trip);
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={16} className="text-sky-500" />
                      <h3 className="font-nunito font-bold text-xl text-slate-800">{trip.plan.destination}</h3>
                      {isPrivate ? (
                        <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-100">
                          <Lock size={10} /> PRIVATE
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-100">
                          <GlobeIcon size={10} /> PUBLIC
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 font-caveat text-slate-500">
                      <span>📅 {new Date(trip.plan.startDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Users size={14} /> {trip.members.length}</span>
                    </div>
                    
                    {!isMember && (
                      <div className="mt-4">
                        {isPrivate ? (
                          isPending ? (
                            <div className="flex items-center gap-2 text-amber-500 font-nunito font-bold text-sm bg-amber-50 p-2 rounded-xl border border-amber-100 w-fit">
                              <Clock size={14} /> Request Pending...
                            </div>
                          ) : isDeclined ? (
                            <div className="text-red-500 font-nunito font-bold text-sm bg-red-50 p-2 rounded-xl border border-red-100 w-fit">
                              Request Declined
                            </div>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); onRequestJoin(trip.id); }}
                              className="bg-indigo-500 text-white font-nunito font-bold text-sm px-4 py-2 rounded-xl shadow-md shadow-indigo-100 active:scale-95"
                            >
                              Request to Join
                            </button>
                          )
                        ) : (
                          <div className="text-sky-500 font-nunito font-bold text-sm">
                            Click to Join
                          </div>
                        )}
                      </div>
                    )}

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
          <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="font-caveat text-2xl text-slate-400">No trips yet. Start one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
