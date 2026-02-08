import { motion } from "framer-motion";
import { ScanLine, Smartphone, TrendingUp } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const steps = [
  {
    icon: ScanLine,
    step: "01",
    title: "Scan QR Code",
    desc: "Customers scan the smart box QR at their table — no app download needed.",
  },
  {
    icon: Smartphone,
    step: "02",
    title: "Browse & Order",
    desc: "AI suggests dishes based on preferences. Customers order instantly from their phone.",
  },
  {
    icon: TrendingUp,
    step: "03",
    title: "Track & Manage",
    desc: "You get real-time orders, analytics, and insights — all from one dashboard.",
  },
];

export default function HowItWorks() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="how-it-works" className="section-padding gradient-light">
      <div className="container mx-auto px-4" ref={ref}>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-4 text-foreground">
          One Platform. <span className="gradient-text">Complete Control.</span>
        </h2>
        <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto">
          Get started in three simple steps
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="glass p-8 rounded-2xl text-center hover-glow group"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <s.icon className="text-primary-foreground" size={28} />
              </div>
              <span className="text-xs font-bold text-primary tracking-widest uppercase">
                Step {s.step}
              </span>
              <h3 className="font-bold text-xl mt-2 mb-3 text-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
