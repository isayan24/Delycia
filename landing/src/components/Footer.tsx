const columns = [
  {
    title: "Product",
    links: ["Features", "Pricing", "How It Works", "Integrations"],
  },
  {
    title: "Company",
    links: ["About Us", "Contact", "Blog", "Careers"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
  },
];

export default function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-extrabold gradient-text mb-3">Delycia</h3>
            <p className="text-sm text-primary-foreground/60 leading-relaxed">
              Turn every table into a smart dining experience.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-bold text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-primary-foreground/50 hover:text-primary transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/40">
            © 2026 Delycia. All rights reserved.
          </p>
          <p className="text-xs text-primary-foreground/40">
            contact@delycia.com | +91 8768683848
          </p>
        </div>
      </div>
    </footer>
  );
}
