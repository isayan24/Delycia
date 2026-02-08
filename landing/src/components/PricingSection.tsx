import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const plans = [
  {
    name: "Free Trial",
    price: "₹0",
    period: "/ 14 days",
    badge: null,
    featured: false,
    features: ["Full platform access", "Unlimited orders", "All features unlocked", "No credit card required"],
    cta: "Start Free Trial",
  },
  {
    name: "Monthly Plan",
    price: "₹499",
    period: "/ month",
    badge: "MOST POPULAR",
    featured: true,
    features: ["Everything in trial", "Priority support", "Real-time analytics", "Staff management", "Cancel anytime"],
    cta: "Get Started",
  },
  {
    name: "Yearly Plan",
    price: "₹4,999",
    period: "/ year",
    badge: "SAVE ₹989",
    featured: false,
    features: ["All monthly features", "Multi-restaurant support", "Dedicated account manager", "Custom integrations", "2 months free"],
    cta: "Get Started",
  },
];

export default function PricingSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="pricing" className="section-padding bg-background">
      <div className="container mx-auto px-4" ref={ref}>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-4 text-foreground">
          Simple, <span className="gradient-text">Transparent</span> Pricing
        </h2>
        <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto">
          Start free, upgrade when you're ready
        </p>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className={`relative rounded-2xl p-8 flex flex-col ${
                p.featured
                  ? "gradient-primary text-primary-foreground scale-105 shadow-2xl z-10"
                  : "glass hover-glow"
              }`}
            >
              {p.badge && (
                <span
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold ${
                    p.featured ? "bg-primary-foreground text-primary" : "gradient-primary text-primary-foreground"
                  }`}
                >
                  {p.badge}
                </span>
              )}
              <h3 className={`font-bold text-lg ${p.featured ? "" : "text-foreground"}`}>{p.name}</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-extrabold">{p.price}</span>
                <span className={`text-sm ${p.featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {p.period}
                </span>
              </div>
              <ul className="space-y-3 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check size={16} className={p.featured ? "text-primary-foreground" : "text-primary"} />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className={`mt-8 text-center py-3 rounded-full font-semibold text-sm transition-all ${
                  p.featured
                    ? "bg-primary-foreground text-primary hover:opacity-90"
                    : "gradient-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                {p.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
