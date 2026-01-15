import { Button } from "@/components/ui/button";
import React from "react";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";
import cart from "../../../../public/empty-cart-alt.svg";

export default function EmptyCheckout() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-6 relative w-96 h-96">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cart}
          alt="Empty Cart"
          className="object-cover w-full h-full"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/empty-cart-alt.svg";
          }}
        />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Your cart is empty add item to cart to checkout payment
      </h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Looks like you haven&apos;t added anything to your cart yet. Explore our
        delicious menu and add some items!
      </p>
      <div className="flex gap-4">
        <Button
          onClick={() => router.push("/")}
          className="rounded-xl py-6 px-8 text-lg font-semibold bg-[#DC7F02] text-white hover:bg-[#e08a1ae0] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <Home className="w-5 h-5" />
          Browse Menu
        </Button>
      </div>
    </div>
  );
}
