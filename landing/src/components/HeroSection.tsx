import { motion } from "framer-motion";
import { Check, ArrowRight, Play, ShieldCheck } from "lucide-react";

const trust = ["No credit card required", "Multi-tenant ready", "Sub-second sync latency"];

export default function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-start bg-[#FFFFFF] overflow-hidden pt-36 pb-4">
      {/* Premium Gradient Background Blurs (Sky-Blue on left, Brand-Orange on right) */}
      <div className="absolute top-[-5%] left-[-15%] w-[650px] h-[650px] rounded-full bg-sky-400/6 blur-[130px] pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#FF5A00]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[25%] w-[500px] h-[500px] rounded-full bg-[#FFF7F2] blur-[100px] pointer-events-none" />

      {/* Vibrant Glowing Orange Ambient Light Circles */}
      <div className="absolute top-[22%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#FF5A00]/8 blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute top-[45%] left-[10%] w-[220px] h-[220px] rounded-full bg-[#FF8A3D]/6 blur-[80px] pointer-events-none" />
      <div className="absolute top-[35%] right-[12%] w-[240px] h-[240px] rounded-full bg-[#FF5A00]/5 blur-[90px] pointer-events-none" />

      {/* Sleek, High-Fidelity Square Tech-Grid Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(17,17,17,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,17,17,0.03)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,black_70%,transparent_100%)] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-8 flex flex-col items-center text-center relative z-10 max-w-5xl space-y-8">
        
        {/* Tagline Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF7F2] border border-[#FF5A00]/15 shadow-[0_2px_10px_rgba(255,90,0,0.03)]"
        >
          <span className="flex h-2 w-2 rounded-full bg-[#FF5A00] animate-pulse" />
          <span className="text-xs font-bold text-[#FF5A00] uppercase tracking-wider">
            Real-Time Restaurant Operating Suite
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.05] text-[#111111] max-w-4xl"
        >
          Run Your Restaurant in{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5A00] via-[#FF8A3D] to-[#FF5A00] bg-size-200 animate-gradient-text">
            Real-Time.
          </span>
        </motion.h1>

        {/* Supporting Text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-md sm:text-xl text-[#111111]/50 leading-relaxed max-w-3xl font-medium"
        >
          A high-performance, multi-tenant operating system coordinating contactless QR ordering, live kitchen streams, and robust staff coordination — engineered for scaling.
        </motion.p>        {/* CTAs */}
        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-5 items-center justify-center pt-4"
        >
          {/* Primary CTA - Start Free Trial */}
          <div className="relative group">
            {/* Soft breathing shadow blur behind button */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#FF5A00] to-[#FF8A3D] opacity-25 blur-lg group-hover:opacity-55 transition duration-300 group-hover:scale-105" />
            <a
              href="https://cousins.delycia.com/calcutta-delycia"
              target="_blank"
              className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF5A00] via-[#FF7A30] to-[#FF5A00] bg-size-200 hover:bg-right text-white font-extrabold tracking-wider text-xs uppercase px-8 py-4 rounded-full shadow-[0_8px_30px_rgba(255,90,0,0.22)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 transform hover:-translate-y-0.5"
            >
              Launch App 
              <ArrowRight size={16} className="transform group-hover:translate-x-1.5 transition-transform duration-300" />
            </a>
          </div>

          {/* Secondary CTA - Explore Live Demo */}
          <a
            href="https://drive.google.com/file/d/1D6KFLOOG51B3fCw4lid1eXJDef4AqSFh/view?usp=sharing"
            target="_blank"
            className="group flex items-center justify-center gap-2 border border-[#111111]/10 bg-white/60 backdrop-blur-sm hover:bg-[#FFF7F2] text-[#111111] hover:text-[#FF5A00] hover:border-[#FF5A00]/30 font-bold px-8 py-4 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <Play size={14} className="fill-current text-[#111111] group-hover:text-[#FF5A00] transition-colors duration-300" /> 
            Live Demo
          </a>
        </motion.div>

        {/* Trust points */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap gap-x-8 gap-y-3 justify-center pt-2"
        >
          {trust.map((t) => (
            <span key={t} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#111111]/50">
              <Check size={14} className="text-[#FF5A00]" /> {t}
            </span>
          ))}
        </motion.div>

        {/* Large Centered Premium Dashboard Mockup Container with Generous Spacing */}
       
      </div>
    </section>
  );
}
