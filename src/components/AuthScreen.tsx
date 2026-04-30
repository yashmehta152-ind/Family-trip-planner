import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, User, ArrowRight, Loader, Globe } from "lucide-react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

interface Props {
  onAuthSuccess: (user: { id: string, email: string, name: string }) => void;
}

export default function AuthScreen({ onAuthSuccess }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "register") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        // Create user doc in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name,
          email,
          createdAt: new Date().toISOString()
        });

        onAuthSuccess({
          id: userCredential.user.uid,
          email: userCredential.user.email || "",
          name: name
        });
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess({
          id: userCredential.user.uid,
          email: userCredential.user.email || "",
          name: userCredential.user.displayName || "User"
        });
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-sky-200/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-pink-200/30 rounded-full blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/50 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-sky-500 rounded-2xl rotate-12 flex items-center justify-center text-white shadow-lg shadow-sky-200 mb-4">
            <Globe size={32} className="-rotate-12" />
          </div>
          <h1 className="font-nunito font-black text-3xl text-slate-800 tracking-tight">TripPlanner</h1>
          <p className="font-caveat text-slate-500 text-xl">Sign in to start your adventure</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === "register" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <label className="block text-sm font-nunito font-bold text-slate-700 mb-1 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 font-nunito focus:outline-hidden focus:border-sky-300 focus:bg-white transition-all text-slate-800"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-sm font-nunito font-bold text-slate-700 mb-1 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 font-nunito focus:outline-hidden focus:border-sky-300 focus:bg-white transition-all text-slate-800"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-nunito font-bold text-slate-700 mb-1 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                required
                minLength={6}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 font-nunito focus:outline-hidden focus:border-sky-300 focus:bg-white transition-all text-slate-800"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="text-rose-500 text-sm font-nunito font-bold bg-rose-50 p-3 rounded-xl border border-rose-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 text-white font-nunito font-black py-4 rounded-3xl shadow-xl shadow-sky-100 hover:bg-sky-600 active:scale-95 transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? <Loader className="animate-spin" /> : (
              <>
                {mode === "login" ? "Sign In" : "Create Account"}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center bg-slate-50 p-4 rounded-3xl border border-slate-100">
          <p className="font-nunito font-bold text-slate-500 text-sm">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError(null);
              }}
              className="text-sky-500 hover:underline"
            >
              {mode === "login" ? "Sign Up Free" : "Log In"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
