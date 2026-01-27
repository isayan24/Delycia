import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { usePathname, useRouter } from "@/lib/next-compat";
import { toast } from "sonner";
import {
  BadgeDollarSign,
  Check,
  ShoppingCart,
  Clock,
  CreditCard,
  Loader2,
} from "lucide-react";
import { useNavVisibility } from "@/utils/scrollUtils";

export default function CartSidebar({
  totalTime,
  totalPrice,
  selectedItems,
}: any) {
  const router = useRouter();
  const isNavVisible = useNavVisibility((state) => state.isNavVisible);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  const checkoutHandler = () => {
    setIsLoading(true);
    try {
      if (selectedItems.length > 0) {
        router.push("/checkout");
        if (pathname === "/checkout") {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        toast.error("Please select at least one item");
      }
    } catch (error) {
      setIsLoading(false);
      toast.error("Please select at least one item");
    }
  };

  // todo: later add gst when needed
  const subtotal = totalPrice;

  // const gst = 12;
  // const gstAmount = (subtotal * gst) / 100;
  // const grandTotal = subtotal + gstAmount;
  const grandTotal = subtotal;

  // fix discount if 0
  const cartSidebarUi = [
    {
      sidebarBox:
        "py-7 flex flex-col gap-5 rounded-3xl p-3 border border-[#00000010] w-[22rem] shadow-md bg-white backdrop-blur-sm dark:shadow-gray-500 dark:text-black dark:bg-white dark:border-none max-[1000px]:w-full",
      orderTitle: "text-2xl font-bold text-gray-800 flex items-center",

      orderSummaryBox:
        "bg-gradient-to-r from-orange-500 to-orange-600 text-white p-2 rounded-xl mr-3 shadow-sm",
      paymentInfoTitles:
        "flex justify-between items-center text-base sm:text-lg",
      discountSectionBox:
        "py-5 flex flex-col gap-4 rounded-3xl p-3 border border-[#00000010] w-[22rem] shadow-md bg-white backdrop-blur-sm dark:shadow-gray-500 dark:text-black dark:bg-white dark:border-none max-[1000px]:w-full",
      discountSectionTitle:
        "text-xl font-semibold text-gray-800 flex items-center",
      deliveryTimeBox:
        "flex items-center justify-center text-sm text-gray-600 mt-1 bg-orange-50 py-2 px-3 rounded-xl",
      inputBox:
        "pr-20 py-6 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500 dark:border-[#00000027] shadow-sm",
      applyButton:
        "absolute right-3 top-2.5 rounded-lg bg-orange-50 px-4 py-1.5 font-medium text-orange-600 text-sm hover:bg-orange-100 transition-colors",
      checkoutButton:
        "max-[700px]:w-[90%] w-full rounded-xl py-7 text-lg font-semibold bg-[#DC7F02] text-white  hover:bg-[#e08a1ae0] max-[700px]:hover:bg-[#DC7F02] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center max-[700px]:fixed bottom-2 left-1/2 z-[999] max-[700px]:-translate-x-1/2",
    },
  ];

  return (
    <main className="space-y-4 sticky top-[4rem] h-full">
      <section className={cartSidebarUi[0].sidebarBox}>
        <h1 className={cartSidebarUi[0].orderTitle}>
          <span className={cartSidebarUi[0].orderSummaryBox}>
            <ShoppingCart className="w-5 h-5" />
          </span>
          Order Summary
        </h1>

        {/* mark amount to be paid */}
        <div className="flex flex-col gap-4 bg-gray-50 p-3 rounded-2xl">
          <section className={cartSidebarUi[0].paymentInfoTitles}>
            <h1 className="text-gray-600">Sub Total</h1>
            <h1 className="font-medium">₹{subtotal}</h1>
          </section>

          {/* todo add the discount at here if discount? */}
          {/* {discount > 0 && (
            <section className={cartSidebarUi[0].paymentInfoTitles}>
              <h1 className="flex items-center text-green-600">
                <Check className="w-4 h-4 mr-2" />
                Discount
              </h1>
              <h1 className="font-medium text-green-600">
                - ₹{discount.toFixed(0)}
              </h1>
            </section>
          )} */}

          {/* todo later add gst amount when available */}
          {/* <section className={`${cartSidebarUi[0].paymentInfoTitles} text-sm`}>
            <h1 className="text-gray-600">GST</h1>
            <h1 className="font-medium">
              <span className="text-sm">+</span>
              {gst}%
            </h1>
          </section> */}

          <hr className="border-gray-200 dark:border-[#00000027]" />
          <section className={cartSidebarUi[0].paymentInfoTitles}>
            <h1 className="font-semibold text-gray-800">Grand Total</h1>
            <h1 className="font-bold text-gray-800">
              ₹{grandTotal.toFixed(0)}
            </h1>
          </section>
        </div>

        {/* todo add the discount at here if discount? */}
        {/* {discount > 0 && (
          <div className="mt-1 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-md">
              <div className="p-[14px_16px_16px] bg-[#DC7F02] min-[700px]:py-[20px]">
                <div className="font-medium text-white flex items-center">
                  <BadgeDollarSign className="w-5 h-5 mr-2" />
                  Your total Savings
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs sm:text-sm text-white/80">
                    Includes ₹{totalSavings.toFixed(0)} savings discount
                  </span>
                  <span className="font-bold text-lg text-white">
                    ₹{totalSavings.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )} */}
      </section>

      {/* Checkout button - enhanced and fixed at bottom on mobile */}
      {/* <div className="mt-6 sm:mt-8 w-[22rem] max-[1000px]:w-full relative"> */}
      <Button
        onClick={checkoutHandler}
        className={`${cartSidebarUi[0].checkoutButton} ${isNavVisible ? "bottom-16" : "bottom-2"} transition-all duration-300 ${isLoading ? "!bg-[#e08a1ae0] cursor-not-allowed pointer-events-none" : ""}`}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <CreditCard className="w-5 h-5 mr-2" />
        )}
        {isLoading ? "Processing..." : "Proceed to Checkout"}
      </Button>
      {/* </div> */}

      {/* Space at the bottom on mobile to account for fixed button */}
      <div className="h-20 min-[700px]:h-0 max-[700px]:block hidden"></div>
    </main>
  );
}
