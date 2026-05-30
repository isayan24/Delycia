import React from 'react'
import { motion } from "framer-motion";
import { ShieldCheck } from 'lucide-react';


export default function HeroSection2() {
  return (
    <div className='relative flex flex-col items-center justify-start bg-[#FFFFFF] overflow-hidden pt-28 pb-24'>
       <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="relative w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-[32px] border border-[#FF5A00]/15 shadow-[0_35px_80px_rgba(255,90,0,0.08),_0_0_1px_rgba(255,90,0,0.12)] p-6 md:p-8 mt-6 z-10"
        >
          {/* Subtle top glare sheen line inside the card */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />

          {/* Window Header Bar */}
          <div className="flex items-center justify-between pb-5 border-b border-[#111111]/5 mb-6">
            {/* Safari style mac buttons */}
            <div className="flex gap-2 shrink-0">
              <span className="w-3.5 h-3.5 rounded-full bg-[#FF5A00]/25 border border-[#FF5A00]/15 shadow-inner" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#FF8A3D]/25 border border-[#FF8A3D]/15 shadow-inner" />
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/25 border border-emerald-500/15 shadow-inner" />
            </div>

            {/* Premium Simulated Address Bar */}
            <div className="hidden sm:flex items-center gap-2 bg-[#F5F5F7]/80 border border-[#111111]/5 px-5 py-1.5 rounded-full text-[10px] font-bold text-[#111111]/45 max-w-[280px] w-full justify-center shadow-inner">
              <span className="text-[8px] text-emerald-500">🟢</span>
              <span className="tracking-wide">delycia/dashboard/main-kitchen</span>
            </div>

            {/* Glowing Live Badge */}
            <div className="flex items-center gap-2 bg-[#FFF7F2] border border-[#FF5A00]/15 px-3.5 py-1.5 rounded-full shadow-[0_2px_8px_rgba(255,90,0,0.02)] shrink-0 relative">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping absolute" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[10px] font-black text-[#FF5A00] tracking-wider uppercase">Live Operations Console</span>
            </div>
          </div>

          {/* Grid Layout inside mockup */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Sales Card */}
            <div className="relative group/card bg-gradient-to-b from-[#FFF7F2] to-[#FFF1E6]/40 p-5 rounded-2xl border border-[#FF5A00]/10 hover:border-[#FF5A00]/25 hover:shadow-[0_8px_20px_rgba(255,90,0,0.03)] transition-all duration-300 text-center">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-[#111111]/40 uppercase tracking-wider block">Today's Sales</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/15 text-[8px] font-extrabold text-emerald-600 uppercase tracking-wider">+12.4%</span>
              </div>
              <span className="text-3xl font-black text-[#111111] tracking-tight block mt-1">₹48,250</span>
            </div>

            {/* Capacity Card */}
            <div className="relative group/card bg-white p-5 rounded-2xl border border-[#111111]/5 hover:border-[#FF5A00]/15 hover:shadow-[0_8px_20px_rgba(0,0,0,0.02)] transition-all duration-300 text-center">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-[#111111]/40 uppercase tracking-wider block">Active Tables</span>
                <span className="px-1.5 py-0.5 rounded bg-[#FF5A00]/10 border border-[#FF5A00]/15 text-[8px] font-extrabold text-[#FF5A00] uppercase tracking-wider">High Load</span>
              </div>
              <span className="text-3xl font-black text-[#111111] tracking-tight block mt-1">
                18 <span className="text-lg font-bold text-[#111111]/35">/ 24</span>
              </span>
            </div>

            {/* Preparation Time Card */}
            <div className="relative group/card bg-white p-5 rounded-2xl border border-[#111111]/5 hover:border-[#FF5A00]/15 hover:shadow-[0_8px_20px_rgba(0,0,0,0.02)] transition-all duration-300 text-center">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-[#111111]/40 uppercase tracking-wider block">Preparation Time</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/15 text-[8px] font-extrabold text-emerald-600 uppercase tracking-wider">Optimal</span>
              </div>
              <span className="text-3xl font-black text-emerald-600 tracking-tight block mt-1">
                11.4 <span className="text-lg font-bold text-emerald-600/50 font-sans">min</span>
              </span>
            </div>
          </div>

          {/* Incoming Orders Section */}
          <div className="text-left space-y-3">
            <div className="flex items-center justify-between pl-1">
              <span className="text-xs font-black text-[#111111]/45 uppercase tracking-widest block">Incoming Live Orders</span>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Sync Active
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Preparing Order */}
              <div className="p-4 bg-white border border-[#FF5A00]/20 rounded-2xl flex items-center justify-between shadow-[0_4px_15px_rgba(255,90,0,0.02)] hover:border-[#FF5A00]/40 transition-all duration-300 relative overflow-hidden group/order">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#FF5A00] to-[#FF8A3D]" />
                <div className="flex items-center gap-3.5 flex-1 min-w-0 pl-1">
                  <span className="w-10 h-10 rounded-xl bg-[#FFF7F2] border border-[#FF5A00]/15 flex items-center justify-center font-black text-[#FF5A00] text-xs shrink-0 shadow-inner">
                    T12
                  </span>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-[#111111] truncate group-hover/order:text-[#FF5A00] transition-colors duration-200">
                      2x Grilled Paneer Burger, 1x Mocktail
                    </h4>
                    <p className="text-[10px] text-[#111111]/45 font-semibold mt-0.5 flex items-center gap-1.5">
                      <span>1 min ago</span>
                      <span className="w-1 h-1 rounded-full bg-[#111111]/20" />
                      <span className="truncate">Staff: Rohit (Waiter)</span>
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider text-[#FF5A00] bg-[#FFF7F2] border border-[#FF5A00]/25 rounded-md animate-pulse shrink-0">
                  Preparing
                </span>
              </div>

              {/* Served Order */}
              <div className="p-4 bg-white border border-[#111111]/5 rounded-2xl flex items-center justify-between opacity-80 hover:opacity-100 hover:border-[#111111]/15 transition-all duration-300 relative overflow-hidden group/order">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                <div className="flex items-center gap-3.5 flex-1 min-w-0 pl-1">
                  <span className="w-10 h-10 rounded-xl bg-slate-50 border border-[#111111]/5 flex items-center justify-center font-black text-[#111111]/60 text-xs shrink-0">
                    T04
                  </span>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-[#111111] truncate">
                      1x Farmhouse Pizza, 2x Fresh Lime Soda
                    </h4>
                    <p className="text-[10px] text-[#111111]/40 font-semibold mt-0.5 flex items-center gap-1.5">
                      <span>5 mins ago</span>
                      <span className="w-1 h-1 rounded-full bg-[#111111]/20" />
                      <span className="truncate">Digital Scan Ordering</span>
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200/50 rounded-md shrink-0">
                  Served
                </span>
              </div>
            </div>
          </div>

          {/* Floating Badges mapping to the sides of this giant centered console */}
          {/* Card 1 - Customer Mobile Order */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-12 -left-6 md:-left-16 bg-white border border-[#FF5A00]/15 p-2 rounded-2xl shadow-[0_15px_40px_rgba(255,90,0,0.07)] flex items-center gap-3.5 z-20 max-w-[245px] text-left hidden sm:flex hover:scale-[1.03] transition-transform duration-300"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FFF7F2] border border-[#FF5A00]/10 flex items-center justify-center text-xl shadow-inner shrink-0">
              📱
            </div>
            <div>
              <span className="text-[9px] font-extrabold text-[#FF5A00] uppercase block tracking-wider">Contactless Scan</span>
              <p className="text-xs font-bold text-[#111111] leading-snug mt-0.5">Customers scan, select, and pay instantly.</p>
            </div>
          </motion.div>

          {/* Card 2 - Security indicator */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-10 -right-6 md:-right-16 bg-white border border-[#111111]/10 p-2 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.05)] flex items-center gap-3.5 z-20 max-w-[260px] text-left hidden sm:flex hover:scale-[1.03] transition-transform duration-300"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <span className="text-[9px] font-extrabold text-emerald-600 uppercase block tracking-wider">BFF Secure Architecture</span>
              <p className="text-xs font-bold text-[#111111] leading-snug mt-0.5">Dual-Token Strategy with Silent Refresh.</p>
            </div>
          </motion.div>
        </motion.div>
    </div>
  )
}
