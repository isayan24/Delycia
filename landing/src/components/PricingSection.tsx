import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Standard Tier",
    price: "₹0",
    period: "/ forever",
    badge: "100% FREE",
    featured: false,
    features: [
      "Full platform capabilities",
      "Unlimited QR ordering scans",
      "Real-time kitchen display KDS",
      "Secure BFF authentication",
      "Absolutely no credit card required"
    ],
    cta: "Launch For Free"
  },
  {
    name: "Growth Plan",
    price: "₹0",
    period: "/ also free",
    badge: "MOST POPULAR (DUH!)",
    featured: true,
    features: [
      "Everything in Standard Tier",
      "Priority 'Warm-hearted' support",
      "Full operations analytics suite",
      "Staff & table occupancy controls",
      "Redis token caching enabled",
      "Slightly shinier button color"
    ],
    cta: "Claim Free Growth Plan"
  },
  {
    name: "Enterprise Scaling",
    price: "₹0",
    period: "/ still ₹0",
    badge: "ZERO SALES CALLS",
    featured: false,
    features: [
      "All monthly growth capabilities",
      "Multi-restaurant switching logic",
      "Infinite table & floor mappings",
      "Dynamic custom subdomains",
      "100% self-serve instadeploy"
    ],
    cta: "Deploy Free Enterprise"
  }
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-[#FFF7F2]/20 border-y border-[#FF5A00]/5 relative overflow-hidden">
      {/* Decorative ambient blurs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[#FF5A00]/3 rounded-full blur-[110px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF7F2] border border-[#FF5A00]/15 shadow-sm">
            <Sparkles size={11} className="text-[#FF5A00] animate-spin" />
            <span className="text-[10px] font-black text-[#FF5A00] uppercase tracking-widest">
              Unbelievably Free & Open-Source
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111111] tracking-tight">
            Transparent Pricing. It's Actually Free.
          </h2>
          <p className="text-base sm:text-lg text-[#111111]/55 max-w-2xl mx-auto font-medium leading-relaxed">
            No complex subscription models, no hidden developer charges, and absolutely no credit cards. Delycia is completely free so you can focus 100% on scaling your culinary operations!
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          {plans.map((p, idx) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.12 }}
              className={`bg-white rounded-3xl p-8 flex flex-col relative transition-all duration-300 ${
                p.featured
                  ? "border-2 border-[#FF5A00] shadow-[0_20px_50px_rgba(255,90,0,0.08)] scale-105 z-10"
                  : "border border-[#FF5A00]/10 hover:border-[#FF5A00]/30 shadow-sm"
              }`}
            >
              {p.badge && (
                <span
                  className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm select-none ${
                    p.featured ? "bg-[#FF5A00] text-white" : "bg-[#FFF7F2] text-[#FF5A00] border border-[#FF5A00]/10"
                  }`}
                >
                  {p.badge}
                </span>
              )}

              {/* Plan Title */}
              <h3 className="text-lg font-black text-[#111111] tracking-tight text-center">{p.name}</h3>

              {/* Price */}
              <div className="mt-4 mb-6 text-center select-none">
                <span className="text-4xl font-black text-[#111111]">{p.price}</span>
                <span className="text-xs font-semibold text-[#111111]/45 ml-1">{p.period}</span>
              </div>

              {/* Feature List */}
              <ul className="space-y-4 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-[#111111]/60 text-left">
                    <Check size={15} className="text-[#FF5A00] mt-0.5 shrink-0" strokeWidth={4} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Link */}
              <a
                href="#footer"
                className={`mt-8 text-center py-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 ${
                  p.featured
                    ? "bg-[#FF5A00] text-white hover:bg-[#FF7A30] shadow-[0_4px_20px_rgba(255,90,0,0.2)] hover:scale-[1.01] active:scale-[0.99]"
                    : "bg-[#FFF7F2] text-[#FF5A00] hover:bg-[#FF5A00] hover:text-white border border-[#FF5A00]/15 hover:scale-[1.01] active:scale-[0.99]"
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
