"use client";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { useItemStore } from "@/store/orderStore";
export default function CartLogo() {
  const showCartItems = useItemStore((state) => state.items);
  const [showCart, setShowCart] = useState(false);
  return (
    <Link href="/cart">
      <div className="relative">
        <ShoppingCart className="w-6 h-6" />
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-sm w-4 h-4 rounded-full flex justify-center items-center">
          {showCartItems.length}
        </div>
      </div>
    </Link>
  );
}
