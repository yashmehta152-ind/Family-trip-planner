import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, MapPin, Users, Wifi, Loader, CheckCircle2, Circle, Plus, Trash2, Sparkles, FileText, Zap, Heart, Shirt, ShoppingCart, Utensils, BookOpen, Music, Gamepad2, Baby, Tag, Luggage, Star, X, Copy, Check, Receipt, UserCheck, ShieldCheck, UserX, Wallet, ArrowRightLeft, ArrowRight } from "lucide-react";
import { TripData, TripCategory, Expense, Transfer } from "../types";
import { getPackingSuggestions } from "../services/geminiService";

interface Props {
  myName: string;
  myId: string;
  trip: TripData;
  onBack: () => void;
  onUpdateCategories: (categories: TripCategory[]) => void;
  onUpdateExpenses: (expenses: Expense[]) => void;
  onUpdateTransfers: (transfers: Transfer[]) => void;
  onApproveMember: (requestId: string) => void;
  onDeclineMember: (requestId: string) => void;
}

const ICON_MAP: Record<string, any> = { FileText, Zap, Heart, Shirt, ShoppingCart, Utensils, BookOpen, Music, Gamepad2, Baby, Tag, Luggage, Star };

export default function ChecklistScreen({ myName, myId, trip, onBack, onUpdateCategories, onUpdateExpenses, onUpdateTransfers, onApproveMember, onDeclineMember }: Props) {
  const [tab, setTab] = useState<"checklist" | "expenses" | "members">("checklist");
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Expense state
  const [expDesc, setExpDesc] = useState("");
  const [expAmt, setExpAmt] = useState("");
  const [showAddExp, setShowAddExp] = useState(false);

  // Transfer state
  const [transAmt, setTransAmt] = useState("");
  const [transTo, setTransTo] = useState("");
  const [showAddTrans, setShowAddTrans] = useState(false);

  const isCreator = trip.createdBy === myName || (trip as any).creatorId === myId;

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(trip, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = trip.categories || [];
  const expenses = trip.expenses || [];
  const transfers = trip.transfers || [];
  const pendingRequests = (trip.joinRequests || []).filter(r => r.status === 'pending');

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);
  const packedItems = categories.reduce((sum, c) => sum + c.items.filter(i => i.checkedBy.length > 0).length, 0);
  const progress = totalItems === 0 ? 0 : Math.round((packedItems / totalItems) * 100);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const perPerson = trip.members.length > 0 ? totalExpenses / trip.members.length : 0;

  const addExpense = () => {
    const amt = parseFloat(expAmt);
    if (!expDesc || isNaN(amt)) return;
    const newExp: Expense = {
      id: Math.random().toString(36).slice(2, 9),
      description: expDesc,
      amount: amt,
      paidBy: myName,
      date: new Date().toISOString()
    };
    onUpdateExpenses([...expenses, newExp]);
    setExpDesc("");
    setExpAmt("");
    setShowAddExp(false);
  };

  const deleteExpense = (id: string) => {
    onUpdateExpenses(expenses.filter(e => e.id !== id));
  };

  const addTransfer = () => {
    const amt = parseFloat(transAmt);
    if (!transTo || isNaN(amt)) return;
    const newTrans: Transfer = {
      id: Math.random().toString(36).slice(2, 9),
      from: myName,
      to: transTo,
      amount: amt,
      date: new Date().toISOString()
    };
    onUpdateTransfers([...transfers, newTrans]);
    setTransAmt("");
    setTransTo("");
    setShowAddTrans(false);
  };

  const deleteTransfer = (id: string) => {
    onUpdateTransfers(transfers.filter(t => t.id !== id));
  };

  const toggleItem = (catId: string, itemId: string) => {
    const newCats = categories.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: cat.items.map(item => {
          if (item.id !== itemId) return item;
          const checked = item.checkedBy.includes(myName);
          return {
            ...item,
            checkedBy: checked 
              ? item.checkedBy.filter(n => n !== myName)
              : [...item.checkedBy, myName]
          };
        })
      };
    });
    onUpdateCategories(newCats);
  };

  const addItem = (catId: string) => {
    if (!newItemText.trim()) return;
    const newCats = categories.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: [...cat.items, { id: Math.random().toString(36).slice(2, 9), text: newItemText.trim(), checkedBy: [] }]
      };
    });
    onUpdateCategories(newCats);
    setNewItemText("");
    setAddingTo(null);
  };

  const deleteItem = (catId: string, itemId: string) => {
    const newCats = categories.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: cat.items.filter(i => i.id !== itemId)
      };
    });
    onUpdateCategories(newCats);
  };

  const useAiAssistant = async () => {
    setAiLoading(true);
    const suggestions = await getPackingSuggestions(trip.plan.destination, trip.plan.tripType, trip.plan.weather);
    if (suggestions && suggestions.length > 0) {
      // Add a "Recommendations" category or add to existing ones
      const existingAiCat = categories.find(c => c.id === "ai-suggestions");
      let newCats;
      
      if (existingAiCat) {
        newCats = categories.map(c => c.id === "ai-suggestions" ? {
          ...c,
          items: [...c.items, ...suggestions.map((s: string) => ({ id: Math.random().toString(36).slice(2, 9), text: s, checkedBy: [] }))]
        } : c);
      } else {
        const aiCat: TripCategory = {
          id: "ai-suggestions",
          label: "Smart Suggestions",
          icon: "Star",
          color: "#8b5cf6",
          bg: "#f5f3ff",
          custom: true,
          items: suggestions.map((s: string) => ({ id: Math.random().toString(36).slice(2, 9), text: s, checkedBy: [] }))
        };
        newCats = [...categories, aiCat];
      }
      onUpdateCategories(newCats);
    }
    setAiLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sky-600 font-nunito font-bold hover:text-sky-700 transition-colors"
        >
          <ChevronLeft size={20} /> All Trips
        </button>
        <div className="flex items-center gap-2 text-xs font-nunito font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          <Wifi size={14} /> LIVE SYNCING
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-sky-600 rounded-3xl p-6 mb-6 text-white shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={20} />
            <h1 className="text-3xl font-nunito font-black">{trip.plan.destination}</h1>
          </div>
          <div className="flex flex-wrap gap-4 font-caveat text-xl opacity-90">
            <span>📅 {new Date(trip.plan.startDate).toLocaleDateString()}</span>
            <span>👨‍👩‍👧 {trip.members.join(", ")}</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-400/20 rounded-full -ml-12 -mb-12 blur-2xl" />
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-white/50 backdrop-blur-md p-1 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        {[
          { id: "checklist", label: "Checklist", icon: CheckCircle2 },
          { id: "expenses", label: "Expenses", icon: Receipt },
          ...(isCreator ? [{ id: "members", label: `Requests (${pendingRequests.length})`, icon: UserCheck }] : [])
        ].map((t: any) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-nunito font-bold transition-all whitespace-nowrap ${
                isActive 
                ? "bg-white text-sky-600 shadow-sm ring-1 ring-slate-100" 
                : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon size={18} /> {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {tab === "checklist" && (
          <motion.div
            key="checklist"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 mb-8 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-nunito font-bold text-slate-800">Family Progress</h2>
                <span className="font-caveat text-3xl font-bold text-sky-600">{progress}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-linear-to-r from-sky-400 to-indigo-500"
                />
              </div>
              <p className="mt-3 font-caveat text-slate-500 text-lg">
                {packedItems} of {totalItems} items packed. {progress === 100 && "Ready for takeoff! ✈️"}
              </p>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h3 className="font-nunito font-black text-2xl text-slate-800">Checklist</h3>
              <div className="flex gap-2">
                <button
                  onClick={copyJSON}
                  className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-nunito font-bold shadow-sm hover:bg-slate-50 transition-colors"
                >
                  {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                  {copied ? "Copied!" : "Copy JSON"}
                </button>
                <button
                  onClick={useAiAssistant}
                  disabled={aiLoading}
                  className="flex items-center gap-2 bg-linear-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-xl font-nunito font-bold shadow-lg shadow-purple-100 active:scale-95 disabled:opacity-50"
                >
                  {aiLoading ? <Loader size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  AI Assistant
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {categories.map((cat, ci) => {
                const Icon = ICON_MAP[cat.icon] || Tag;
                return (
                  <motion.div 
                    key={cat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: ci * 0.05 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
                  >
                    <div className="flex items-center gap-4 p-4" style={{ backgroundColor: cat.bg }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md shadow-slate-200" style={{ backgroundColor: cat.color }}>
                        <Icon size={20} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-nunito font-black text-slate-800">{cat.label}</h4>
                        <p className="font-caveat text-slate-500 text-lg leading-none mt-1">
                          {cat.items.filter(i => i.checkedBy.length > 0).length}/{cat.items.length} packed
                        </p>
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      {cat.items.map(item => {
                        const iChecked = item.checkedBy.includes(myName);
                        return (
                          <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl group">
                            <button onClick={() => toggleItem(cat.id, item.id)}>
                              {iChecked 
                                ? <CheckCircle2 size={24} className="text-emerald-500" strokeWidth={2.5} />
                                : <Circle size={24} className="text-slate-200" />
                              }
                            </button>
                            <span className={`flex-1 font-caveat text-xl transition-all ${iChecked ? "text-slate-400 line-through" : "text-slate-700"}`}>
                              {item.text}
                            </span>
                            {item.checkedBy.length > 0 && (
                              <div className="flex gap-1">
                                {item.checkedBy.map(m => (
                                  <div key={m} className="w-5 h-5 rounded-full bg-sky-100 text-[8px] flex items-center justify-center font-bold text-sky-600 border border-sky-200" title={`Packed by ${m}`}>
                                    {m[0].toUpperCase()}
                                  </div>
                                ))}
                              </div>
                            )}
                            <button 
                              onClick={() => deleteItem(cat.id, item.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-200 hover:text-red-400 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3 bg-slate-50/50">
                      {addingTo === cat.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 font-caveat text-lg focus:outline-hidden focus:border-sky-400"
                            placeholder="Add an item..."
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addItem(cat.id)}
                            autoFocus
                          />
                          <button onClick={() => addItem(cat.id)} className="bg-sky-500 text-white px-3 py-1 rounded-lg font-nunito font-bold text-sm">Add</button>
                          <button onClick={() => { setAddingTo(null); setNewItemText(""); }} className="p-2 text-slate-400"><X size={18} /></button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setAddingTo(cat.id)}
                          className="w-full flex items-center justify-center gap-2 py-2 font-caveat text-slate-400 hover:text-sky-500 transition-colors"
                        >
                          <Plus size={16} /> Add to {cat.label}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {tab === "expenses" && (
          <motion.div
            key="expenses"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-slate-100 grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                <p className="font-nunito font-bold text-emerald-800 text-xs uppercase tracking-wider mb-1">Total Trip Cost</p>
                <h2 className="font-nunito font-black text-3xl text-emerald-900">₹{totalExpenses.toLocaleString()}</h2>
              </div>
              <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100">
                <p className="font-nunito font-bold text-sky-800 text-xs uppercase tracking-wider mb-1">Per Person Share</p>
                <h2 className="font-nunito font-black text-3xl text-sky-900">₹{Math.round(perPerson).toLocaleString()}</h2>
              </div>
            </div>

            {/* Member Balances */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-nunito font-black text-xl text-slate-800 mb-4 flex items-center gap-2">
                <Users size={20} className="text-indigo-500" /> Member Balances
              </h3>
              <div className="space-y-3">
                {trip.members.map(member => {
                  const paidInExpenses = expenses.filter(e => e.paidBy === member).reduce((sum, e) => sum + e.amount, 0);
                  const sentTransfers = transfers.filter(t => t.from === member).reduce((sum, t) => sum + t.amount, 0);
                  const receivedTransfers = transfers.filter(t => t.to === member).reduce((sum, t) => sum + t.amount, 0);
                  
                  // Total Outflow - Inflow from transfers
                  const memberPaid = paidInExpenses + sentTransfers - receivedTransfers;
                  const balance = memberPaid - perPerson;
                  
                  const isCredit = balance > 0;
                  const isSettled = Math.abs(balance) < 1;

                  return (
                    <div key={member} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold shadow-sm border border-slate-100">
                          {member[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-nunito font-bold text-slate-800 text-sm">{member} {member === myName && "(You)"}</p>
                          <div className="flex gap-2">
                            <p className="font-caveat text-slate-400 text-sm leading-none">Spent: ₹{Math.round(perPerson)}</p>
                            <p className="font-caveat text-emerald-500 text-sm leading-none font-bold">Paid: ₹{Math.round(memberPaid)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {isSettled ? (
                          <span className="text-xs font-nunito font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-lg">Settled</span>
                        ) : isCredit ? (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-nunito font-black text-emerald-600 uppercase tracking-widest bg-emerald-100 px-2 py-0.5 rounded-lg mb-1">Credit</span>
                            <p className="font-nunito font-black text-emerald-600 text-sm">₹{Math.round(balance)}</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-nunito font-black text-rose-600 uppercase tracking-widest bg-rose-100 px-2 py-0.5 rounded-lg mb-1">To Pay</span>
                            <p className="font-nunito font-black text-rose-600 text-sm">₹{Math.round(Math.abs(balance))}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 font-caveat text-slate-400 text-center text-sm px-4">
                "Paid" shows trip expenses you covered + any direct payments you made to fellow members.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-1">
              <h3 className="font-nunito font-black text-2xl text-slate-800 self-start">Expenses & Payments</h3>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => { setShowAddExp(true); setShowAddTrans(false); }}
                  className="flex-1 sm:flex-none bg-emerald-500 text-white font-nunito font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 active:scale-95"
                >
                  <Plus size={18} /> Trip Expense
                </button>
                <button 
                  onClick={() => { setShowAddTrans(true); setShowAddExp(false); }}
                  className="flex-1 sm:flex-none bg-indigo-500 text-white font-nunito font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-95"
                >
                  <UserCheck size={18} /> I Paid Member
                </button>
              </div>
            </div>

            {showAddExp && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-3xl border-2 border-emerald-200 shadow-xl space-y-4"
              >
                <div className="flex items-center gap-2 text-emerald-600 mb-2">
                  <Wallet size={20} />
                  <h4 className="font-nunito font-black">Record Trip Expense</h4>
                </div>
                <div>
                  <label className="block font-nunito font-bold text-slate-700 text-sm mb-1">What was it for?</label>
                  <input
                    type="text"
                    className="w-full border-2 border-slate-100 rounded-xl px-4 py-2 font-caveat text-xl focus:outline-hidden focus:border-emerald-300"
                    placeholder="e.g. Lunch, Fuel, Tickets..."
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-nunito font-bold text-slate-700 text-sm mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    className="w-full border-2 border-slate-100 rounded-xl px-4 py-2 font-nunito font-bold text-xl focus:outline-hidden focus:border-emerald-300"
                    placeholder="0"
                    value={expAmt}
                    onChange={(e) => setExpAmt(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={addExpense} className="flex-1 bg-emerald-500 text-white font-nunito font-bold py-3 rounded-xl shadow-lg shadow-emerald-100 outline-hidden">
                    Save Expense
                  </button>
                  <button onClick={() => setShowAddExp(false)} className="px-6 bg-slate-100 text-slate-500 font-nunito font-bold py-3 rounded-xl outline-hidden">
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {showAddTrans && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-3xl border-2 border-indigo-200 shadow-xl space-y-4"
              >
                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                  <UserCheck size={20} />
                  <h4 className="font-nunito font-black">I Paid a Member</h4>
                </div>
                <div>
                  <label className="block font-nunito font-bold text-slate-700 text-sm mb-1">Who did you pay?</label>
                  <div className="flex flex-wrap gap-2">
                    {trip.members.filter(m => m !== myName).map(member => (
                      <button
                        key={member}
                        onClick={() => setTransTo(member)}
                        className={`px-4 py-2 rounded-xl font-nunito font-bold text-sm transition-all ${
                          transTo === member 
                          ? "bg-indigo-500 text-white shadow-md ring-2 ring-indigo-200" 
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {member}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-nunito font-bold text-slate-700 text-sm mb-1">How much?</label>
                  <input
                    type="number"
                    className="w-full border-2 border-slate-100 rounded-xl px-4 py-2 font-nunito font-bold text-xl focus:outline-hidden focus:border-indigo-300"
                    placeholder="0"
                    value={transAmt}
                    onChange={(e) => setTransAmt(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={addTransfer} className="flex-1 bg-indigo-500 text-white font-nunito font-bold py-3 rounded-xl shadow-lg shadow-indigo-100 outline-hidden">
                    Record Payment
                  </button>
                  <button onClick={() => setShowAddTrans(false)} className="px-6 bg-slate-100 text-slate-500 font-nunito font-bold py-3 rounded-xl outline-hidden">
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between px-1">
                <p className="font-nunito font-black text-xs text-slate-400 uppercase tracking-widest">Recent Activity</p>
              </div>

              {[...expenses.map(e => ({...e, type: 'expense'})), ...transfers.map(t => ({...t, type: 'transfer'}))]
                .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((item: any) => (
                  <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                        item.type === 'expense' ? "bg-emerald-50 text-emerald-500" : "bg-indigo-50 text-indigo-500"
                      }`}>
                        {item.type === 'expense' ? <Wallet size={20} /> : <UserCheck size={20} />}
                      </div>
                      <div>
                        {item.type === 'expense' ? (
                          <>
                            <h4 className="font-nunito font-bold text-slate-800 leading-tight">{item.description}</h4>
                            <p className="font-caveat text-slate-500 text-lg leading-none mt-1">Paid by {item.paidBy === myName ? "You" : item.paidBy}</p>
                          </>
                        ) : (
                          <>
                            <h4 className="font-nunito font-bold text-slate-800 leading-tight">Direct Payment</h4>
                            <p className="font-caveat text-slate-500 text-lg leading-none mt-1">
                              {item.from === myName ? "You paid " : item.from + " paid "} {item.to === myName ? "You" : item.to}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`font-nunito font-black text-xl ${item.type === 'expense' ? "text-slate-800" : "text-indigo-600"}`}>₹{item.amount.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(item.date).toLocaleDateString()}</p>
                      </div>
                      <button 
                        onClick={() => item.type === 'expense' ? deleteExpense(item.id) : deleteTransfer(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-200 hover:text-red-400 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              
              {expenses.length === 0 && transfers.length === 0 && (
                <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="font-caveat text-2xl text-slate-400">No activity yet. Let's start tracking!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {tab === "members" && isCreator && (
          <motion.div
            key="members"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center px-1">
              <h3 className="font-nunito font-black text-2xl text-slate-800">Join Requests</h3>
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs font-bold border border-amber-100">
                <ShieldCheck size={14} /> ADMIN ONLY
              </div>
            </div>

            {pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.map(req => (
                  <motion.div 
                    key={req.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-100 to-sky-100 flex items-center justify-center text-xl shadow-inner">
                        👤
                      </div>
                      <div>
                        <h4 className="font-nunito font-bold text-xl text-slate-800">{req.userName}</h4>
                        <p className="font-caveat text-slate-500 text-lg leading-none">Requested to join this trip</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => onApproveMember(req.id)}
                        className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg shadow-emerald-100 active:scale-95 transition-transform"
                        title="Approve"
                      >
                        <UserCheck size={24} />
                      </button>
                      <button 
                        onClick={() => onDeclineMember(req.id)}
                        className="bg-red-50 text-red-500 p-3 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-95"
                        title="Decline"
                      >
                        <UserX size={24} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="font-caveat text-2xl text-slate-400">No pending requests! All family is in.</p>
              </div>
            )}

            <div className="pt-6">
              <h4 className="font-nunito font-bold text-slate-400 uppercase text-xs tracking-widest mb-4">Current Members</h4>
              <div className="flex flex-wrap gap-2">
                {trip.members.map((m, i) => (
                  <div key={i} className="bg-white border border-slate-100 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                      {m[0].toUpperCase()}
                    </div>
                    <span className="font-nunito font-bold text-slate-700">{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
