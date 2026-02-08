import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const trust = ["No credit card required", "2-minute setup", "Cancel anytime"];

export default function FinalCTA() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="section-padding gradient-primary relative overflow-hidden" id="contact">
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark opacity-90" />
      <div className="container mx-auto px-4 relative z-10 text-center" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary-foreground mb-4">
            Ready to Transform Your Restaurant?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join 200+ restaurants using Delycia. Start your free trial today.
          </p>
          <a
            href="#pricing"
            className="inline-block bg-primary-foreground text-primary px-10 py-4 rounded-full font-bold text-base hover:opacity-90 transition-opacity"
          >
            Start Free Trial Now
          </a>
          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {trust.map((t) => (
              <span key={t} className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Check size={14} /> {t}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
