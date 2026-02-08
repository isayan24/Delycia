import { motion } from "framer-motion";
import { QrCode, Bot, BarChart3, Package, Users, Bell } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const features = [
  { icon: QrCode, title: "QR Code Ordering", desc: "Table-side digital menus with instant ordering" },
  { icon: Bot, title: "AI Recommendations", desc: "Smart suggestions increase order value by 25%" },
  { icon: BarChart3, title: "Real-Time Analytics", desc: "Live sales, peak hours, and customer insights" },
  { icon: Package, title: "Inventory Management", desc: "Track stock levels with automatic low-stock alerts" },
  { icon: Users, title: "Staff Management", desc: "Role-based access for waiters and kitchen staff" },
  { icon: Bell, title: "Smart Notifications", desc: "Alerts for new orders, low stock, and plan expiry" },
];

export default function FeaturesGrid() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="features" className="section-padding bg-background">
      <div className="container mx-auto px-4" ref={ref}>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-4 text-foreground">
          Everything Your Restaurant <span className="gradient-text">Needs</span>
        </h2>
        <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto">
          A complete suite of tools to modernize your operations
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass p-6 rounded-2xl hover-glow group cursor-default"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="text-primary" size={24} />
              </div>
              <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
