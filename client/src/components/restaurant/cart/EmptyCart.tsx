import { Button } from "@/components/ui/button";
import Image from "@/lib/next-compat";
import React from "react";
import { useRouter } from "@/lib/next-compat";
import { Home } from "lucide-react";
import cart from "../../../../public/empty-cart-alt.svg";
import Link from "@/lib/next-compat";

export default function EmptyCart() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-6 relative w-[15rem] h-[15rem]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cart}
          alt="Empty Cart" 
          className="object-contain"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/empty-cart-alt.svg";
          }}
        />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Your cart is empty
      </h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Looks like you haven&apos;t added anything to your cart yet. Explore our
        delicious menu and add some items!
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          // onClick={() => router.replace("/")}
          className="rounded-xl py-2 px-5 text-lg font-semibold bg-[#DC7F02] text-white hover:bg-[#e08a1ae0] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <Home className="w-5 h-5" />
          Browse Menu
        </Link>
      </div>
    </div>
  );
}
