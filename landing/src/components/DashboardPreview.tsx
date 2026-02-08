import { motion } from "framer-motion";
import { TrendingUp, ShoppingCart, Eye } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const stats = [
  { icon: Eye, label: "Total Viewers", value: "11,824" },
  { icon: ShoppingCart, label: "Orders Processed", value: "5,080" },
  { icon: TrendingUp, label: "Monthly Growth", value: "12.7%" },
];

export default function DashboardPreview() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="section-padding gradient-light overflow-hidden">
      <div className="container mx-auto px-4" ref={ref}>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-4 text-foreground">
          Your <span className="gradient-text">Command Center</span>
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
          A beautiful dashboard that gives you full control
        </p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto relative"
        >
          {/* Dashboard mockup */}
          <div className="glass p-6 sm:p-8 rounded-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <div className="w-3 h-3 rounded-full bg-primary/40" />
              <div className="w-3 h-3 rounded-full bg-primary/20" />
              <span className="ml-4 text-sm text-muted-foreground font-medium">Delycia Dashboard</span>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {stats.map((s) => (
                <div key={s.label} className="bg-secondary rounded-xl p-4">
                  <s.icon size={20} className="text-primary mb-2" />
                  <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Chart mockup */}
            <div className="bg-secondary rounded-xl p-4 h-48 flex items-end gap-2">
              {[40, 65, 45, 80, 55, 90, 70, 95, 60, 85, 75, 100].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={isVisible ? { height: `${h}%` } : {}}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.05 }}
                  className="flex-1 gradient-primary rounded-t-md"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
