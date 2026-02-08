import { motion } from "framer-motion";
import { Check, Play } from "lucide-react";
import heroMockup from "@/assets/hero-mockup.png";

const trust = ["No credit card required", "2-minute setup", "Cancel anytime"];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center gradient-light overflow-hidden pt-16">
      {/* BG decoration */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/30 blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center py-12 lg:py-0">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-foreground">
            Transform Your Restaurant with{" "}
            <span className="gradient-text">AI-Powered</span> Digital Ordering
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            Turn every table into a smart dining experience with QR-code ordering, real-time analytics, and AI recommendations.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#pricing"
              className="gradient-primary text-primary-foreground px-8 py-4 rounded-full font-semibold text-base hover:opacity-90 transition-opacity animate-pulse-glow inline-block"
            >
              Start 14-Day Free Trial
            </a>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 border-2 border-primary text-primary px-8 py-4 rounded-full font-semibold text-base hover:bg-primary/5 transition-colors"
            >
              <Play size={18} fill="currentColor" /> Watch Demo
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {trust.map((t) => (
              <span key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check size={16} className="text-primary" /> {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Right */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 flex justify-center"
        >
          <div className="relative">
            <img
              src={heroMockup}
              alt="Delycia restaurant ordering interface"
              className="w-full max-w-md rounded-2xl drop-shadow-2xl"
              loading="eager"
            />
            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 glass px-4 py-2 rounded-xl shadow-lg"
            >
              <span className="text-sm font-bold text-primary">+35% Revenue</span>
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-12 -left-6 glass px-4 py-2 rounded-xl shadow-lg"
            >
              <span className="text-sm font-bold text-primary">2min Setup</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
