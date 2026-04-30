"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { usePasswordStrength } from "@/hooks/usePasswordStrength";

export default function AuthModal({ isOpen, onClose, supabase }) {
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const strength = usePasswordStrength(password);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin /* never accept user-controlled input here — open redirect risk */ },
    });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    let result;
    if (authMode === "signup") {
      result = await supabase.auth.signUp({ email, password });
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    if (result.error) {
      setAuthError(
        authMode === "signup"
          ? "Could not create account. Please check your details and try again."
          : "Invalid email or password. Please try again."
      );
    } else {
      onClose();
      if (authMode === "signup") {
        toast.success("Signup successful! Please check your email for verification.");
      }
    }
    setAuthLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-amber-400 to-red-500" />
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase text-center mb-6">
              {authMode === "login" ? "Welcome Back" : "Join the Draft"}
            </h2>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1 ml-1"
                >
                  Email
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 bg-black/50 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-amber-400 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label
                  htmlFor="auth-password"
                  className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1 ml-1"
                >
                  Password
                </label>
                <input
                  id="auth-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 bg-black/50 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-amber-400 transition-colors"
                  placeholder="••••••••"
                />
                {authMode === "signup" && strength && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <div
                          key={n}
                          className={`h-1 flex-1 rounded-full transition-colors ${n <= strength.level ? strength.color : "bg-white/10"}`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-bold ml-1 ${strength.color.replace("bg-", "text-")}`}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              {authError && (
                <div className="text-red-400 text-xs font-bold bg-red-400/10 border border-red-400/20 p-3 rounded-xl text-center">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full h-12 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {authLoading ? "Processing..." : authMode === "login" ? "Sign In" : "Sign Up"}
              </button>
            </form>

            <div className="relative py-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-white/10" />
              </div>
              <span className="relative bg-slate-900 px-4 text-xs font-bold text-white/30 uppercase tracking-widest">
                Or
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-label="Google" role="img">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === "login" ? "signup" : "login");
                  setAuthError("");
                }}
                className="text-xs font-bold text-white/50 hover:text-white transition-colors uppercase tracking-widest"
              >
                {authMode === "login"
                  ? "Don't have an account? Sign Up"
                  : "Already have an account? Sign In"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
