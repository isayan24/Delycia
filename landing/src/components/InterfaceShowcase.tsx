import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Monitor, ChevronRight, Check } from "lucide-react";

export default function InterfaceShowcase() {
  const [activeTab, setActiveTab] = useState<"menu" | "customizer">("menu");

  const desktopImage =
    activeTab === "menu"
      ? "/mockups/delycia-mockup2.png"
      : "/mockups/delycia-mockup3.png";

  return (
    <section className="py-24 bg-[#FFF7F2]/40 border-y border-[#FF5A00]/5 relative overflow-hidden">
      {/* Background blurs */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-[#FF5A00]/3 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-[#FF8A3D]/4 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <span className="text-xs font-black tracking-widest text-[#FF5A00] uppercase block">
            Customer Application Showcase
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111111] tracking-tight">
            Frictionless Ordering Interfaces
          </h2>
          <p className="text-base sm:text-lg text-[#111111]/60 font-medium">
            Explore the actual user interface of the Delycia client-side application. Optimized for microsecond-latency browsing on both mobile and desktop screens.
          </p>
        </div>

        {/* Dual Mockup Showcase Grid */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 max-w-6xl mx-auto items-center">
          
          {/* LEFT SIDE: Customer Mobile Screen */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-5 flex flex-col items-center relative"
          >
            <span className="text-xs font-black text-[#FF5A00] uppercase tracking-widest bg-white border border-[#FF5A00]/15 px-3.5 py-1.5 rounded-full mb-6 shadow-sm z-10 flex items-center gap-1.5">
              <Smartphone size={12} /> Contactless Mobile Interface
            </span>

            {/* Mobile Hardware Frame Shell */}
            <div className="relative w-full max-w-[290px] bg-slate-900 rounded-[48px] p-2.5 shadow-[0_25px_60px_rgba(255,90,0,0.08)] border-1 border-slate-800/80">
              
              {/* Speaker Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5.5 bg-slate-900 rounded-full z-20 flex items-center justify-center">
                <span className="w-10 h-2 bg-slate-900 rounded-full block mb-1" />
              </div>

              {/* Mobile Screen Image */}
              <div className="overflow-hidden rounded-[38px] border-2 border-slate-950 aspect-[9/20.2] bg-white relative">
                <img
                  src="/mockups/delycia-mockup1.png"
                  alt="Delycia Mobile Interface"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Home bar indicator */}
            </div>
          </motion.div>

          {/* RIGHT SIDE: Operations Desktop Screen */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Header controls & Tab switches */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs font-black text-[#FF5A00] uppercase tracking-widest bg-white border border-[#FF5A00]/15 px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 self-start">
                <Monitor size={12} /> Desktop Core Navigation
              </span>

              {/* Desktop View Selectors */}
              <div className="flex gap-2 bg-[#F5F5F7] p-1 rounded-xl border border-[#111111]/5 self-start sm:self-auto">
                <button
                  onClick={() => setActiveTab("menu")}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
                    activeTab === "menu"
                      ? "bg-white text-[#111111] shadow-sm border border-[#111111]/5"
                      : "text-[#111111]/55 hover:text-[#111111]"
                  }`}
                >
                  Menu & Categories
                </button>
                <button
                  onClick={() => setActiveTab("customizer")}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
                    activeTab === "customizer"
                      ? "bg-white text-[#111111] shadow-sm border border-[#111111]/5"
                      : "text-[#111111]/55 hover:text-[#111111]"
                  }`}
                >
                  Dishes & Options
                </button>
              </div>
            </div>

            {/* Desktop Monitor Frame Mock */}
            <div className="relative w-full">
              {/* Monitor Shell */}
              <div className="bg-slate-400 rounded-[28px] p-2.5 shadow-[0_25px_60px_rgba(255,90,0,0.08)] border-2 border-slate-400">
                {/* Screen Outer Bezel Wrapper */}
                <div className="bg-white rounded-xl overflow-hidden relative">
                  
                  {/* Browser Header Bar */}
                  <div className="bg-slate-50 border-b border-[#111111]/5 px-4.5 py-3 flex items-center justify-between gap-4">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A00]/25" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A3D]/25" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/25" />
                    </div>
                    <div className="bg-white border border-[#111111]/5 px-4 py-1.5 rounded-lg text-[9px] font-bold text-[#111111]/40 w-full max-w-sm truncate text-center">
                      https://cousins.delycia.com/calcutta-delycia
                    </div>
                    <div className="flex gap-1.5 opacity-0 sm:opacity-100">
                      <span className="w-3.5 h-3.5 rounded bg-slate-200 block" />
                      <span className="w-3.5 h-3.5 rounded bg-slate-200 block" />
                    </div>
                  </div>

                  {/* Browser Main Image Container */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={desktopImage}
                        src={desktopImage}
                        alt="Delycia Desktop Interface"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full object-cover"
                      />
                    </AnimatePresence>
                  </div>

                </div>

                {/* Monitor Bottom Chin Bezel */}
                <div className="h-2 bg-slate-400 border-t border-slate-400/80 flex items-center justify-center rounded-b-[20px] mt-1 relative">
                </div>
              </div>

              {/* Monitor Stand Base & Neck */}
              <div className="relative z-0 mt-[0px]">
                {/* Neck */}
                <div
                  className="w-16 h-12 bg-gradient-to-b from-slate-300 to-slate-400/90 mx-auto shadow-inner"
                  style={{ clipPath: "polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)" }}
                />
                {/* Base Plate */}
                <div className="w-40 h-2.5 bg-gradient-to-r from-slate-300   to-slate-400 rounded-t-md mx-auto shadow-lg" />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
