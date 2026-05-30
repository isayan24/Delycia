import { Github, Globe, Mail } from "lucide-react";

const columns = [
  {
    title: "Product Suite",
    links: [
      { label: "QR Code Ordering", href: "#realtime" },
      { label: "Live Kitchen Board", href: "#realtime" },
      { label: "Table Occupancy", href: "#features" },
      { label: "SaaS Analytics", href: "#analytics" }
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "GitHub Codebase", href: "https://github.com/isayan24/Delycia", external: true },
      { label: "Sayan's Portfolio", href: "https://sayanthisis.vercel.app/", external: true },
    ],
  },
  
   
];

export default function Footer() {
  return (
    <footer className="bg-[#FFFFFF] border-t border-[#FF5A00]/10 text-[#111111]/70 select-none" id="footer">
      <div className="container mx-auto px-6 py-16 lg:px-8 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          
          {/* Brand Column */}
          <div className="col-span-2 space-y-4 text-left">
            <a href="#" className="flex items-center gap-2.5 text-2xl font-extrabold text-[#111111] hover:opacity-90 transition-opacity">
              <img
                src="/delycia-logo.jpg"
                alt="Delycia Logo"
                className="h-9 w-9 rounded-xl object-cover shadow-sm border border-[#FF5A00]/15"
              />
              <span className="font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FF5A00] to-[#FF8A3D]">
                Delycia
              </span>
            </a>
            <p className="text-xs sm:text-sm font-semibold text-[#111111]/50 leading-relaxed max-w-xs">
              A real-time, multi-tenant restaurant operating suite with frictionless QR ordering and production-grade authentication.
            </p>
          </div>

          {/* Links Columns */}
          {columns.map((col) => (
            <div key={col.title} className="space-y-4 text-left">
              <h4 className="text-xs font-black text-[#111111] uppercase tracking-wider">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm font-semibold text-[#111111]/50 hover:text-[#FF5A00] transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <a
                        href={link.href}
                        className="text-xs sm:text-sm font-semibold text-[#111111]/50 hover:text-[#FF5A00] transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Bottom Bar with Copyright, Attributions and Lucide Icons Links */}
        <div className="mt-16 pt-8 border-t border-[#111111]/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-semibold text-[#111111]/45">
            © 2026 Delycia Inc. All rights reserved. Built with ❤️ by{" "}
            <a 
              href="https://sayanthisis.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#4f433d] hover:underline font-black"
            >
              Sayan
            </a>
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-3.5">
            {/* GitHub Link with Lucide Icon */}
            <a 
              href="https://github.com/isayan24/Delycia" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1.5 text-xs font-semibold text-[#111111]/50 hover:text-[#FF5A00] transition-colors"
            >
              <Github size={13} className="shrink-0 stroke-[2.2px]" />
              <span>GitHub</span>
            </a>

            <span className="text-[#111111]/15 font-light hidden sm:inline">|</span>

            {/* Mail Link with Lucide Icon */}
            <a 
              href="mailto:sayandas.workmail@gmail.com"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#111111]/50 hover:text-[#FF5A00] transition-colors cursor-pointer"
            >
              <Mail size={13} className="shrink-0 stroke-[2.2px]" />
              <span>sayandas.workmail@gmail.com</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
