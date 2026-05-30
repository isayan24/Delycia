import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  TrendingUp,
  ShoppingBag,
  UserPlus,
  Clock,
  Calendar,
  ChevronDown,
  RefreshCw,
  SlidersHorizontal,
  Package,
  Users,
  Truck,
  Star,
  ExternalLink,
  Phone,
  Home,
  MapPin
} from "lucide-react";

// Types
type TabType = "overview" | "items" | "customers" | "delivery";

// --- Mock Data for Overview ---
const salesTrendData = [
  { date: "Sep 10", revenue: 500, orders: 10 },
  { date: "Sep 12", revenue: 6000, orders: 40 },
  { date: "Nov 06", revenue: 2000, orders: 20 },
  { date: "Jan 09", revenue: 1500, orders: 15 },
  { date: "Jan 15", revenue: 2000, orders: 22 },
  { date: "Jan 18", revenue: 500, orders: 5 },
  { date: "Jan 20", revenue: 2500, orders: 25 },
  { date: "Jan 22", revenue: 1000, orders: 12 },
  { date: "Jan 24", revenue: 6800, orders: 55 },
  { date: "Jan 26", revenue: 1200, orders: 14 },
  { date: "Jan 30", revenue: 1000, orders: 11 },
  { date: "Feb 05", revenue: 6600, orders: 50 },
  { date: "Feb 07", revenue: 2000, orders: 25 },
  { date: "Feb 09", revenue: 3800, orders: 35 },
  { date: "Feb 12", revenue: 1200, orders: 14 },
  { date: "Feb 14", revenue: 5200, orders: 48 },
  { date: "Feb 16", revenue: 1800, orders: 20 },
  { date: "Feb 18", revenue: 2200, orders: 24 },
  { date: "Feb 20", revenue: 500, orders: 6 },
  { date: "Feb 22", revenue: 3400, orders: 32 },
  { date: "Feb 24", revenue: 1200, orders: 15 },
  { date: "Feb 26", revenue: 6600, orders: 54 },
  { date: "May 30", revenue: 800, orders: 9 }
];

const orderStatusData = [
  { name: "Completed", value: 345, percentage: "71.6%", color: "#FF5A00" },
  { name: "Cancelled", value: 84, percentage: "17.4%", color: "#94A3B8" },
  { name: "Processing", value: 32, percentage: "6.6%", color: "#3B82F6" },
  { name: "Ready", value: 11, percentage: "2.3%", color: "#10B981" },
  { name: "Pending", value: 10, percentage: "2.1%", color: "#FFF7F2" }
];

// --- Mock Data for Items ---
const topSellingItems = [
  { name: "Hyderabadi Biryani", orders: 52, sold: 75, revenue: "₹12.7K", percentage: 74 },
  { name: "Chicken Biryani", orders: 46, sold: 52, revenue: "₹10.7K", percentage: 59 },
  { name: "Kashmiri Biryani", orders: 41, sold: 58, revenue: "₹9.8K", percentage: 50 },
  { name: "Shahi Paneer", orders: 29, sold: 46, revenue: "₹9.2K", percentage: 45 },
  { name: "Aloo Paratha", orders: 37, sold: 42, revenue: "₹3.2K", percentage: 15 }
];

const categoryRevenueData = [
  { category: "Biryani", revenue: 33100, orders: 139, share: "36.0%" },
  { category: "Chinese", revenue: 25900, orders: 81, share: "28.2%" },
  { category: "Pizza", revenue: 20500, orders: 55, share: "22.3%" },
  { category: "North Indian", revenue: 12400, orders: 66, share: "13.5%" }
];

// --- Mock Data for Customers (Hiding/Masking phone numbers for privacy) ---
const customerInsights = [
  {
    name: "Sayan Das",
    phone: "90839*****", // Masked for privacy
    id: "#1714037",
    interest: "Fried Momos, Margherita Pizza, Peppy Paneer Pizza, Chicago Pizza, Aloo Paratha",
    orders: 74,
    invested: "₹23,338",
    lastVisit: "30 May 2026, 09:53 am"
  },
  {
    name: "Riya Deshmukh",
    phone: "99123*****", // Masked for privacy
    id: "#1714050",
    interest: "Hyderabadi Biryani, Margherita Pizza, Chicago Pizza, Aloo Paratha, Shahi Paneer",
    orders: 23,
    invested: "₹8,833",
    lastVisit: "30 May 2026, 09:54 am"
  },
   
  {
    name: "Shilpa Shey",
    phone: "89098*****", // Masked for privacy
    id: "#1714057",
    interest: "Chili Paneer, Fried Momos, Chicago Pizza, Margherita Pizza, Shahi Paneer",
    orders: 18,
    invested: "₹5,233",
    lastVisit: "18 Feb 2026, 02:10 pm"
  },
   
];

// --- Mock Data for Delivery ---
const deliveryTypesData = [
  { name: "Dine-In", value: 290, percentage: "60.2%", revenue: "₹71.3K", color: "#FF5A00" },
  { name: "Takeaway", value: 192, percentage: "39.8%", revenue: "₹57.5K", color: "#10B981" }
];

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [refreshPulse, setRefreshPulse] = useState(false);

  const handleRefresh = () => {
    setRefreshPulse(true);
    setTimeout(() => setRefreshPulse(false), 800);
  };

  return (
    <section id="analytics" className="py-24 bg-[#FFFFFF] relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-[40%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#FF5A00]/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-black tracking-widest text-[#FF5A00] uppercase block">
            Command Center Analytics
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111111] tracking-tight">
            Premium Operations Dashboard
          </h2>
          <p className="text-base sm:text-lg text-[#111111]/60 font-medium">
            Monitor restaurant performance globally. Coordinate financial data, customer dining frequencies, and peak traffic hours in real-time.
          </p>
        </div>

        {/* Dashboard Frame */}
        <div className="bg-[#FFFFFF] border border-[#FF5A00]/10 rounded-3xl shadow-[0_20px_50px_rgba(255,90,0,0.05)] max-w-6xl mx-auto overflow-hidden relative z-10">
          
          {/* 1. TOP HEADER NAVIGATION BLOCK */}
          <div className="bg-white border-b border-[#111111]/5 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            {/* Sidebar trigger + Tab selectors */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <button className="p-2 hover:bg-[#FFF7F2] rounded-xl text-[#111111]/55 transition-colors border border-transparent hover:border-[#FF5A00]/10">
                <SlidersHorizontal size={16} />
              </button>

              <div className="flex items-center gap-1 bg-[#F5F5F7] p-1 rounded-2xl border border-[#111111]/5">
                {/* Overview Tab */}
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl transition-all duration-300 ${
                    activeTab === "overview"
                      ? "bg-[#FF5A00] text-white shadow-md shadow-[#FF5A00]/15"
                      : "text-[#111111]/55 hover:text-[#111111]"
                  }`}
                >
                  <TrendingUp size={14} />
                  OVERVIEW
                </button>

                {/* Items Tab */}
                <button
                  onClick={() => setActiveTab("items")}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl transition-all duration-300 ${
                    activeTab === "items"
                      ? "bg-[#FF5A00] text-white shadow-md shadow-[#FF5A00]/15"
                      : "text-[#111111]/55 hover:text-[#111111]"
                  }`}
                >
                  <Package size={14} />
                  ITEMS
                </button>

                {/* Customers Tab */}
                <button
                  onClick={() => setActiveTab("customers")}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl transition-all duration-300 ${
                    activeTab === "customers"
                      ? "bg-[#FF5A00] text-white shadow-md shadow-[#FF5A00]/15"
                      : "text-[#111111]/55 hover:text-[#111111]"
                  }`}
                >
                  <Users size={14} />
                  CUSTOMERS
                </button>

                {/* Delivery Tab */}
                <button
                  onClick={() => setActiveTab("delivery")}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl transition-all duration-300 ${
                    activeTab === "delivery"
                      ? "bg-[#FF5A00] text-white shadow-md shadow-[#FF5A00]/15"
                      : "text-[#111111]/55 hover:text-[#111111]"
                  }`}
                >
                  <Truck size={14} />
                  DELIVERY
                </button>
              </div>
            </div>

            {/* Refresh Controller */}
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 border border-[#111111]/10 hover:border-[#FF5A00]/20 bg-white px-4 py-2 rounded-xl text-xs font-black text-[#111111] shadow-sm transition-all hover:bg-[#FFF7F2] active:scale-95 select-none"
            >
              <RefreshCw size={12} className={refreshPulse ? "animate-spin text-[#FF5A00]" : "text-[#111111]/60"} />
              REFRESH
            </button>
          </div>

          {/* Subheader Title */}
          <div className="bg-[#FFFFFF] px-8 pt-6 pb-2">
            <span className="text-[9px] font-black text-[#FF5A00] uppercase tracking-widest bg-[#FFF7F2] border border-[#FF5A00]/15 px-3 py-1 rounded-md inline-block">
              Sales Analytics
            </span>
          </div>

          {/* 2. CARD METRICS GRID (Identical in all tabs) */}
          <div className="bg-[#FFFFFF] px-8 py-6">
            <div className="border border-[#FF5A00]/10 rounded-2xl p-5 bg-white shadow-[0_4px_25px_rgba(255,90,0,0.01)] flex flex-wrap items-center justify-between gap-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 flex-1 min-w-[280px]">
                {/* Total Sales */}
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-[#FFF7F2] border border-[#FF5A00]/15 flex items-center justify-center text-[#FF5A00] shadow-sm shrink-0">
                    <TrendingUp size={18} />
                  </span>
                  <div>
                    <h4 className="text-lg font-black text-[#111111]">₹92.1K</h4>
                    <p className="text-[9px] font-bold text-[#111111]/45 uppercase tracking-wider block">Total Sales</p>
                  </div>
                </div>

                {/* Total Orders */}
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-[#E0F2FE] border border-[#0284C7]/15 flex items-center justify-center text-[#0284C7] shadow-sm shrink-0">
                    <ShoppingBag size={18} />
                  </span>
                  <div>
                    <h4 className="text-lg font-black text-[#111111]">482</h4>
                    <p className="text-[9px] font-bold text-[#111111]/45 uppercase tracking-wider block">Total Orders</p>
                  </div>
                </div>

                {/* New Customers */}
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-[#DCFCE7] border border-[#16A34A]/15 flex items-center justify-center text-[#16A34A] shadow-sm shrink-0">
                    <UserPlus size={18} />
                  </span>
                  <div>
                    <h4 className="text-lg font-black text-[#111111]">28</h4>
                    <p className="text-[9px] font-bold text-[#111111]/45 uppercase tracking-wider block">New Customers</p>
                  </div>
                </div>

                {/* Avg Order Value */}
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-[#F3E8FF] border border-[#9333EA]/15 flex items-center justify-center text-[#9333EA] shadow-sm shrink-0">
                    <Clock size={18} />
                  </span>
                  <div>
                    <h4 className="text-lg font-black text-[#111111]">₹267.22</h4>
                    <p className="text-[9px] font-bold text-[#111111]/45 uppercase tracking-wider block">Avg Order Value</p>
                  </div>
                </div>
              </div>

              {/* Time Dropdown filter */}
              <button className="flex items-center justify-between border border-[#111111]/10 bg-white hover:bg-[#F5F5F7] px-4 py-2.5 rounded-xl text-xs font-bold text-[#111111] shadow-sm w-36 shrink-0 transition-colors">
                <span className="flex items-center gap-2 text-[#111111]/60">
                  <Calendar size={14} />
                  All Time
                </span>
                <ChevronDown size={14} className="text-[#111111]/40" />
              </button>
            </div>
          </div>

          {/* 3. DYNAMIC CONTENT SPLIT GRID */}
          <div className="bg-[#FFFFFF] px-8 pb-8">
            {activeTab === "overview" && (
              // --- OVERVIEW TAB CONTENT (Screenshot 1) ---
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Sales Trend Line Chart Card */}
                <div className="lg:col-span-8 bg-white border border-[#FF5A00]/10 rounded-2xl p-6 shadow-[0_4px_25px_rgba(255,90,0,0.01)] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#111111]/5">
                    <h3 className="text-sm font-black text-[#111111] tracking-tight uppercase">Sales Trend</h3>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black text-[#FF5A00] bg-[#FFF7F2] border border-[#FF5A00]/15">
                        REVENUE ₹92.1K
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-100">
                        ORDERS 345
                      </span>
                    </div>
                  </div>

                  {/* Real-time Sales Trend Area Chart */}
                  <div className="h-[260px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF5A00" stopOpacity={0.08} />
                            <stop offset="95%" stopColor="#FF5A00" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#111111/10" opacity={0.04} />
                        <XAxis
                          dataKey="date"
                          stroke="#111111"
                          opacity={0.35}
                          tickLine={false}
                          axisLine={false}
                          style={{ fontSize: "9px", fontWeight: "bold" }}
                        />
                        <YAxis
                          stroke="#111111"
                          opacity={0.35}
                          tickLine={false}
                          axisLine={false}
                          style={{ fontSize: "9px", fontWeight: "bold" }}
                          tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#FFFFFF",
                            borderRadius: "12px",
                            border: "1px solid rgba(255,90,0,0.12)",
                            boxShadow: "0 8px 30px rgba(0,0,0,0.03)"
                          }}
                          labelStyle={{ fontWeight: "bold", fontSize: "10px", color: "#FF5A00" }}
                          itemStyle={{ fontWeight: "bold", fontSize: "11px", color: "#111111" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#FF5A00"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#revenueGrad)"
                        />
                        <Area
                          type="monotone"
                          dataKey="orders"
                          stroke="#3B82F6"
                          strokeWidth={1}
                          fillOpacity={0}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Order Status Donut Card */}
                <div className="lg:col-span-4 bg-white border border-[#FF5A00]/10 rounded-2xl p-6 shadow-[0_4px_25px_rgba(255,90,0,0.01)] space-y-5">
                  <div className="pb-3 border-b border-[#111111]/5">
                    <h3 className="text-sm font-black text-[#111111] tracking-tight uppercase">Order Status</h3>
                    <p className="text-[10px] text-[#FF5A00] font-black uppercase mt-1">Total Orders: 482</p>
                  </div>

                  {/* Recharts Pie Donut Chart */}
                  <div className="h-[150px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {orderStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Status Legend Grid */}
                  <div className="space-y-2.5">
                    {orderStatusData.map((o) => (
                      <div key={o.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: o.color }} />
                          <span className="font-semibold text-[#111111]/60">{o.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-[#111111]">{o.value}</span>
                          <span className="text-[10px] font-bold text-[#111111]/35">({o.percentage})</span>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-2 border-t border-[#111111]/5 flex justify-between text-xs font-black text-[#111111]">
                      <span>Total</span>
                      <span>482</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === "items" && (
              // --- ITEMS TAB CONTENT (Screenshot 2) ---
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Top Selling Items Card */}
                <div className="lg:col-span-8 bg-white border border-[#FF5A00]/10 rounded-2xl p-6 shadow-[0_4px_25px_rgba(255,90,0,0.01)] space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-[#111111]/5">
                    <h3 className="text-sm font-black text-[#111111] tracking-tight uppercase">Top Selling Items</h3>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100">
                        TOTAL ₹45.5K
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-100">
                        ORDERS 205
                      </span>
                    </div>
                  </div>

                  {/* List of best-selling items */}
                  <div className="space-y-4">
                    {topSellingItems.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 flex-1 min-w-[200px]">
                          {/* Circle Index */}
                          <span className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold ${
                            index === 0
                              ? "bg-[#FFF7F2] border-[#FF5A00]/30 text-[#FF5A00] shadow-sm"
                              : "bg-[#F5F5F7] border-[#111111]/5 text-[#111111]/50"
                          }`}>
                            {index === 0 ? <Star size={10} className="fill-[#FF5A00]" /> : index + 1}
                          </span>
                          
                          {/* Item Descriptions */}
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-center text-xs sm:text-sm font-black text-[#111111]">
                              <span>{item.name}</span>
                              <span className="font-black text-[#111111]/80">{item.revenue}</span>
                            </div>
                            
                            {/* Horizontal Progress Bar */}
                            <div className="flex items-center gap-3">
                              <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#FF5A00] to-[#FF8A3D] rounded-full"
                                  style={{ width: `${item.percentage}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-semibold text-[#111111]/40 shrink-0">
                                {item.orders} orders · {item.sold} sold
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Revenue by Category Bar Chart Card */}
                <div className="lg:col-span-4 bg-white border border-[#FF5A00]/10 rounded-2xl p-6 shadow-[0_4px_25px_rgba(255,90,0,0.01)] space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-[#111111]/5">
                    <h3 className="text-sm font-black text-[#111111] tracking-tight uppercase">Revenue by Category</h3>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100">
                        TOTAL ₹91.9K
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-100">
                        ITEMS 4
                      </span>
                    </div>
                  </div>

                  {/* Recharts Bar Chart */}
                  <div className="h-[180px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryRevenueData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#111111/10" opacity={0.04} />
                        <XAxis
                          dataKey="category"
                          stroke="#111111"
                          opacity={0.35}
                          tickLine={false}
                          axisLine={false}
                          style={{ fontSize: "8px", fontWeight: "bold" }}
                        />
                        <YAxis
                          stroke="#111111"
                          opacity={0.35}
                          tickLine={false}
                          axisLine={false}
                          style={{ fontSize: "8px", fontWeight: "bold" }}
                          tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val}`}
                        />
                        <Tooltip />
                        <Bar
                          dataKey="revenue"
                          fill="#FF5A00"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={30}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Statistics Legend Table */}
                  <div className="space-y-2.5">
                    {categoryRevenueData.map((c) => (
                      <div key={c.category} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A00] shrink-0" />
                          <span className="font-semibold text-[#111111]/60">
                            {c.category} <span className="text-[10px] font-bold text-[#111111]/30">({c.share})</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold">
                          <span className="font-black text-[#111111]">{`₹${(c.revenue / 1000).toFixed(1)}K`}</span>
                          <span className="text-[#111111]/40 shrink-0 w-8 text-right font-black">{c.orders}</span>
                        </div>
                      </div>
                    ))}

                    <div className="pt-2 border-t border-[#111111]/5 flex justify-between text-xs font-black text-[#111111]">
                      <span>Total</span>
                      <div className="flex gap-4">
                        <span>₹91.9K</span>
                        <span className="w-8 text-right">341</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === "customers" && (
              // --- CUSTOMERS TAB CONTENT (Screenshot 3 - Masking phone numbers for privacy) ---
              <div className="space-y-6">
                {/* Header Subhead */}
                <div className="pb-3 border-b border-[#111111]/5">
                  <h3 className="text-xl font-black text-[#111111] tracking-tight">Customer Insights</h3>
                  <p className="text-xs text-[#111111]/50 font-semibold mt-1">Analyzing purchase patterns and loyalty across your customer base</p>
                </div>

                {/* Customer List Grid */}
                <div className="space-y-4">
                  {customerInsights.map((c, index) => (
                    <div
                      key={index}
                      className="bg-white border border-[#FF5A00]/10 hover:border-[#FF5A00]/30 rounded-2xl p-5 shadow-[0_4px_20px_rgba(255,90,0,0.01)] hover:shadow-[0_8px_30px_rgba(255,90,0,0.03)] transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      {/* Left Block: Avatar & Name */}
                      <div className="flex items-center gap-4 min-w-[200px]">
                        <span className="w-12 h-12 rounded-xl bg-[#FFF7F2] border border-[#FF5A00]/15 flex items-center justify-center font-black text-[#FF5A00] text-lg shadow-sm shrink-0">
                          {c.name.charAt(0)}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5 font-black text-sm text-[#111111]">
                            <span>{c.name}</span>
                            <ExternalLink size={12} className="text-[#111111]/40 hover:text-[#FF5A00] cursor-pointer" />
                          </div>
                          
                          {/* Masked/Hidden Mobile Number */}
                          <div className="flex items-center gap-1 text-[10px] font-bold text-[#111111]/40 mt-0.5">
                            <Phone size={10} />
                            <span>{c.phone}</span>
                          </div>
                          <span className="text-[9px] font-bold text-[#111111]/30 block mt-0.5">ID: {c.id}</span>
                        </div>
                      </div>

                      {/* Middle Block: Core Interest */}
                      <div className="flex-1 max-w-xl">
                        <span className="text-[9px] font-black text-[#FF5A00] tracking-wider uppercase block mb-1">Core Interest</span>
                        <p className="text-xs font-semibold text-[#111111]/80 italic leading-relaxed">
                          "{c.interest}"
                        </p>
                      </div>

                      {/* Right Block: Order Metrics */}
                      <div className="flex flex-wrap items-center gap-6 md:gap-10 shrink-0">
                        {/* Orders count */}
                        <div className="text-center">
                          <span className="text-[9px] font-black text-[#111111]/30 uppercase tracking-widest block mb-1">Orders</span>
                          <div className="flex items-center gap-1.5 justify-center">
                            <ShoppingBag size={12} className="text-[#FF5A00]" />
                            <span className="text-sm font-black text-[#111111]">{c.orders}</span>
                          </div>
                        </div>

                        {/* Invested */}
                        <div className="text-center">
                          <span className="text-[9px] font-black text-[#111111]/30 uppercase tracking-widest block mb-1">Invested</span>
                          <span className="text-sm font-black text-[#111111]">{c.invested}</span>
                        </div>

                        {/* Last Visit */}
                        <div className="text-left md:text-right min-w-[130px]">
                          <span className="text-[9px] font-black text-[#111111]/30 uppercase tracking-widest block mb-1">Last Visit</span>
                          <span className="text-xs font-bold text-[#111111]/70 block">{c.lastVisit}</span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "delivery" && (
              // --- DELIVERY TAB CONTENT (Screenshot 4) ---
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Delivery Donut Card */}
                <div className="lg:col-span-7 bg-white border border-[#FF5A00]/10 rounded-2xl p-6 shadow-[0_4px_25px_rgba(255,90,0,0.01)] space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-[#111111]/5">
                    <h3 className="text-sm font-black text-[#111111] tracking-tight uppercase">Delivery Types</h3>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-100">
                        ORDERS 482
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100">
                        REVENUE ₹1.3L
                      </span>
                    </div>
                  </div>

                  {/* Recharts Pie Donut Chart */}
                  <div className="h-[180px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deliveryTypesData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {deliveryTypesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Statistics Table Legend */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black text-[#111111]/30 uppercase tracking-widest pb-1 border-b border-[#111111]/5">
                      <span>Delivery Type</span>
                      <div className="flex gap-12">
                        <span>Orders</span>
                        <span className="w-16 text-right">Revenue</span>
                      </div>
                    </div>

                    {deliveryTypesData.map((d) => (
                      <div key={d.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="font-semibold text-[#111111]/70 flex items-center gap-1.5">
                            {d.name === "Dine-In" ? <Home size={12} className="text-[#FF5A00]" /> : <MapPin size={12} className="text-[#10B981]" />}
                            {d.name} <span className="text-[10px] font-bold text-[#111111]/30">({d.percentage})</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-12 text-xs font-semibold">
                          <span className="font-black text-[#111111]">{d.value}</span>
                          <span className="font-black text-[#111111] w-16 text-right">{d.revenue}</span>
                        </div>
                      </div>
                    ))}

                    <div className="pt-3 border-t border-[#111111]/5 flex justify-between text-xs font-black text-[#111111]">
                      <span>Total</span>
                      <div className="flex gap-12">
                        <span>482</span>
                        <span className="w-16 text-right">₹1.3L</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Card */}
                <div className="lg:col-span-5 bg-[#FFF7F2]/45 border border-[#FF5A00]/10 rounded-2xl p-6 space-y-4">
                  <h4 className="text-sm font-black text-[#111111] uppercase tracking-tight">Ecosystem Distribution</h4>
                  <p className="text-xs sm:text-sm font-semibold text-[#111111]/60 leading-relaxed">
                    Delycia automatically dynamically maps dining types based on QR triggers. Dine-in tables immediately route to specific table layouts, while takeaway requests bypass waitlist assignments and alert dispatchers when prepared.
                  </p>
                  <div className="p-4 bg-white rounded-xl border border-[#FF5A00]/10 space-y-2">
                    <span className="text-[9px] font-black text-[#FF5A00] uppercase tracking-widest block">Average turnover</span>
                    <h5 className="text-xs font-black text-[#111111]">Table preparation speeds: +32%</h5>
                    <p className="text-[11px] text-[#111111]/50 font-semibold leading-relaxed">
                      Instant table payments and self-ordering workflows completely reduce order cycle latency by an average of 18 minutes per party.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
