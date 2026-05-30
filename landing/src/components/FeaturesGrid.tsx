import { motion } from "framer-motion";
import {
  QrCode,
  RefreshCw,
  ChefHat,
  Grid,
  ShieldCheck,
  PackageCheck,
  Brain,
  BellRing,
  Laptop,
  LineChart
} from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "QR Code Ordering",
    desc: "Contactless, table-side digital menus with instant checkout. No app install required.",
    badge: "Customer-First"
  },
  {
    icon: RefreshCw,
    title: "Live Order Sync",
    desc: "Sub-second event synchronization keeping orders, edits, and cancellations in perfect harmony.",
    badge: "Sub-Second"
  },
  {
    icon: ChefHat,
    title: "Kitchen Dashboard",
    desc: "Streamlined display queues with dynamic updates, status milestones, and sound cues.",
    badge: "Operations"
  },
  {
    icon: Grid,
    title: "Table & Zone Control",
    desc: "Visual occupancy tracking, capacity mapping, and instant table QR code generators.",
    badge: "Management"
  },
  {
    icon: ShieldCheck,
    title: "Staff & Role Access",
    desc: "Granular 8-tier RBAC mapping (Owner, Kitchen, Waiter) enforced by secure route middleware.",
    badge: "Security"
  },
  {
    icon: PackageCheck,
    title: "Inventory Control",
    desc: "Real-time item tracking, categories control, and live stock availability toggles.",
    badge: "Logistics"
  },
  {
    icon: Brain,
    title: "Customer Insights",
    desc: "Visit analytics tracking, dining frequency metrics, and AI memory upselling.",
    badge: "Intelligence"
  },
  {
    icon: BellRing,
    title: "Notifications & Alerts",
    desc: "Audio sound triggers for new orders, instant status changes, and critical admin alerts.",
    badge: "Real-Time"
  },
  {
    icon: Laptop,
    title: "Multi-device Sessions",
    desc: "Continuous session tracking across mobile browsers, tablets, and administrative displays.",
    badge: "Infrastructure"
  },
  {
    icon: LineChart,
    title: "Analytics & Reports",
    desc: "Deep reports tracking daily revenue, best-selling dishes, and staff activity metrics.",
    badge: "Finance"
  }
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-24 bg-[#FFFFFF] relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#FFF7F2] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#FF5A00]/3 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <span className="text-xs font-black tracking-widest text-[#FF5A00] uppercase block">
            End-to-End Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#111111]">
            Everything Your Restaurant Needs.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5A00] to-[#FF8A3D]">
              Fully Unified.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[#111111]/60 font-semibold">
            Bypass fragmented third-party solutions. Delycia coordinates every operational layer under one premium SaaS dashboard.
          </p>
        </div>

        {/* Bento/Modern Layout Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((f, i) => {
            const IconComponent = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group relative bg-[#FFFFFF] border border-[#FF5A00]/10 hover:border-[#FF5A00]/30 p-8 rounded-2xl transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_40px_rgba(255,90,0,0.06)] hover:-translate-y-1 cursor-default"
              >
                {/* Visual Icon Node */}
                <div className="w-12 h-12 rounded-xl bg-[#FFF7F2] border border-[#FF5A00]/15 flex items-center justify-center mb-6 group-hover:bg-[#FF5A00] transition-colors duration-300">
                  <IconComponent className="text-[#FF5A00] group-hover:text-white transition-colors duration-300" size={24} />
                </div>

                {/* Badge Tag */}
                <span className="inline-block text-[9px] font-extrabold tracking-widest text-[#FF5A00] uppercase bg-[#FFF7F2] border border-[#FF5A00]/10 px-2 py-0.5 rounded-md mb-3">
                  {f.badge}
                </span>

                {/* Feature Header */}
                <h3 className="text-lg font-black text-[#111111] mb-2 tracking-tight group-hover:text-[#FF5A00] transition-colors duration-200">
                  {f.title}
                </h3>

                {/* Feature Description */}
                <p className="text-xs sm:text-sm font-semibold text-[#111111]/50 leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
