import { motion } from "framer-motion";
import { Star, MapPin } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const testimonials = [
  {
    name: "Rahul Sharma",
    restaurant: "Kolkata Kitchen",
    location: "Kolkata",
    quote: "Delycia transformed how we operate. Orders are faster, customers are happier, and we've increased revenue by 35% in just 3 months!",
  },
  {
    name: "Priya Patel",
    restaurant: "Spice Route",
    location: "Mumbai",
    quote: "The AI recommendations alone boosted our average order value by 25%. Setup was incredibly easy — literally 2 minutes.",
  },
  {
    name: "Arjun Reddy",
    restaurant: "Hyderabad House",
    location: "Hyderabad",
    quote: "We eliminated order errors completely. Our kitchen staff loves the real-time notifications and our customers love the experience.",
  },
];

export default function TestimonialsSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto px-4" ref={ref}>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-4 text-foreground">
          Loved by <span className="gradient-text">Restaurant Owners</span>
        </h2>
        <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto">
          Hear from restaurant owners who transformed their business
        </p>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="glass p-6 rounded-2xl hover-glow"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={16} className="fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-6 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.restaurant}</p>
                </div>
                <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin size={12} /> {t.location}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
