import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, Wifi, Clock, ChefHat, Bell, 
  Plus, Minus, Trash2, CheckCircle, Activity, 
  RefreshCw, Server, Database, Check, ShoppingCart, CreditCard 
} from "lucide-react";

interface Order {
  id: string;
  table: string;
  items: string;
  status: "Pending" | "Preparing" | "Served";
  price: string;
  time: string;
}

const MENU_ITEMS = [
  { 
    id: "biryani", 
    name: "Chicken Biryani - Half", 
    price: 165, 
    desc: "Mild in spice but rich in dry fruits, saffron, and yogurt. Sometimes infused with apple or apricot flavors", 
    tag: "1x Paneer Topping",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=150&auto=format&fit=crop&q=80"
  },
  { 
    id: "pizza", 
    name: "Peppy Paneer Pizza", 
    price: 190, 
    desc: "A flavor-packed vegetarian option with chunky paneer, crisp capsicum, and spicy red pepper.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&auto=format&fit=crop&q=80"
  }
];

const initialOrders: Order[] = [
  {
    id: "ORD-9281",
    table: "Table 04",
    items: "1x Chicken Biryani - Half, 1x Peppy Paneer Pizza",
    status: "Preparing",
    price: "₹355",
    time: "2 mins ago"
  },
  {
    id: "ORD-9280",
    table: "Table 09",
    items: "1x Peppy Paneer Pizza",
    status: "Pending",
    price: "₹190",
    time: "Just now"
  },
  {
    id: "ORD-9279",
    table: "Table 15",
    items: "2x Chicken Biryani - Half",
    status: "Served",
    price: "₹330",
    time: "5 mins ago"
  }
];

export default function RealTimeOperations() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [cart, setCart] = useState<Record<string, number>>({
    biryani: 1,
    pizza: 1
  });
  const [selectedTable] = useState("Table 04");
  const [isSending, setIsSending] = useState(false);
  const [packetLocation, setPacketLocation] = useState<"idle" | "sending" | "arrived">("idle");
  const [lastLatency, setLastLatency] = useState<number | null>(null);
  const [wsLogs, setWsLogs] = useState<Array<{ id: string; time: string; event: string; payload: string }>>([
    { id: "log-1", time: new Date().toLocaleTimeString(), event: "WS_CONNECT", payload: "Socket.IO Client handshaked with BFF Gateway" },
    { id: "log-2", time: new Date().toLocaleTimeString(), event: "REDIS_SUBSCRIBE", payload: "Central Node subscribed to multi-tenant pub/sub queue" }
  ]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Play synthesized retro SFX using Web Audio API
  const playSound = (type: "send" | "prepare" | "serve") => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === "send") {
        // Uplifting futuristic sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(980, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === "prepare") {
        // Warm cooking sizzle chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.setValueAtTime(650, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === "serve") {
        // Radiant sub-second bell chord
        const frequencies = [587.33, 783.99, 1174.66]; // D5, G5, D6
        frequencies.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.04);
          gain.gain.setValueAtTime(0.06, ctx.currentTime + index * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.04 + 0.55);
          osc.start(ctx.currentTime + index * 0.04);
          osc.stop(ctx.currentTime + index * 0.04 + 0.55);
        });
      }
    } catch (e) {
      console.warn("AudioContext blocked or unsupported:", e);
    }
  };

  // Add Log helper
  const addLog = (event: string, payload: string) => {
    setWsLogs(prev => [
      ...prev,
      {
        id: `log-${Math.random()}`,
        time: new Date().toLocaleTimeString(),
        event,
        payload
      }
    ].slice(-6)); // Keep latest 6 logs
  };

  // Scroll terminal logs to bottom automatically
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [wsLogs]);

  // Adjust cart items
  const updateCartQty = (id: string, delta: number) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = MENU_ITEMS.find(m => m.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const cartItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);

  // Dispatch live order trigger
  const handlePlaceOrder = () => {
    if (cartItemsCount === 0 || isSending) return;

    setIsSending(true);
    setPacketLocation("sending");
    playSound("send");
    
    // Log outbound WebSocket event
    const orderItemsString = Object.entries(cart)
      .map(([id, qty]) => {
        const item = MENU_ITEMS.find(m => m.id === id);
        return `${qty}x ${item?.name}`;
      })
      .join(", ");
    
    const priceStr = `₹${cartTotal}`;

    addLog("CLIENT_WS_EMIT", `order:place -> { table: "${selectedTable}", items: "${orderItemsString}", total: "${priceStr}" }`);

    // Latency calculation simulation
    const startTime = performance.now();

    setTimeout(() => {
      const endTime = performance.now();
      const calculatedLatency = Math.round(endTime - startTime + 8); // Simulating 11-15ms realistic latency
      setLastLatency(calculatedLatency);
      setPacketLocation("arrived");

      // Log Redis pub/sub routing
      addLog("REDIS_PUB_SUB", `Routed event 'order:placed' across tenant node. Sync latency: ${calculatedLatency}ms`);

      const newOrder: Order = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        table: selectedTable,
        items: orderItemsString,
        status: "Pending",
        price: priceStr,
        time: "Just now"
      };

      setOrders(prev => [newOrder, ...prev]);
      
      // Emit inbound event to kitchen client
      addLog("KITCHEN_WS_RECEIVE", `order:new -> Appended to kitchen KDS Queue. Sync verified.`);

      setTimeout(() => {
        setIsSending(false);
        setPacketLocation("idle");
      }, 600);
    }, 1200); // 1.2s flight simulation for visual appeal
  };

  // Kitchen State Controllers
  const handleNextStatus = (orderId: string, currentStatus: "Pending" | "Preparing" | "Served") => {
    let nextStatus: "Pending" | "Preparing" | "Served";
    let logEvent = "";
    let logMsg = "";
    let soundType: "send" | "prepare" | "serve" = "prepare";

    if (currentStatus === "Pending") {
      nextStatus = "Preparing";
      logEvent = "KITCHEN_COOK_START";
      logMsg = `Order ${orderId} shifted to PREPARING status. Fire active.`;
      soundType = "prepare";
    } else if (currentStatus === "Preparing") {
      nextStatus = "Served";
      logEvent = "KITCHEN_SERVED";
      logMsg = `Order ${orderId} delivered to table successfully.`;
      soundType = "serve";
    } else {
      return;
    }

    playSound(soundType);
    addLog(logEvent, logMsg);

    setOrders(prev => 
      prev.map(o => o.id === orderId ? { ...o, status: nextStatus, time: "Just now" } : o)
    );
  };

  return (
    <section id="realtime" className="py-24 bg-[#FFF7F2]/20 border-y border-[#FF5A00]/5 relative overflow-hidden">
      {/* Dynamic abstract radial glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-[#FF5A00]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/3 rounded-full blur-[80px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10 max-w-6xl">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF7F2] border border-[#FF5A00]/15 shadow-sm relative">
            <span className="flex h-2 w-2 rounded-full bg-[#FF5A00] animate-ping absolute" />
            <span className="flex h-2 w-2 rounded-full bg-[#FF5A00]" />
            <span className="text-[10px] font-black text-[#FF5A00] uppercase tracking-widest">
              Live Interactive Sandbox
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111111] tracking-tight">
            Sub-Second Event Synchronization
          </h2>
          <p className="text-base sm:text-lg text-[#111111]/55 max-w-2xl mx-auto font-medium leading-relaxed">
            Experience it live. Customize quantities below, tap **Proceed to Checkout**, and watch the live Socket.IO transaction synchronize instantly with the kitchen KDS board!
          </p>
        </div>

        {/* Real-Time Sandbox Interface */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch mb-12">
          
          {/* LEFT PANEL: Customer Mobile QR Interface (iPhone Frame) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-3 mb-2 flex items-center justify-between pl-1">
              <span className="text-[10px] font-extrabold text-[#111111]/45 uppercase tracking-widest">Device 1: Customer Browser</span>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                <Wifi size={10} className="animate-pulse" /> Live Session
              </span>
            </div>

            {/* Smart Phone Simulator Body */}
            <div className="bg-[#111111] p-3 rounded-[38px] shadow-[0_25px_60px_rgba(17,17,17,0.12)] border-4 border-[#FFF7F2] relative w-full max-w-[290px] mx-auto flex-1 flex flex-col">
              
              {/* Speaker Notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-4.5 bg-[#111111] rounded-b-2xl z-30 flex items-center justify-center">
                <div className="w-10 h-1 bg-white/20 rounded-full mb-1" />
              </div>

              {/* iPhone screen container */}
              <div className="bg-[#FFFFFF] rounded-[28px] p-2 pt-6 flex-1 flex flex-col justify-between relative overflow-hidden border border-neutral-100">
                <div className="flex-1 flex flex-col min-h-0">
                  
                  {/* Title Header inside phone */}
                  <div className="flex items-center justify-between mb-4 select-none shrink-0 border-b border-neutral-50 pb-2">
                    <span className="text-[11px] font-black text-[#111111] tracking-tight uppercase">Your Order</span>
                    <span className="text-[7.5px] font-bold text-[#FF5A00] bg-[#FFF7F2] px-1.5 py-0.5 rounded border border-[#FF5A00]/15 select-none font-sans uppercase">
                      Active QR
                    </span>
                  </div>

                  {/* Menu items inside phone - EXACTLY matching user screenshot */}
                  <div className="flex-1 overflow-y-auto pr-1 select-none space-y-1 scrollbar-thin">
                    {MENU_ITEMS.map((item) => {
                      const qty = cart[item.id] || 0;
                      return (
                        <div 
                          key={item.id} 
                          className={`relative py-3 flex items-start gap-2.5 border-b border-[#111111]/5 last:border-0 transition-opacity duration-200 ${
                            qty === 0 ? "opacity-30" : "opacity-100"
                          }`}
                        >
                          {/* Check Icon on the far left */}
                          

                          {/* Image */}
                          <img 
                            src={item.image} 
                            className="w-14 h-14 object-cover rounded-xl shrink-0 shadow-sm border border-neutral-100 mt-0.5" 
                            alt={item.name} 
                          />

                          {/* Details Container */}
                          <div className="flex-1 min-w-0 pr-1 text-left">
                            <h5 className="text-[12px] font-bold text-[#111111] mt-1 leading-tight">{item.name}</h5>
                            
                            {item.tag && (
                              <div className="mt-1">
                                <span className="text-[7px] font-bold bg-[#F5F5F7] px-1.5 py-0.5 rounded border border-[#111111]/5 text-[#111111]/45 uppercase tracking-wide">
                                  {item.tag}
                                </span>
                              </div>
                            )}

                            {/* Quantity Controller Orange Pill matching user screenshot exactly */}
                            <div className="mt-2 shrink-0 w-fit min-w-[85px]">
                              <div className="bg-[#FF5A00] hover:bg-[#FF7A30] text-white flex items-center justify-between rounded-lg px-2.5 py-1 text-[19px] font-extrabold shadow-sm transition-all duration-200">
                                <button 
                                  onClick={() => updateCartQty(item.id, -1)}
                                  className="text-white hover:scale-110 active:scale-90 font-black p-0.5 cursor-pointer"
                                >
                                  <Trash2 size={12} className="stroke-[3px]" />
                                </button>
                                <span className="font-black text-[12px] w-4 text-center">{qty}</span>
                                <button 
                                  onClick={() => updateCartQty(item.id, 1)}
                                  className="text-white hover:scale-110 active:scale-90 font-black p-0.5 cursor-pointer"
                                >
                                  <Plus size={12} className="stroke-[3px]" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Price on the far right */}
                          <div className="pt-1 shrink-0 text-right">
                            <span className="text-[10px] font-black text-[#111111]/50">₹{item.price}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Order Summary Card matching user screenshot exactly */}
                <div className="pt-10 border-t border-neutral-100 mt-auto shrink-0 select-none bg-white">
                  <div className="bg-[#FFFFFF] border border-[#111111]/5 rounded-2xl p-3 space-y-2 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                    
                    {/* Header */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-5.5 h-5.5 rounded-full bg-[#FF5A00] flex items-center justify-center text-white shrink-0">
                        <ShoppingCart size={11} className="stroke-[2.5px]" />
                      </div>
                      <span className="text-[10.5px] font-extrabold text-[#111111]">Order Summary</span>
                    </div>

                    {/* Dashed line */}
                    <div className="border-t border-[#111111]/10 border-dashed my-1" />

                    {/* Grand Total Row (Only ONE price at bottom) */}
                    <div className="flex justify-between items-center text-xs font-black py-0.5">
                      <div className="text-left">
                        <span className="text-[#111111] text-[10.5px] font-black">Grand Total</span>
                      </div>
                      <span className="text-[#111111] text-xs font-black">₹{cartTotal.toFixed(2)}</span>
                    </div>

                    {/* Proceed to Checkout Button */}
                    <button
                      onClick={handlePlaceOrder}
                      disabled={cartItemsCount === 0 || isSending}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wide transition-all duration-300 shadow-md mt-1 ${
                        cartItemsCount === 0
                          ? "bg-neutral-100 text-neutral-300 cursor-not-allowed shadow-none border border-neutral-200/50"
                          : isSending
                          ? "bg-emerald-500 text-white shadow-emerald-500/10 cursor-not-allowed border border-emerald-500/10"
                          : "bg-[#D67300] hover:bg-[#FF5A00] text-white hover:scale-[1.01] active:scale-[0.98] border border-orange-600/10 shadow-orange-600/5 cursor-pointer"
                      }`}
                    >
                      {isSending ? (
                        <>
                          <RefreshCw size={11} className="animate-spin" />
                          <span>Syncing KDS...</span>
                          <span className="opacity-0">→</span>
                        </>
                      ) : (
                        <>
                          <CreditCard size={11} className="stroke-[2.5px]" />
                          <span>Proceed to Checkout</span>
                          <span className="font-sans font-bold">→</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* CENTER PANEL: Interactive Network Sync Conduit */}
          <div className="lg:col-span-2 flex flex-col justify-center items-center relative min-h-[160px] lg:min-h-0 py-8 lg:py-0 select-none">
            
            {/* Background vector connection lines */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-0.5 lg:w-0.5 lg:h-[80%] bg-gradient-to-r lg:bg-gradient-to-b from-[#FF5A00]/10 via-[#FF8A3D]/25 to-emerald-500/10" />

            {/* Glowing Pipeline Nodes */}
            <div className="flex lg:flex-col items-center justify-between w-full lg:h-[70%] max-w-[280px] lg:max-w-none relative z-10">
              
              {/* WS client node */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-9 h-9 rounded-full bg-white border border-[#FF5A00]/30 shadow-md flex items-center justify-center text-[#FF5A00] relative">
                  <Wifi size={16} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A00] animate-ping absolute -top-0.5 -right-0.5" />
                </div>
                <span className="text-[8px] font-black text-[#111111]/40 uppercase tracking-widest mt-1 hidden lg:block">WebSocket</span>
              </div>

              {/* BFF server node */}
              <div className="flex flex-col items-center gap-1 shrink-0 relative">
                <div className={`w-10 h-10 rounded-full border shadow-md flex items-center justify-center relative transition-all duration-300 ${
                  packetLocation === "sending" 
                    ? "bg-[#FFF7F2] border-[#FF5A00] text-[#FF5A00] scale-110 shadow-[0_0_15px_rgba(255,90,0,0.2)]" 
                    : "bg-white border-[#111111]/10 text-[#111111]/60"
                }`}>
                  <Server size={18} />
                </div>
                <span className="text-[8px] font-black text-[#111111]/45 uppercase tracking-widest mt-1 hidden lg:block">BFF Layer</span>
                
                {/* Visual spark node for mobile/responsive */}
                <div className="absolute -top-1 -right-1 text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded border border-emerald-100 hidden lg:block scale-75">BFF</div>
              </div>

              {/* Redis publish node */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className={`w-9 h-9 rounded-full border shadow-md flex items-center justify-center transition-all duration-300 ${
                  packetLocation === "arrived"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-600 scale-110"
                    : "bg-white border-[#111111]/10 text-[#111111]/60"
                }`}>
                  <Database size={15} />
                </div>
                <span className="text-[8px] font-black text-[#111111]/40 uppercase tracking-widest mt-1 hidden lg:block">Redis Pub/Sub</span>
              </div>
            </div>

            {/* Flying dynamic WS Packet */}
            {packetLocation === "sending" && (
              <motion.div
                initial={{ x: -120, y: 0, opacity: 0, scale: 0.8 }}
                animate={{ x: 120, y: 0, opacity: 1, scale: 1.25 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
                className="absolute w-8 h-8 rounded-full bg-[#FF5A00] text-white flex items-center justify-center shadow-[0_0_20px_#FF5A00] z-20 pointer-events-none lg:hidden"
              >
                <Zap size={14} className="fill-current text-white animate-pulse" />
              </motion.div>
            )}

            {packetLocation === "sending" && (
              <motion.div
                initial={{ x: 0, y: -160, opacity: 0, scale: 0.8 }}
                animate={{ x: 0, y: 160, opacity: 1, scale: 1.25 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
                className="absolute w-8 h-8 rounded-full bg-[#FF5A00] text-white flex items-center justify-center shadow-[0_0_20px_#FF5A00] z-20 pointer-events-none hidden lg:flex"
              >
                <Zap size={14} className="fill-current text-white animate-pulse" />
              </motion.div>
            )}
          </div>

          {/* RIGHT PANEL: Live Simulated Kitchen Console KDS (iMac Screen) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            
            {/* HUD Status Header */}
            <div className="space-y-3 mb-2 flex items-center justify-between pl-1">
              <span className="text-[10px] font-extrabold text-[#111111]/45 uppercase tracking-widest">Device 2: Kitchen KDS Console</span>
              
              <div className="flex gap-2 items-center">
                {lastLatency && (
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1 animate-pulse shrink-0">
                    <Activity size={9} /> Sync: {lastLatency}ms
                  </span>
                )}
                <span className="text-[9px] font-bold text-[#FF5A00] bg-[#FFF7F2] px-2 py-0.5 rounded border border-[#FF5A00]/10 flex items-center gap-1 shrink-0">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full" /> Central Sub
                </span>
              </div>
            </div>

            {/* iMac Console Shell */}
            <div className="bg-[#FFFFFF] border border-[#FF5A00]/15 rounded-3xl p-5 md:p-6 shadow-[0_25px_60px_rgba(255,90,0,0.05),_0_0_1px_rgba(255,90,0,0.15)] flex-1 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FF5A00]/15 to-transparent" />

              {/* Console Screen bar */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#111111]/5 mb-4 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A00]/30 shadow-inner" />
                  <span className="text-[9px] font-extrabold text-[#111111]/50 uppercase tracking-widest">KDS Operations Board</span>
                </div>
                
                <span className="text-[8px] font-extrabold text-[#111111]/35 tracking-wider uppercase flex items-center gap-1 bg-[#F5F5F7] border border-[#111111]/5 px-2 py-0.5 rounded">
                  <Clock size={8} /> Auto-stream
                </span>
              </div>

              {/* Kitchen active orders list */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[420px] pr-1 scrollbar-thin">
                <AnimatePresence mode="popLayout">
                  {orders.map((o) => (
                    <motion.div
                      key={o.id}
                      layout
                      initial={{ opacity: 0, x: 25, scale: 0.98 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -25, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 140, damping: 15 }}
                      className={`p-3.5 bg-white border rounded-2xl flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden group/order ${
                        o.status === "Pending"
                          ? "border-[#FF5A00]/25 shadow-[0_4px_15px_rgba(255,90,0,0.02)]"
                          : o.status === "Preparing"
                          ? "border-amber-400/20 shadow-[0_4px_15px_rgba(245,158,11,0.01)]"
                          : "border-[#111111]/5 opacity-75 hover:opacity-100"
                      }`}
                    >
                      {/* Left accent color indicator based on state */}
                      <div className={`absolute top-0 left-0 w-1.5 h-full transition-all duration-300 ${
                        o.status === "Pending"
                          ? "bg-[#FF5A00]"
                          : o.status === "Preparing"
                          ? "bg-amber-50 animate-pulse"
                          : "bg-emerald-50"
                      }`} />

                      <div className="flex items-center justify-between mb-2 pl-1.5">
                        <div className="flex items-center gap-2">
                          <span className="p-2 py1Z rounded-lg bg-[#FFF7F2] border border-[#FF5A00]/15 flex items-center justify-center font-black text-[#FF5A00] text-[10px] shadow-sm">
                            {o.table}
                          </span>
                          <div>
                            <h4 className="text-[10px] font-extrabold text-[#111111]">{o.id}</h4>
                            <p className="text-[8px] font-bold text-[#111111]/35">{o.time}</p>
                          </div>
                        </div>

                        {/* Operational State Badge */}
                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-extrabold uppercase tracking-wider border shrink-0 ${
                          o.status === "Pending"
                            ? "text-[#FF5A00] bg-[#FFF7F2] border-[#FF5A00]/25 animate-pulse"
                            : o.status === "Preparing"
                            ? "text-amber-600 bg-amber-50 border-amber-200"
                            : "text-emerald-600 bg-emerald-50 border-emerald-200/50"
                        }`}>
                          {o.status}
                        </span>
                      </div>

                      {/* Items details */}
                      <p className="text-[11px] font-bold text-[#111111]/70 leading-normal pl-1.5 mb-3.5 pr-2">
                        {o.items}
                      </p>

                      {/* Action trigger button inside card */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-[#111111]/5 pl-1.5 shrink-0">
                        <span className="text-[10px] font-black text-[#111111]/80">{o.price}</span>
                        
                        {o.status !== "Served" ? (
                          <button
                            onClick={() => handleNextStatus(o.id, o.status)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
                              o.status === "Pending"
                                ? "bg-[#FF5A00] hover:bg-[#FF7A30] text-white shadow-sm hover:scale-[1.02] cursor-pointer"
                                : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:scale-[1.02] cursor-pointer"
                            }`}
                          >
                            {o.status === "Pending" ? (
                              <>
                                <ChefHat size={10} /> Start Cooking
                              </>
                            ) : (
                              <>
                                <CheckCircle size={10} /> Serve Dish
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50/50 px-2 py-1 rounded-md flex items-center gap-1">
                            ✅ Delivered (Instant sync)
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </div>

        {/* BOTTOM TERMINAL WIDGET: Simulated WebSocket Event Logger */}
        <div className="max-w-4xl mx-auto select-none lg:pl-9">
          <div className="bg-[#111111] rounded-2xl border border-[#FF5A00]/15 overflow-hidden shadow-lg">
            
            {/* Terminal Header */}
            <div className="bg-[#1C1C1E] px-4 py-2 flex items-center justify-between border-b border-[#111111]/80 select-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A00]/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A3D]/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/30" />
                <span className="text-[9px] font-bold text-white/40 font-mono tracking-wider uppercase ml-2">WebSocket Network Console logs</span>
              </div>
              
              <div className="flex items-center gap-2 text-[8px] font-mono font-bold text-[#FF5A00] bg-[#FF5A00]/5 px-2 py-0.5 rounded border border-[#FF5A00]/15 uppercase">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Connection Established
              </div>
            </div>

            {/* Terminal output screen */}
            <div 
              ref={logContainerRef}
              className="p-4 font-mono text-[10px] text-neutral-300 leading-relaxed overflow-y-auto max-h-[140px] space-y-1.5 select-text text-left scrollbar-thin scrollbar-thumb-neutral-800"
            >
              {wsLogs.map((log) => (
                <div key={log.id} className="flex flex-col sm:flex-row gap-1 sm:gap-4 hover:bg-neutral-900/50 p-1 rounded transition-colors duration-150">
                  <span className="text-white/20 select-none shrink-0 font-light">{log.time}</span>
                  <span className={`font-black shrink-0 ${
                    log.event === "CLIENT_WS_EMIT" 
                      ? "text-[#FF5A00]" 
                      : log.event === "KITCHEN_WS_RECEIVE"
                      ? "text-cyan-400"
                      : log.event === "REDIS_PUB_SUB"
                      ? "text-emerald-400"
                      : "text-amber-500"
                  }`}>
                    [{log.event}]
                  </span>
                  <span className="text-neutral-300 break-all">{log.payload}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
