import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { label: "Features", href: "#features" },
  { label: "Real-Time Sync", href: "#realtime" },
  { label: "SaaS Scaling", href: "#architecture" },
  { label: "Security & Auth", href: "#security" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md border-b border-[#FF5A00]/10 shadow-[0_4px_30px_rgba(255,90,0,0.03)]"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-20 px-6 lg:px-8">
        <a href="#" className="flex items-center gap-2.5 text-2xl font-extrabold text-[#111111] hover:opacity-90 transition-opacity">
          <img
            src="/delycia-logo.jpg"
            alt="Delycia Logo"
            className="h-9 w-9 rounded-xl object-cover shadow-md border border-[#FF5A00]/20"
          />
          <span className="font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FF5A00] to-[#FF8A3D]">
            Delycia
          </span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-semibold text-[#111111]/70 hover:text-[#FF5A00] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="https://drive.google.com/file/d/1D6KFLOOG51B3fCw4lid1eXJDef4AqSFh/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[#111111]/70 hover:text-[#FF5A00] transition-colors px-4 py-2"
          >
            Live Demo
          </a>
          <a
            href="https://cousins.delycia.com/calcutta-delycia"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#FF5A00] text-white px-6 py-3 rounded-full text-sm font-bold shadow-[0_4px_20px_rgba(255,90,0,0.25)] hover:bg-[#FF8A3D] hover:shadow-[0_4px_25px_rgba(255,90,0,0.35)] transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Launch App <ArrowRight size={14} />
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-[#111111] hover:text-[#FF5A00] transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white border-b border-[#FF5A00]/10 shadow-xl overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-base font-semibold text-[#111111]/80 py-2 px-3 rounded-xl hover:bg-[#FFF7F2] hover:text-[#FF5A00] transition-all"
                >
                  {l.label}
                </a>
              ))}
              <hr className="border-[#FF5A00]/10 my-2" />
              <div className="flex flex-col gap-3">
                <a
                  href="https://drive.google.com/file/d/1D6KFLOOG51B3fCw4lid1eXJDef4AqSFh/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="text-center font-semibold text-[#111111]/80 py-3 rounded-xl hover:bg-[#FFF7F2] transition-all"
                >
                  Live Demo
                </a>
                <a
                  href="https://cousins.delycia.com/calcutta-delycia"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 bg-[#FF5A00] text-white text-center py-3.5 rounded-full font-bold shadow-[0_4px_20px_rgba(255,90,0,0.2)]"
                >
                  Launch App <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
