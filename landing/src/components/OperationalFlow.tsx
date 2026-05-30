import { motion } from "framer-motion";
import { User, QrCode, ChefHat, Users, BarChart3, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: User,
    title: "Customer Scans",
    desc: "A frictionless table scan launches the instant-access digital menu.",
    color: "#FF5A00",
    badge: "01"
  },
  {
    icon: QrCode,
    title: "Direct Routing",
    desc: "Bypasses manual entries, sending orders straight to the server.",
    color: "#FF8A3D",
    badge: "02"
  },
  {
    icon: ChefHat,
    title: "Kitchen Queue",
    desc: "Real-time kitchen displays sync order details instantly via WebSockets.",
    color: "#E28500",
    badge: "03"
  },
  {
    icon: Users,
    title: "Staff Coordination",
    desc: "Waiters and managers track preparation milestones on any active device.",
    color: "#10B981",
    badge: "04"
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    desc: "Sales figures, item count, and database stats updates immediately.",
    color: "#3B82F6",
    badge: "05"
  }
];

export default function OperationalFlow() {
  return (
    <section className="py-24 bg-[#FFF7F2]/50 border-y border-[#FF5A00]/5 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[#FF5A00]/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <span className="text-xs font-black tracking-widest text-[#FF5A00] uppercase block">
            End-to-End Operational Lifecycle
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111111] tracking-tight">
            How Delycia Syncs Your Restaurant
          </h2>
          <p className="text-base sm:text-lg text-[#111111]/60 font-medium">
            From customer scanning to administrative reports, Delycia guarantees seamless operation in sub-seconds.
          </p>
        </div>

        {/* Timeline Flow */}
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-4 relative max-w-6xl mx-auto">
          {/* Connecting Line (Desktop Only) */}
          <div className="absolute top-[38px] left-[5%] right-[5%] h-0.5 bg-gradient-to-r from-[#FF5A00]/20 via-[#FF8A3D]/25 to-blue-500/20 hidden lg:block z-0" />

          {steps.map((s, idx) => {
            const IconComponent = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.12 }}
                className="flex flex-col items-center text-center relative z-10 group"
              >
                {/* Visual Circle Node */}
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center relative mb-6 shadow-md transition-all duration-300 group-hover:scale-105"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: `1.5px solid ${s.color}25`,
                    boxShadow: `0 8px 30px ${s.color}05`
                  }}
                >
                  {/* Glowing hover dot */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle, ${s.color}15 0%, transparent 70%)`
                    }}
                  />
                  {/* Steps Badge */}
                  <span
                    className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-md text-[9px] font-black text-white shadow-sm"
                    style={{ backgroundColor: s.color }}
                  >
                    {s.badge}
                  </span>
                  <IconComponent className="transition-transform duration-300 group-hover:-translate-y-0.5" style={{ color: s.color }} size={32} />
                </div>

                {/* Text Block */}
                <div className="space-y-2 max-w-[200px] sm:max-w-[240px] lg:max-w-none">
                  <h3 className="text-lg font-black text-[#111111] group-hover:text-[#FF5A00] transition-colors duration-200">
                    {s.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-[#111111]/50 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                {/* Visual Arrow for mobile layout */}
                {idx < steps.length - 1 && (
                  <div className="mt-6 text-[#FF5A00]/30 lg:hidden">
                    <ArrowRight size={20} className="rotate-90" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
