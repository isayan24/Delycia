import { motion } from "framer-motion";
import { Clock, XCircle, BarChart3, AlertCircle, Check } from "lucide-react";

const problems = [
  {
    icon: Clock,
    title: "Manual Dispatch & Wait Times",
    desc: "Customers wait 15-20 minutes just to grab a waiter's attention, place an order, or process their payment.",
    stat: "15 min average delay"
  },
  {
    icon: XCircle,
    title: "High Commission Fees",
    desc: "Third-party delivery aggregators charge up to 30% commission, eating directly into restaurant profits.",
    stat: "30% profit loss"
  },
  {
    icon: BarChart3,
    title: "Fragmented Operations",
    desc: "Managing menu spreadsheets, separate table checkers, and manual billing leads to coordinate mismatches.",
    stat: "High staff strain"
  },
  {
    icon: AlertCircle,
    title: "No Live Data Insights",
    desc: "Owners make menu decisions based on guessworks rather than real-time metrics of best-selling items.",
    stat: "Zero growth metrics"
  }
];

export default function ProblemSection() {
  return (
    <section className="py-24 bg-[#FFFFFF] relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[#FF5A00]/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <span className="text-xs font-black tracking-widest text-[#FF5A00] uppercase block">
            The Industry Bottlenecks
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111111] tracking-tight">
            Running a Restaurant Shouldn't Be Hard.
          </h2>
          <p className="text-base sm:text-lg text-[#111111]/60 font-medium">
            Traditional restaurant models are built on fragmented paper workflows. Delycia digitizes every operational layer.
          </p>
        </div>

        {/* Problems Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {problems.map((p, idx) => {
            const IconComponent = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-[#FFF7F2]/45 border border-[#FF5A00]/10 rounded-2xl p-6 relative hover:border-[#FF5A00]/30 hover:shadow-[0_12px_30px_rgba(255,90,0,0.04)] transition-all duration-300 group cursor-default"
              >
                {/* Visual Icon Node */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="w-10 h-10 rounded-xl bg-white border border-[#FF5A00]/15 flex items-center justify-center text-[#FF5A00] group-hover:bg-[#FF5A00] group-hover:text-white transition-colors duration-300">
                    <IconComponent size={20} />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-[#111111] tracking-tight group-hover:text-[#FF5A00] transition-colors duration-200">
                      {p.title}
                    </h3>
                    <span className="text-[9px] font-black text-[#FF5A00] uppercase tracking-wider bg-white border border-[#FF5A00]/10 px-2 py-0.5 rounded-md mt-1 inline-block">
                      {p.stat}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm font-semibold text-[#111111]/55 leading-relaxed pl-1">
                  {p.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
