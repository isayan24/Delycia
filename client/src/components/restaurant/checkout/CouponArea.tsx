import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";

export default function CouponArea() {
  const [couponError, setCouponError] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  const cartSidebarUi = [
    {
      discountSectionBox:
        "py-5 flex flex-col gap-4 rounded-3xl p-3 border border-[#00000010] w-[24.5rem] bg-white backdrop-blur-sm dark:shadow-gray-500 dark:text-black dark:bg-white dark:border-none max-[890px]:w-full h-fit",
      discountSectionTitle:
        "text-xl font-semibold text-gray-800 flex items-center",
      inputBox:
        "pr-20 py-6 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500 dark:border-[#00000027] shadow-sm",
      applyButton:
        "absolute right-3 top-2.5 rounded-lg bg-orange-50 px-4 py-1.5 font-medium text-orange-600 text-sm hover:bg-orange-100 transition-colors",
    },
  ];

  const handleCoupon = () => {
    setCouponLoading(true);
    setTimeout(() => {
      setCouponLoading(false);
      setCouponError(true);
    }, 2000);
  };

  return (
    <div className="max-[890px]:w-full">
      <section className={cartSidebarUi[0].discountSectionBox}>
        <h1 className={cartSidebarUi[0].discountSectionTitle}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="w-5 h-5 text-orange-500 mr-1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185Z"
            />
          </svg>
          Have a Coupon?
        </h1>

        <div>
          <div className="relative">
            <Input
              type="text"
              placeholder="Enter Coupon Code"
              className={cartSidebarUi[0].inputBox}
            />
            <button
              onClick={handleCoupon}
              type="button"
              className={cartSidebarUi[0].applyButton}
              disabled={couponLoading}
            >
              {couponLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>
          {couponError && (
            <div className="flex items-center justify-center text-sm text-red-600 mt-1 py-2 px-3 rounded-xl">
              <span className="text-xs">Wrong Coupon Code</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
