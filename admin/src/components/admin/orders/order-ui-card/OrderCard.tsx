
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, X } from "lucide-react";
import { ProcessedOrder } from "@/types/WebSocketOrder";
import { formatOrderTime } from "../utils/orderProcessing";
import { OrderHeader } from "./OrderHeader";
import { OrderItems } from "./OrderItems";
import { OrderSummary } from "./OrderSummary";
import { PrepTimeSelector } from "./PrepTimeSelector";

interface OrderCardProps {
  order: ProcessedOrder;
  onAccept: (customerId: number) => void;
  onReject: (customerId: number) => void;
  onUpdatePrepTime: (customerId: number, time: number) => void;
}

export function OrderCard({
  order,
  onAccept,
  onReject,
  onUpdatePrepTime,
}: OrderCardProps) {
  const [prepTime, setPrepTime] = useState(45);
  const [isMuted, setIsMuted] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds

  // Countdown timer effect
  React.useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAccept = () => {
    onAccept(order.customer_id);
    onUpdatePrepTime(order.customer_id, prepTime);
  };

  const handlePrepTimeChange = (newTime: number) => {
    setPrepTime(Math.max(5, newTime));
  };

  // Determine order type display
  const getOrderTypeDisplay = () => {
    if (order.is_delivery) {
      return "DELIVERY ORDER";
    } else if (order.unique_table_numbers.length > 0) {
      return `TABLE ${order.unique_table_numbers.join(", ")}`;
    }
    return "TAKEAWAY ORDER";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {order.order_count === 1
              ? "1 new order"
              : `${order.order_count} new orders`}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              className="flex items-center gap-2"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
              Mute
            </Button>
            <Button variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Type Header */}
        <div className="bg-purple-100 p-3 rounded-lg">
          <p className="font-semibold text-purple-800 text-center">
            {getOrderTypeDisplay()}
          </p>
        </div>

        {/* Order Header */}
        <OrderHeader
          orderId={order.customer_id.toString()}
          time={formatOrderTime(order.created_at)}
          customerName={order.customer_name}
          customerPhone={order.customer_phone_masked}
          orderCount={`Order from ${order.customer_name}`}
          isPremium={false} // Can be enhanced based on customer data
        />

        {/* Special Instructions - Can be enhanced later */}
        <div className="flex items-center gap-2 text-red-500">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <span className="text-sm">Handle with care</span>
        </div>

        {/* Order Items */}
        <OrderItems items={order.items} />

        {/* Order Summary */}
        <OrderSummary
          itemCount={order.items.length}
          subtotal={order.total_amount}
          taxes={0.0}
          discount={0.0}
          total={order.total_amount}
          isPaid={order.payment_status.toLowerCase() === "paid"}
        />

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm">
            🍽️ KOT
          </Button>
          <Button variant="outline" size="sm">
            📋 ORDER
          </Button>
        </div>

        {/* Prep Time Selector */}
        <PrepTimeSelector
          prepTime={prepTime}
          onPrepTimeChange={handlePrepTimeChange}
        />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
            onClick={() => onReject(order.customer_id)}
          >
            Reject
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={handleAccept}
            disabled={countdown === 0}
          >
            Accept order ({formatCountdown(countdown)})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
