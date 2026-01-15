import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CartItem, Customer } from "./QuickBillMain";
import { Trash2, Plus, Minus, Printer, CreditCard } from "lucide-react";
import { useMenuStore } from "@/store/useMenuStore";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import ThermalBill from "@/components/admin/order-history/ThermalBill";
import { useAuth } from "@/hooks/useAuth";
import useToast from "@/hooks/UseToast";

interface BillSummaryProps {
  cart: CartItem[];
  updateQuantity: (itemId: string, delta: number) => void;
  selectedCustomer: Customer | null;
  onOrderComplete: () => void;
}

export default function BillSummary({
  cart,
  updateQuantity,
  selectedCustomer,
  onOrderComplete,
}: BillSummaryProps) {
  const { categories } = useMenuStore();
  //   const { toast } = useToast();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showBillDialog, setShowBillDialog] = useState(false);
  const [completedOrderData, setCompletedOrderData] = useState<any>(null);
  const { getValidAccessToken } = useAuth();
  const { showSuccess, showError } = useToast();

  // review
  const totalAmount = cart.reduce(
    (sum, item) => sum + (item.price ?? item.price) * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      showError("Error", "Please login to place an order");
      return;
    }
    if (cart.length === 0) {
      showError("Error", "Cart is empty");
      return;
    }
    if (!selectedCustomer) {
      showError("Error", "Please select a customer");
      return;
    }

    // Try to get RID from categories (assuming they are loaded and belong to the same restaurant)
    const rid = cart[0]?.rid;
    if (!rid) {
      showError("Error", "System Error: Restaurant ID not found");
      return;
    }

    setIsPlacingOrder(true);
    try {
      // Unified payload for /api/quick-bill
      const payload = {
        customerDetails: {
          username: selectedCustomer.username,
          name: selectedCustomer.name,
          phone_number: selectedCustomer.phone_number,
          id: selectedCustomer.id || undefined, // Pass ID if it exists (existing user)
        },
        orderItems: cart.map((item) => ({
          ...item,
          rid: rid,
          order_status: "completed",

          totalItemAmount: item.price * item.quantity,
        })),
        token: accessToken,
      };
      console.log(payload, "payload");

      // Use axios directly for internal Next.js API route to avoid base URL issues
      // Importing locally if not available or assuming axios is available
      const { default: axios } = await import("axios");
      const res = await axios.post("/api/quick-bill", payload);

      if (res.data && (res.data.success || res.data.status === 201)) {
        showSuccess("Success", "Order placed successfully");

        // todo Prepare bill data for printing
        const billData = {
          orderId: res.data.order_id || "New",
          tableNo: "N/A",
          customerName: selectedCustomer.name,
          customerId: selectedCustomer.phone_number,
          items: cart.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price || i.cost_price,
          })),
          totalAmount: totalAmount,
          orderDate: new Date().toLocaleString(),
          paymentMethod: "Cash",
          paymentStatus: "Paid",
        };

        setCompletedOrderData(billData);
        onOrderComplete();
        setShowBillDialog(true);
      } else {
        showError(
          "Error",
          res.data.message || res.data.error || "Failed to place order"
        );
      }
    } catch (error: any) {
      console.error("Order error", error);
      showError(
        "Error",
        error.response?.data?.message || "Error placing order"
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-md border">
      {completedOrderData && showBillDialog && (
        <ThermalBill
          isOpen={showBillDialog}
          onClose={() => {
            setShowBillDialog(false);
            setCompletedOrderData(null);
          }}
          billData={completedOrderData}
        />
      )}

      <ScrollArea className="flex-1 p-4">
        {cart.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">Cart is empty</div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-start bg-white p-3 rounded shadow-sm"
              >
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500">
                    ₹{item.price} x {item.quantity}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => updateQuantity(item.id, -1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-4 text-center text-sm">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 bg-white border-t">
        <div className="flex justify-between items-center mb-4 text-lg font-bold">
          <span>Total</span>
          <span>₹{totalAmount}</span>
        </div>

        <Button
          className="w-full h-12 text-lg"
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder || cart.length === 0 || !selectedCustomer}
        >
          {isPlacingOrder ? "Placing Order..." : "Place Order & Print"}
        </Button>
      </div>
    </div>
  );
}
