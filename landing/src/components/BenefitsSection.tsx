import { motion } from "framer-motion";
import { Zap, IndianRupee, Target, Timer } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useCountUp } from "@/hooks/useCountUp";

const benefits = [
  { icon: Zap, value: 30, suffix: "%", label: "Faster Service", desc: "Reduce wait times and serve more customers" },
  { icon: IndianRupee, value: 50, prefix: "₹", suffix: "K+", label: "Extra Revenue/Month", desc: "Average revenue increase per restaurant" },
  { icon: Target, value: 95, suffix: "%+", label: "Order Accuracy", desc: "Eliminate manual order errors" },
  { icon: Timer, value: 2, suffix: " Min", label: "Setup Time", desc: "Get started in minutes, not days" },
];

function BenefitCard({ b, index, isVisible }: { b: typeof benefits[0]; index: number; isVisible: boolean }) {
  const count = useCountUp(b.value, 2000, isVisible);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="text-center"
    >
      <b.icon className="mx-auto mb-4 text-primary" size={32} />
      <p className="text-4xl sm:text-5xl font-extrabold text-foreground">
        {b.prefix}{count}{b.suffix}
      </p>
      <p className="font-bold text-foreground mt-2">{b.label}</p>
      <p className="text-sm text-muted-foreground mt-1">{b.desc}</p>
    </motion.div>
  );
}

export default function BenefitsSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="section-padding bg-secondary">
      <div className="container mx-auto px-4" ref={ref}>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-4 text-foreground">
          Why Restaurant Owners <span className="gradient-text">Love Delycia</span>
        </h2>
        <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto">
          Real results from real restaurants
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-5xl mx-auto">
          {benefits.map((b, i) => (
            <BenefitCard key={b.label} b={b} index={i} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}
