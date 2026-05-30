import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, RefreshCw, KeyRound, Key, Database, Check } from "lucide-react";

export default function SecurityAuth() {
  const [tokenTime, setTokenTime] = useState(15);
  const [tokenStatus, setTokenStatus] = useState<"VALID" | "REFRESHING" | "RENEWED">("VALID");

  // Simulate token expiry & silent refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setTokenTime((prev) => {
        if (prev <= 1) {
          setTokenStatus("REFRESHING");
          setTimeout(() => {
            setTokenStatus("RENEWED");
            setTokenTime(15);
            setTimeout(() => setTokenStatus("VALID"), 2000);
          }, 1500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="security" className="py-24 bg-[#FFF7F2]/40 border-y border-[#FF5A00]/5 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-[#FF5A00]/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <span className="text-xs font-black tracking-widest text-[#FF5A00] uppercase block">
            Enterprise Security & BFF Auth
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111111] tracking-tight">
            Production-Grade Authentication
          </h2>
          <p className="text-base sm:text-lg text-[#111111]/60 font-medium">
            Your restaurant data is protected with a state-of-the-art Backend-for-Frontend (BFF) security layer. Tokens are never exposed to client-side scripts.
          </p>
        </div>

        {/* Dynamic Security Layout */}
        <div className="grid lg:grid-cols-12 gap-16 max-w-5xl mx-auto items-center">
          {/* Left Column: Visual Authorization Panel */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#FFFFFF] rounded-3xl border border-[#FF5A00]/10 shadow-[0_15px_40px_rgba(255,90,0,0.03)] p-6 relative">
              {/* Top Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-[#111111]/5 mb-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-emerald-500" size={18} />
                  <span className="text-xs font-black text-[#111111]">BFF JWT Token Console</span>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-md">
                  Active Security
                </span>
              </div>

              {/* Token Display Boxes */}
              <div className="space-y-4">
                {/* Access Token */}
                <div className="bg-[#F5F5F7] rounded-2xl p-4 border border-[#111111]/5 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Key className="text-[#FF5A00]" size={14} />
                      <span className="text-xs font-bold text-[#111111]/80">access_token (BFF Cookie)</span>
                    </div>
                    <span className="flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-black text-emerald-600 bg-emerald-50 rounded-md border border-emerald-100">
                      <Lock size={10} /> httpOnly
                    </span>
                  </div>
                  <code className="text-[10px] text-[#111111]/55 block truncate font-mono">
                    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfMGExMmIzIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzE2OTky...
                  </code>

                  {/* Token validity counter */}
                  <div className="mt-3 flex items-center justify-between text-[10px] font-black uppercase text-[#111111]/40">
                    <span>Token Lifetime: 15 min</span>
                    <span
                      className={`transition-colors duration-300 ${
                        tokenStatus === "REFRESHING" ? "text-amber-500" : "text-[#FF5A00]"
                      }`}
                    >
                      Expires in: {tokenTime}s
                    </span>
                  </div>
                </div>

                {/* Refresh Token */}
                <div className="bg-[#F5F5F7] rounded-2xl p-4 border border-[#111111]/5 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <KeyRound className="text-[#FF8A3D]" size={14} />
                      <span className="text-xs font-bold text-[#111111]/80">refresh_token (Double DB + Redis)</span>
                    </div>
                    <span className="flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-black text-emerald-600 bg-emerald-50 rounded-md border border-emerald-100">
                      <Lock size={10} /> httpOnly
                    </span>
                  </div>
                  <code className="text-[10px] text-[#111111]/55 block truncate font-mono">
                    delycia:session:7b1e9c2a-8f4b-4c2d-9e6b-a1b2c3d4e5f6
                  </code>
                  <div className="mt-3 text-[10px] font-black uppercase text-[#111111]/40 flex items-center gap-2">
                    <Database size={10} className="text-[#FF8A3D]" /> Cached on Redis (30 Day TTL)
                  </div>
                </div>
              </div>

              {/* Bottom Alert/Status Bar */}
              <AnimatePresence mode="wait">
                {tokenStatus === "VALID" && (
                  <motion.div
                    key="valid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-2 text-emerald-600 text-xs font-bold"
                  >
                    <ShieldCheck size={14} /> Session Verified. Access Token valid.
                  </motion.div>
                )}
                {tokenStatus === "REFRESHING" && (
                  <motion.div
                    key="refreshing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center gap-2 text-amber-600 text-xs font-bold"
                  >
                    <RefreshCw size={14} className="animate-spin" /> Silent Token Refresh Coordinator triggered...
                  </motion.div>
                )}
                {tokenStatus === "RENEWED" && (
                  <motion.div
                    key="renewed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center gap-2 text-blue-600 text-xs font-bold"
                  >
                    <Check size={14} className="stroke-[3]" /> Token coordination success. Session extended.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Descriptions */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight leading-tight">
              BFF Architecture Built For Zero-Leak Security.
            </h3>
            <p className="text-sm sm:text-base text-[#111111]/60 leading-relaxed font-semibold">
              Modern frontend apps that store tokens in `localStorage` are vulnerable to XSS token leaks. Delycia routes all access tokens through httpOnly cookies, preventing any client-side JavaScript access.
            </p>

            <ul className="space-y-4">
              <li className="flex items-start gap-2.5">
                <div className="mt-0.5 bg-[#FFF7F2] p-1 rounded-md border border-[#FF5A00]/10 text-[#FF5A00]">
                  <Check size={14} className="stroke-[3]" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[#111111]/70 leading-relaxed">
                  **Dual-Token Strategy**: 15-minute access tokens mapped with 30-day long-lived refresh tokens.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="mt-0.5 bg-[#FFF7F2] p-1 rounded-md border border-[#FF5A00]/10 text-[#FF5A00]">
                  <Check size={14} className="stroke-[3]" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[#111111]/70 leading-relaxed">
                  **Deduplicated Silent Refresh**: A dedicated server-side `RefreshCoordinator` singleton prevents duplicate network refresh attempts.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="mt-0.5 bg-[#FFF7F2] p-1 rounded-md border border-[#FF5A00]/10 text-[#FF5A00]">
                  <Check size={14} className="stroke-[3]" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[#111111]/70 leading-relaxed">
                  **80% Lower Database Load**: Redis token caching stores verification states for 5 seconds, avoiding expensive DB scans on consecutive REST requests.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
