import { motion } from "framer-motion";
import { Smartphone, Tablet, Monitor, Check, ShoppingBag, Clock, Shield } from "lucide-react";

const devices = [
  {
    icon: Smartphone,
    title: "Customer Mobile Experience",
    device: "Mobile Browsers (Safari / Chrome)",
    desc: "A zero-friction contactless dining interface. Customers scan, customize variant toppings, dispatch live orders, and settle their tables instantly without installing any app.",
    badge: "Sync latency: <12ms",
    mockType: "mobile"
  },
  {
    icon: Tablet,
    title: "Waiter Dispatch Console",
    device: "iPad & Android Tablets",
    desc: "Empower your waitstaff. A visual table-map terminal facilitating instant order additions, service calls, payment indicators, floor-zone maps, and wireless kitchen routing.",
    badge: "Synced POS Terminal",
    mockType: "tablet"
  },
  {
    icon: Monitor,
    title: "Kitchen Display Queue (KDS)",
    device: "Smart TVs & Desktops",
    desc: "Maximize kitchen throughput. An ultra-responsive preparation board featuring active cook countdown timers, item aggregates, real-time ticket alerts, and server dispatch triggers.",
    badge: "99.9% Webhook Delivery",
    mockType: "kds"
  }
];

export default function MultiDevice() {
  return (
    <section className="py-24 bg-[#FFFFFF] border-y border-[#FF5A00]/5 relative overflow-hidden">
      {/* Soft premium ambient background blurs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-[#FFF7F2] rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-[#FF5A00]/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10 max-w-6xl">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFF7F2] border border-[#FF5A00]/15 shadow-sm">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[#FF5A00] animate-pulse" />
            <span className="text-[10px] font-black text-[#FF5A00] uppercase tracking-widest">
              Unified Real-Time Ecosystem
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111111] tracking-tight">
            Multi-Device Unified Ecosystem
          </h2>
          <p className="text-base sm:text-lg text-[#111111]/55 max-w-2xl mx-auto font-medium leading-relaxed">
            Run operations seamlessly across any hardware screen. Customers, waiters, kitchen managers, and platform owners stay synchronized on every active dining session.
          </p>
        </div>

        {/* Minimalist Visual Grid */}
        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {devices.map((d, idx) => {
            const IconComponent = d.icon;
            return (
              <motion.div
                key={d.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: idx * 0.12, ease: "easeOut" }}
                className="bg-white border border-[#111111]/5 rounded-[28px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.015)] hover:shadow-[0_20px_50px_rgba(255,90,0,0.06)] hover:border-[#FF5A00]/20 transition-all duration-400 flex flex-col justify-between group"
              >
                <div>
                  
                  {/* Card Header Icon & Labels */}
                  <div className="flex items-center gap-3.5 pb-4 border-b border-[#111111]/5 mb-6">
                    <span className="w-10.5 h-10.5 rounded-xl bg-[#FFF7F2] border border-[#FF5A00]/10 flex items-center justify-center text-[#FF5A00] shadow-sm">
                      <IconComponent size={19} className="stroke-[2.2px]" />
                    </span>
                    <div className="text-left">
                      <h4 className="text-[12px] font-black text-[#111111] tracking-tight leading-none">{d.title}</h4>
                      <p className="text-[8.5px] font-bold text-[#FF5A00] uppercase tracking-wider mt-1">{d.device}</p>
                    </div>
                  </div>

                  {/* Sleek, Borderless Floating UI Screen Mockups */}
                  <div className="relative mb-6">
                    
                    {/* 1. CUSTOMER MOBILE MENU WIDGET */}
                    {d.mockType === "mobile" && (
                      <div className="bg-[#FFF7F2]/50 border border-[#FF5A00]/12 rounded-2xl p-4 shadow-[0_8px_25px_rgba(255,90,0,0.02)] text-left space-y-3 max-w-[280px] mx-auto">
                        {/* Simulated Browser Bar */}
                        <div className="flex justify-between items-center text-[7.5px] text-[#111111]/40 border-b border-[#111111]/5 pb-2 font-bold">
                          <span>🔒 cousins.delycia.com/t04</span>
                          <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-extrabold tracking-wide uppercase scale-90">
                            🟢 Live Menu
                          </span>
                        </div>

                        {/* Interactive Food Row */}
                        <div className="bg-white p-2.5 rounded-xl border border-[#111111]/5 flex gap-2.5 items-center shadow-sm">
                          <img 
                            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=80&auto=format&fit=crop&q=80" 
                            className="w-10 h-10 object-cover rounded-lg shrink-0 border border-neutral-100" 
                            alt="Pizza" 
                          />
                          <div className="min-w-0 flex-1">
                            <h5 className="text-[9.5px] font-extrabold text-[#111111] leading-none truncate">Tandoori Paneer Pizza</h5>
                            <p className="text-[8px] font-black text-[#FF5A00] mt-1">₹450.00</p>
                          </div>
                        </div>

                        {/* Cart dispatch bar */}
                        <div className="bg-[#FF5A00] text-white p-2.5 rounded-xl flex items-center justify-between shadow-[0_4px_12px_rgba(255,90,0,0.18)]">
                          <div className="flex items-center gap-1.5">
                            <ShoppingBag size={10} className="stroke-[2.5px]" />
                            <span className="text-[8.5px] font-black uppercase tracking-wider">1 Item Selected</span>
                          </div>
                          <span className="text-[9.5px] font-black">₹450.00</span>
                        </div>
                      </div>
                    )}

                    {/* 2. WAITER TABLE GRID TABLET WIDGET */}
                    {d.mockType === "tablet" && (
                      <div className="bg-white border border-[#111111]/5 rounded-2xl p-4 shadow-[0_8px_25px_rgba(0,0,0,0.015)] text-left space-y-3 max-w-[290px] mx-auto">
                        
                        {/* Tablet Grid Title */}
                        <div className="flex justify-between items-center text-[7.5px] text-[#111111]/45 pb-2 border-b border-[#111111]/5 font-black uppercase tracking-wider">
                          <span>Tables Grid Dispatcher</span>
                          <span>Zone A</span>
                        </div>

                        {/* Table map bubble grid */}
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { id: "T1", status: "Served", bg: "bg-emerald-50 border-emerald-100 text-emerald-600" },
                            { id: "T2", status: "Active", bg: "bg-[#FFF7F2] border-[#FF5A00]/15 text-[#FF5A00] animate-pulse" },
                            { id: "T3", status: "Empty", bg: "bg-neutral-50/50 border-[#111111]/5 text-[#111111]/30" },
                            { id: "T4", status: "Empty", bg: "bg-neutral-50/50 border-[#111111]/5 text-[#111111]/30" }
                          ].map((t) => (
                            <div key={t.id} className={`p-1.5 rounded-lg border text-center flex flex-col justify-center items-center ${t.bg}`}>
                              <span className="text-[9px] font-black leading-none">{t.id}</span>
                              <span className="text-[5.5px] font-extrabold uppercase mt-0.5 tracking-wide leading-none">{t.status}</span>
                            </div>
                          ))}
                        </div>

                        {/* Service Alert Bar */}
                        <div className="bg-[#FFF7F2] border border-[#FF5A00]/15 p-2 rounded-xl text-center text-[8px] font-extrabold uppercase text-[#FF5A00] shadow-sm select-none">
                          ⚡ Call Waiter Active: Table 02
                        </div>
                      </div>
                    )}

                    {/* 3. KITCHEN KDS MONITOR WIDGET */}
                    {d.mockType === "kds" && (
                      <div className="bg-[#121214] border border-white/5 rounded-2xl p-4 shadow-[0_8px_25px_rgba(0,0,0,0.03)] text-left space-y-3 max-w-[290px] mx-auto text-neutral-300">
                        
                        {/* KDS Header Bar */}
                        <div className="flex justify-between items-center text-[7.5px] text-white/30 pb-2 border-b border-white/5 font-black uppercase tracking-wider">
                          <span>Kitchen Prep Station 1</span>
                          <span className="text-emerald-400">1 Active</span>
                        </div>

                        {/* Order Queue Column Box */}
                        <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex items-center justify-between relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-[#FF5A00]" />
                          <div className="pl-1.5">
                            <h6 className="text-[9px] font-black text-white leading-none">Table 12 • Active</h6>
                            <p className="text-[8px] font-bold text-white/50 leading-none mt-1 truncate">2x Grilled Paneer Burger</p>
                          </div>

                          {/* Countdown Timer */}
                          <div className="text-right shrink-0">
                            <span className="text-[8px] font-black text-amber-500 flex items-center gap-0.5 bg-amber-500/10 px-1.5 py-0.5 rounded">
                              <Clock size={8} /> 04:12m
                            </span>
                          </div>
                        </div>

                        {/* Server dispatch alert button */}
                        <div className="bg-emerald-500 text-white rounded-xl p-2 text-center text-[8px] font-extrabold uppercase shadow-sm select-none">
                          ✓ Mark Order Completed
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Core Description Text */}
                  <p className="text-xs sm:text-[13.5px] font-medium text-[#111111]/55 leading-relaxed text-left">
                    {d.desc}
                  </p>
                </div>

                {/* Footer Sync Verification Badge */}
                <div className="mt-7 pt-4.5 border-t border-[#111111]/5 flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-[#111111]/40">
                  <span className="flex items-center gap-1 font-bold text-[#111111]/35">
                    <Shield size={10} className="text-[#FF5A00]" /> {d.badge}
                  </span>
                  <span className="text-emerald-600 bg-emerald-50/70 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                    <Check size={9} strokeWidth={4} /> Synced
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
