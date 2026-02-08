import { motion } from "framer-motion";
import { Clock, XCircle, BarChart3, RefreshCw } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const problems = [
  { icon: Clock, title: "Long Wait Times", desc: "Customers wait 10-15 minutes just to place an order" },
  { icon: XCircle, title: "Order Errors", desc: "15-20% of orders have mistakes due to manual entry" },
  { icon: BarChart3, title: "No Real-Time Data", desc: "You're making decisions based on guesswork, not data" },
  { icon: RefreshCw, title: "Poor Customer Experience", desc: "No personalization means losing repeat customers" },
];

export default function ProblemSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="section-padding bg-foreground text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground to-primary/20" />
      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-4">
          Running a Restaurant Shouldn't Be This Hard
        </h2>
        <p className="text-center text-primary-foreground/60 mb-12 max-w-2xl mx-auto">
          Traditional restaurant operations are plagued with inefficiencies
        </p>
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-dark p-6 rounded-2xl hover-glow"
            >
              <p.icon className="text-primary mb-4" size={28} />
              <h3 className="font-bold text-lg mb-2">{p.title}</h3>
              <p className="text-sm text-primary-foreground/60">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
