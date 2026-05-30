import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

const faqs = [
  {
    short: "Real-time Sync?",
    q: "How does the real-time synchronization work?",
    a: "Delycia utilizes Socket.IO events and Redis session queues on the Express server. When an order is placed, an immediate payload is broadcast to connected waiter tablets and KDS monitors in under 200ms, entirely eliminating page reloads.",
    coords: { x: 50, y: 10 }, // Top
    style: "-translate-x-1/2 -translate-y-full mb-3"
  },
  {
    short: "No Hardware?",
    q: "Is any special hardware required?",
    a: "No special proprietary terminal is required! Customers scan QR codes using any standard iOS or Android smartphone browser. Kitchen managers and waitstaff can operate the administrative panels on normal iPads, Android tablets, or laptops.",
    coords: { x: 86, y: 28 }, // Top Right
    style: "translate-x-3 -translate-y-1/2"
  },
  {
    short: "BFF Security?",
    q: "What is BFF architecture and how does it protect my data?",
    a: "BFF stands for Backend-for-Frontend. Delycia routes API requests through a secure TanStack Start server proxy. Critical JWT access tokens are stored in secure httpOnly cookies, meaning they are completely invisible to client-side scripts and XSS leaks.",
    coords: { x: 86, y: 72 }, // Bottom Right
    style: "translate-x-3 -translate-y-1/2"
  },
  {
    short: "Multi-location?",
    q: "Does Delycia support multiple locations?",
    a: "Yes! Delycia is a true multi-tenant system. In our Enterprise Tier, restaurant owners can manage multiple distinct physical outlets, shared menus, and centralized financial analytics under a single global administrative account.",
    coords: { x: 50, y: 90 }, // Bottom
    style: "-translate-x-1/2 mt-3"
  },
  {
    short: "Database SLA?",
    q: "What database guarantees does Delycia offer?",
    a: "Delycia utilizes a highly robust MariaDB database pool alongside Redis caching. Each restaurant's data is isolated using strict index scoping, ensuring zero data crosstalk, fast query speeds, and production-grade session backups.",
    coords: { x: 14, y: 72 }, // Bottom Left
    style: "-translate-x-full -translate-y-1/2 -mr-3"
  },
  {
    short: "Receipt Printing?",
    q: "How do I print receipt invoices?",
    a: "Delycia's admin panels interface with standard network-based thermal receipt printers (ESC/POS) via local network triggers, allowing waitstaff to automatically print kitchen tickets and customer bills with a single click.",
    coords: { x: 14, y: 28 }, // Top Left
    style: "-translate-x-full -translate-y-1/2 -mr-3"
  }
];

export default function FAQSection() {
  const [activeFaq, setActiveFaq] = useState<number>(0);

  return (
    <section className="py-24 bg-[#FFFFFF] relative overflow-hidden select-none">
      {/* Soft ambient background blurs */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-[#FFF7F2] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-[#FF5A00]/3 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-8 max-w-5xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF7F2] border border-[#FF5A00]/15 shadow-sm">
            <HelpCircle size={11} className="text-[#FF5A00]" />
            <span className="text-[10px] font-black text-[#FF5A00] uppercase tracking-widest">
              Have Questions?
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111111] tracking-tight">
            Operational FAQs
          </h2>
          <p className="text-base sm:text-lg text-[#111111]/55 max-w-2xl mx-auto font-medium leading-relaxed">
            Understand Delycia's architecture, security protocols, and operational workflows through our interactive database network map.
          </p>
        </div>

        {/* ========================================== */}
        {/* DESKTOP VIEW: Cybernetic Spider-Web Constellation */}
        {/* ========================================== */}
        <div className="hidden md:flex flex-col items-center">
          
          {/* Main Web Sandbox Container */}
          <div className="relative w-[500px] h-[500px] flex items-center justify-center overflow-visible select-none shrink-0 mb-6">
            
            {/* SVG Spider Web Background Network Overlay */}
            <svg 
              viewBox="0 0 100 100" 
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
            >
              {/* Concentric Polygon Ring 1 (Inner) */}
              <polygon
                points="50,25 69,34 69,63 50,72 31,63 31,34"
                fill="none"
                stroke="rgba(255, 90, 0, 0.08)"
                strokeWidth="0.35"
              />

              {/* Concentric Polygon Ring 2 (Middle) */}
              <polygon
                points="50,17 76,28 76,68 50,82 24,68 24,28"
                fill="none"
                stroke="rgba(255, 90, 0, 0.05)"
                strokeWidth="0.3"
              />

              {/* Concentric Polygon Ring 3 (Outer) */}
              <polygon
                points="50,10 86,28 86,72 50,90 14,72 14,28"
                fill="none"
                stroke="rgba(255, 90, 0, 0.03)"
                strokeWidth="0.25"
              />

              {/* Static web structure lines radiating from center (50, 50) */}
              {faqs.map((f, idx) => (
                <line
                  key={`line-${idx}`}
                  x1="50"
                  y1="50"
                  x2={f.coords.x}
                  y2={f.coords.y}
                  stroke="rgba(255, 90, 0, 0.08)"
                  strokeWidth="0.4"
                  strokeDasharray="1,1"
                />
              ))}

              {/* Dynamic glowing active connection signal line */}
              <AnimatePresence>
                {activeFaq !== null && (
                  <motion.line
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    exit={{ pathLength: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    x1="50"
                    y1="50"
                    x2={faqs[activeFaq].coords.x}
                    y2={faqs[activeFaq].coords.y}
                    stroke="#FF5A00"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_4px_#FF5A00]"
                  />
                )}
              </AnimatePresence>
            </svg>

            {/* CENTRAL NODE: Operational FAQs Orb */}
            <div className="absolute w-[150px] h-[150px] rounded-full bg-gradient-to-br from-[#FFF7F2] via-white to-[#FFF7F2] border border-[#FF5A00]/25 shadow-[0_12px_45px_rgba(255,90,0,0.06),_inset_0_0_20px_rgba(255,90,0,0.03)] flex flex-col items-center justify-center z-20 select-none text-center p-3.5">
              <span className="text-[7.5px] font-black text-[#FF5A00] tracking-widest uppercase">FAQ Core</span>
              <h3 className="text-sm font-black text-[#111111] mt-1 leading-tight uppercase tracking-tight">Database<br />Web Map</h3>
              <span className="inline-flex items-center gap-1 mt-1 text-[7px] font-bold text-[#111111]/35 tracking-wider uppercase">
                <Sparkles size={8} className="text-[#FF5A00]" /> Select Node
              </span>
            </div>

            {/* PERIPHERAL QUESTION NODES */}
            {faqs.map((f, idx) => {
              const isActive = activeFaq === idx;
              return (
                <div
                  key={`node-${idx}`}
                  style={{
                    position: "absolute",
                    top: `${f.coords.y}%`,
                    left: `${f.coords.x}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  className="z-30 select-none"
                >
                  {/* Glowing Node Point */}
                  <button
                    onClick={() => setActiveFaq(idx)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 relative focus:outline-none ${
                      isActive 
                        ? "bg-[#FF5A00] text-white scale-110 shadow-[0_0_15px_#FF5A00] border border-[#FF5A00]/15" 
                        : "bg-white text-[#111111]/60 hover:text-[#FF5A00] border border-[#FF5A00]/15 hover:border-[#FF5A00]/40 hover:scale-105 shadow-sm"
                    }`}
                  >
                    <span className="text-[10px] font-black">{idx + 1}</span>
                    {isActive && (
                      <span className="absolute -inset-1 rounded-full border border-[#FF5A00]/30 animate-ping pointer-events-none" />
                    )}
                  </button>

                  {/* Peripheral Short Label */}
                  <div 
                    style={{ position: "absolute" }}
                    className={`whitespace-nowrap ${f.style} pointer-events-none select-none`}
                  >
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border shadow-sm transition-all duration-300 uppercase tracking-wider ${
                      isActive 
                        ? "bg-[#FFF7F2] border-[#FF5A00]/30 text-[#FF5A00] font-black" 
                        : "bg-white/95 border-neutral-100 text-[#111111]/55"
                    }`}>
                      {f.short}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic HUD Constellation Answer Panel */}
          <div className="w-full max-w-2xl select-none mt-2">
            <AnimatePresence mode="wait">
              {activeFaq !== null && (
                <motion.div
                  key={`ans-${activeFaq}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="bg-white/80 backdrop-blur-sm border border-[#FF5A00]/15 rounded-3xl p-6 shadow-[0_12px_40px_rgba(255,90,0,0.03)] text-left space-y-3 relative overflow-hidden"
                >
                  {/* Glare sheen */}
                  <div className="absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b from-[#FF5A00] to-[#FF8A3D]" />
                  
                  {/* Header metadata */}
                  <div className="flex justify-between items-center pl-2">
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest flex items-center gap-1 select-none font-mono">
                      🟢 NODE SYNC ACTIVE
                    </span>
                    <span className="text-[9px] font-black text-[#111111]/30 font-mono">
                      INDEX_ID: faq_core_0{activeFaq + 1}
                    </span>
                  </div>

                  {/* Question */}
                  <h4 className="text-sm sm:text-base font-black text-[#111111] pl-2 flex items-start gap-2 leading-snug">
                    <span className="text-[#FF5A00] shrink-0 font-mono">Q:</span>
                    <span>{faqs[activeFaq].q}</span>
                  </h4>

                  {/* Answer */}
                  <p className="text-xs sm:text-[13.5px] font-medium text-[#111111]/55 leading-relaxed pl-6 pr-2 select-text">
                    {faqs[activeFaq].a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ========================================== */}
        {/* MOBILE VIEW: Cohesive List Node Accordion */}
        {/* ========================================== */}
        <div className="md:hidden space-y-4 max-w-md mx-auto">
          {faqs.map((f, i) => {
            const isActive = activeFaq === i;
            return (
              <div
                key={`mob-${i}`}
                className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isActive 
                    ? "border-[#FF5A00]/30 shadow-[0_8px_25px_rgba(255,90,0,0.04)]" 
                    : "border-neutral-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                }`}
              >
                {/* Accordion header button */}
                <button
                  onClick={() => setActiveFaq(isActive ? 0 : i)}
                  className="w-full text-left p-4 flex items-center justify-between gap-3 focus:outline-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-6 h-6 rounded-lg font-black text-[10px] flex items-center justify-center shrink-0 border transition-all ${
                      isActive 
                        ? "bg-[#FF5A00] border-[#FF5A00]/15 text-white" 
                        : "bg-neutral-50 border-neutral-100 text-[#111111]/50"
                    }`}>
                      {i + 1}
                    </span>
                    <span className={`text-[12.5px] font-black leading-snug truncate ${
                      isActive ? "text-[#FF5A00]" : "text-[#111111]"
                    }`}>
                      {f.q}
                    </span>
                  </div>
                  
                  {/* Arrow Indicator */}
                  <ArrowRight 
                    size={14} 
                    className={`text-[#FF5A00] transition-transform duration-300 ${
                      isActive ? "rotate-90" : "rotate-0"
                    }`}
                  />
                </button>

                {/* Expanded Answer Content */}
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-4 pb-4 pt-1 text-[11.5px] font-semibold text-[#111111]/55 leading-relaxed pl-12 border-t border-dashed border-neutral-100 select-text">
                        {f.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
