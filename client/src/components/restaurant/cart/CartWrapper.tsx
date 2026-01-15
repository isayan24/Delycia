"use client";

import { usePathname } from "next/navigation";
import BottomCart from "./BottomCart";
import { useItemStore } from "@/store/orderStore";
import { useState, useEffect } from "react";
import { useNavVisibility } from "@/utils/scrollUtils";
import { useMediaQuery } from "react-haiku";

const CartWrapper = () => {
  const showCartItems = useItemStore((state) => state.items);
  const [isVisible, setIsVisible] = useState(false);
  const isNavVisible = useNavVisibility((state) => state.isNavVisible);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const isCartPage = pathname === "/cart";
  const isCheckoutPage = pathname === "/checkout";
  const mobileView = useMediaQuery("(max-width: 700px)", false);

  // Ensure client-side only rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showCartItems.length > 0 && !isCartPage) {
      // Small delay to ensure the transition works
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [showCartItems.length, isCartPage]);

  // Return null during server-side rendering
  if (!mounted) return null;

  if (isCartPage || isCheckoutPage || showCartItems.length === 0) {
    return null;
  }

  return (
    <div className="mt-[6rem] ">
      <div
        className={`fixed bottom-0 left-0 w-full z-50 transition-all duration-300  mt-[6rem]
        ${isNavVisible && mobileView ? "mb-[3.5rem]" : "mb-0"}`}
      >
        <div
          className={`transition-all ease-in-out duration-300${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <BottomCart className="" />
        </div>
      </div>
    </div>
  );
};

export default CartWrapper;
