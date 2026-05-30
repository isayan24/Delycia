import { motion } from "framer-motion";
import { Server, Database, Layers, ArrowRight, ShieldCheck, Check } from "lucide-react";

const tenants = [
  { name: "Kolkata Kitchen", domain: "kolkata-kitchen.delycia.com", stats: "₹1,24,000 today" },
  { name: "Punjab Grill", domain: "punjab-grill.delycia.com", stats: "₹92,800 today" },
  { name: "Delhi Bistro", domain: "delhi-bistro.delycia.com", stats: "₹1,58,200 today" },
];

export default function SaaSArchitecture() {
  return (
    <section id="architecture" className="py-24 bg-[#FFFFFF] relative overflow-hidden">
      {/* Background blurs */}
      <div className="absolute top-1/2 left-[-10%] w-[500px] h-[350px] bg-[#FF5A00]/3 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-10%] w-[500px] h-[350px] bg-[#FF8A3D]/4 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <span className="text-xs font-black tracking-widest text-[#FF5A00] uppercase block">
            Enterprise Multi-Tenant Design
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111111] tracking-tight">
            Built to Scale. Isolated to Protect.
          </h2>
          <p className="text-base sm:text-lg text-[#111111]/60 font-medium">
            Delycia runs on a shared-infrastructure, isolated-data SaaS model. Launch unlimited restaurant locations with zero scaling delays.
          </p>
        </div>

        {/* Visual Infrastructure Diagram */}
        <div className="grid lg:grid-cols-12 gap-16 max-w-5xl mx-auto items-center">
          {/* Left Column: Visual Chart */}
          <div className="lg:col-span-7 bg-[#FFF7F2]/40 border border-[#FF5A00]/10 rounded-3xl p-8 space-y-8 relative">
            <div className="absolute inset-0 bg-[radial-gradient(#FF5A00_0.8px,transparent_0.8px)] [background-size:20px_20px] opacity-[0.02] rounded-3xl pointer-events-none" />

            {/* Step 1: Centralized Cloud */}
            <div className="flex flex-col items-center">
              <div className="bg-white border border-[#FF5A00]/15 p-2 rounded-2xl flex items-center gap-3.5 shadow-sm max-w-[280px]">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                  <Database size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#111111]">Centralized Data Pool</h4>
                  <p className="text-[9px] font-semibold text-[#111111]/40 uppercase tracking-widest">MariaDB Pool + Redis</p>
                </div>
              </div>
            </div>

            {/* Connecting Connector */}
            <div className="flex justify-center my-[-10px]">
              <div className="h-10 w-0.5 border-l-2 border-dashed border-[#FF5A00]/25" />
            </div>

            {/* Step 2: BFF Proxy Routing layer */}
            <div className="flex flex-col items-center">
              <div className="bg-[#FF5A00] text-white p-4 rounded-2xl flex items-center gap-3 shadow-md max-w-[290px] relative">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Layers size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black">BFF Tenant Router Middleware</h4>
                  <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Dynamic scope resolution</p>
                </div>
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-2xl border border-white/20 animate-ping opacity-25" />
              </div>
            </div>

            {/* Dynamic branching lines */}
            <div className="flex items-center justify-center gap-8 lg:gap-16 pt-2">
              <div className="h-8 w-0.5 border-l-2 border-dashed border-[#FF5A00]/25 rotate-[-30deg]" />
              <div className="h-8 w-0.5 border-l-2 border-dashed border-[#FF5A00]/25" />
              <div className="h-8 w-0.5 border-l-2 border-dashed border-[#FF5A00]/25 rotate-[30deg]" />
            </div>

            {/* Step 3: Isolated Tenants */}
            <div className="grid grid-cols-3 gap-3">
              {tenants.map((t, idx) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-white border border-[#FF5A00]/10 rounded-xl p-3 shadow-[0_4px_15px_rgba(0,0,0,0.01)] text-center space-y-1 hover:border-[#FF5A00]/30 transition-all duration-300"
                >
                  <span className="text-[10px] font-black text-[#FF5A00] uppercase block">Tenant {String(idx + 1).padStart(2, "0")}</span>
                  <h5 className="text-[11px] font-black text-[#111111] tracking-tight">{t.name}</h5>
                  <p className="text-[8px] font-semibold text-[#111111]/40">{t.domain}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Key Details list */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight leading-tight">
              Isolated Restaurant Sandbox, Unified Infrastructure.
            </h3>
            <p className="text-sm sm:text-base text-[#111111]/60 leading-relaxed font-semibold">
              Traditional multi-tenant systems are slow or highly expensive to host. Delycia routes dynamic tenant namespaces through a optimized, sub-second BFF router layer to keep resource consumption minimal.
            </p>

            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <div className="mt-0.5 bg-[#FFF7F2] p-1 rounded-md border border-[#FF5A00]/10 text-[#FF5A00]">
                  <Check size={14} className="stroke-[3]" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[#111111]/70 leading-relaxed">
                  **Isolated Schemas**: Complete data partition using `rid` scoping indexes. No crosstalk possible.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="mt-0.5 bg-[#FFF7F2] p-1 rounded-md border border-[#FF5A00]/10 text-[#FF5A00]">
                  <Check size={14} className="stroke-[3]" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[#111111]/70 leading-relaxed">
                  **Custom Subdomains**: Map restaurant panels instantly (e.g., `punjabgrill.delycia.com`) without server reloads.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="mt-0.5 bg-[#FFF7F2] p-1 rounded-md border border-[#FF5A00]/10 text-[#FF5A00]">
                  <Check size={14} className="stroke-[3]" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[#111111]/70 leading-relaxed">
                  **Centralized Control**: Platform super-admins can toggle restaurant settings, pricing plans, and monitor server memory globally.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
