import { motion } from "framer-motion";
import { Check, Play, Smartphone } from "lucide-react";

const trust = ["100% Free & Open-Source", "Zero setup costs", "Self-serve instadeploy"];

export default function FinalCTA() {
  return (
    <section className="py-24 bg-[#FFFFFF] relative overflow-hidden" id="contact">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[#FF5A00]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-8 max-w-6xl relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-[#FFF7F2] to-[#FFFFFF] border border-[#FF5A00]/15 rounded-[32px] p-10 sm:p-16 shadow-[0_20px_50px_rgba(255,90,0,0.04)] space-y-8"
        >
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#FF5A00]/10 shadow-sm select-none">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[#FF5A00] animate-pulse" />
            <span className="text-[9px] font-black text-[#FF5A00] uppercase tracking-widest">
              Ready to Upgrade Operations?
            </span>
          </div>

          {/* Main Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111111] tracking-tight leading-[1.1]">
            Coordinate Your Entire Restaurant.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5A00] to-[#FF8A3D]">
              Under One Console.
            </span>
          </h2>

          {/* Subtext */}
          <p className="text-sm sm:text-base text-[#111111]/55 leading-relaxed font-semibold max-w-xl mx-auto">
            Get started in under two minutes. Launch contactless QR menus, live kitchen queues, and scale your restaurant locations with sub-second event coordination.
          </p>

          {/* CTAs matching user requirements: Watch Video Demo and Launch Client App */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Button 1: Watch Video Demo (Google Drive Link) */}
            <a
              href="https://drive.google.com/file/d/1D6KFLOOG51B3fCw4lid1eXJDef4AqSFh/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 bg-[#FF5A00] hover:bg-[#FF7A30] text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-wider shadow-[0_6px_20px_rgba(255,90,0,0.2)] hover:shadow-[0_8px_25px_rgba(255,90,0,0.25)] transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Play size={13} className="fill-current text-white shrink-0" /> 
              Watch Video Demo
            </a>

            {/* Button 2: Launch Client App (Cousins Link) */}
            <a
              href="https://cousins.delycia.com/calcutta-delycia"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 border border-[#111111]/10 bg-white hover:bg-[#FFF7F2] hover:border-[#FF5A00]/30 text-[#111111] hover:text-[#FF5A00] px-8 py-4 rounded-full font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-sm"
            >
              <Smartphone size={13} className="shrink-0" /> 
              Launch Client App
            </a>
          </div>

          {/* Trust bullets */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 pt-6 border-t border-[#FF5A00]/10 select-none">
            {trust.map((t) => (
              <span key={t} className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#111111]/45">
                <Check size={14} className="text-[#FF5A00] stroke-[4]" /> {t}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
