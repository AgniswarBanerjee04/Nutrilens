import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Sparkles, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, Shield, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AuthPageProps {
  initialTab?: "login" | "signup";
  onTabChange?: (tab: "login" | "signup") => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialTab = "login",
  onTabChange,
}) => {
  const { login, register, loginAsDemo } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "signup">(initialTab);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTabSwitch = (tab: "login" | "signup") => {
    setActiveTab(tab);
    setErrorMsg(null);
    if (onTabChange) onTabChange(tab);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(email, password, name);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create account.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] w-full flex items-center justify-center p-4 bg-[#0A0A0A]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full max-w-md my-6"
      >
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#141414] border border-[#2A2A2A] shadow-gold-glow mb-3">
            <Camera className="w-5 h-5 text-[#C5A059]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#F5F5F0]">
            Nutri<span className="text-[#C5A059]">Lens</span>
          </h1>
          <p className="text-xs text-[#888888] mt-1 font-sans">
            Haute Visual Macronutrient & Glycemic Intelligence
          </p>
        </div>

        {/* Main Card (Graphite Glass #141414 with razor-thin #2A2A2A border) */}
        <div className="rounded-3xl p-6 sm:p-7 border border-[#2A2A2A] bg-[#141414] shadow-subtle">
          {/* Side-by-Side Pill Tabs at the top of the auth container */}
          <div className="grid grid-cols-2 p-1 rounded-full bg-[#0A0A0A] border border-[#2A2A2A] mb-6">
            <button
              type="button"
              onClick={() => handleTabSwitch("login")}
              className={`py-2 text-xs font-semibold rounded-full transition-all ${
                activeTab === "login"
                  ? "bg-[#C5A059] text-[#0A0A0A] shadow-gold-glow"
                  : "text-[#888888] hover:text-[#F5F5F0]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch("signup")}
              className={`py-2 text-xs font-semibold rounded-full transition-all ${
                activeTab === "signup"
                  ? "bg-[#C5A059] text-[#0A0A0A] shadow-gold-glow"
                  : "text-[#888888] hover:text-[#F5F5F0]"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Instant Demo Access (Prominent shortcut) */}
          <div className="mb-5">
            <button
              type="button"
              onClick={loginAsDemo}
              className="w-full group flex items-center justify-between px-4 py-3 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#C5A059]/60 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#F5F5F0] block font-serif">
                    Instant Demo Access
                  </span>
                  <span className="text-[10px] text-[#78866B] font-medium font-sans">
                    Bypass authentication & test live dashboard
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#C5A059] group-hover:translate-x-0.5 transition-transform" />
            </button>
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-[#2A2A2A]" />
              <span className="px-3 text-[10px] text-[#888888] uppercase tracking-wider font-medium font-sans">
                Or continue with credentials
              </span>
              <div className="flex-1 border-t border-[#2A2A2A]" />
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-red-950/20 border border-red-900/30 flex items-center gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tabbed Forms wrapped in AnimatePresence with GPU-accelerated opacity & y */}
          <AnimatePresence mode="wait">
            {activeTab === "login" ? (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                onSubmit={handleLoginSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="text-[11px] font-medium text-[#888888] block mb-1.5 font-sans">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patron@nutrilens.ai"
                      className="w-full glass-input pl-10 pr-4 py-2.5 rounded-full text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#888888] block mb-1.5 font-sans">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full glass-input pl-10 pr-4 py-2.5 rounded-full text-xs"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-pill-gold w-full py-3 px-4 flex items-center justify-center gap-2 text-xs font-semibold shadow-gold-glow mt-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="signup-form"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                onSubmit={handleSignupSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="text-[11px] font-medium text-[#888888] block mb-1.5 font-sans">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#888888] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alexander Cole"
                      className="w-full glass-input pl-10 pr-4 py-2.5 rounded-full text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#888888] block mb-1.5 font-sans">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patron@nutrilens.ai"
                      className="w-full glass-input pl-10 pr-4 py-2.5 rounded-full text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#888888] block mb-1.5 font-sans">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full glass-input pl-10 pr-4 py-2.5 rounded-full text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0A0A0A] border border-[#2A2A2A] space-y-1.5 text-[11px] text-[#888888] font-sans">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A059] flex-shrink-0" />
                    <span>Instant AI Vision portion & macro extraction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#78866B] flex-shrink-0" />
                    <span>Post-meal glycemic curve & lipid auditing</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-pill-gold w-full py-3 px-4 flex items-center justify-center gap-2 text-xs font-semibold shadow-gold-glow mt-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-[#888888] mt-6 font-sans">
          Encrypted Authentication &bull; Persistent Storage &bull; Multimodal AI
        </p>
      </motion.div>
    </div>
  );
};
