import { motion } from "framer-motion";

const brands = [
  "Kolkata Kitchen", "Spice Route", "Mumbai Bites", "Delhi Darbar",
  "Chennai Express", "Hyderabad House", "Bangalore Bistro", "Punjab Grill",
];

export default function TrustedBy() {
  return (
    <section className="py-12 bg-secondary">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm font-medium text-muted-foreground mb-8 tracking-wide uppercase">
          Trusted by 200+ restaurants across India
        </p>
        <div className="relative overflow-hidden">
          <motion.div
            animate={{ x: [0, -1200] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="flex gap-12 w-max"
          >
            {[...brands, ...brands].map((b, i) => (
              <div
                key={i}
                className="flex items-center justify-center px-6 py-3 rounded-lg bg-muted/50 min-w-[160px]"
              >
                <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
                  {b}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
