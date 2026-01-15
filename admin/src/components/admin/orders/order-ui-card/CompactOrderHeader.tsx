import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Clock } from "lucide-react";
import { ProcessedOrder } from "@/types/WebSocketOrder";
import {
  formatOrderTime,
  formatTimeElapsed,
  calculateTimeElapsed,
} from "../utils/orderProcessing";

interface CompactOrderHeaderProps {
  order: ProcessedOrder;
  statusBadge: React.ReactNode;
  onCall: (customerId: number) => void;
  onViewTimeline: (customerId: number) => void;
  showCallButton?: boolean;
  timeElapsed?: number;
}

export function CompactOrderHeader({
  order,
  statusBadge,
  onCall,
  onViewTimeline,
  showCallButton = false,
  timeElapsed,
}: CompactOrderHeaderProps) {
  const [currentTimeElapsed, setCurrentTimeElapsed] = useState(
    calculateTimeElapsed(order.created_at)
  );

  // Update time elapsed every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimeElapsed(calculateTimeElapsed(order.created_at));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [order.created_at]);

  const getOrderTypeDisplay = () => {
    if (order.is_delivery) {
      return {
        text: "DELIVERY",
        color: "bg-blue-100 text-blue-800",
        icon: "🚚",
      };
    } else if (order.unique_table_numbers.length > 0) {
      return {
        text: `TABLE ${order.unique_table_numbers.join(", ")}`,
        color: "bg-green-100 text-green-800 hover:!bg-green-100",
        icon: "🍽️",
      };
    }
    return {
      text: "TAKEAWAY",
      color: "bg-orange-100 text-orange-800",
      icon: "🥡",
    };
  };

  const orderType = getOrderTypeDisplay();

  return (
    <div className="space-y-3">
      {/* Status and Order Type Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {statusBadge}
          <Badge className={`${orderType.color} font-medium text-xs`}>
            {orderType.icon} {orderType.text}
          </Badge>
        </div>
        {!showCallButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCall(order.customer_id)}
            className="h-8 w-8 p-0 md:h-auto md:w-auto md:px-3 md:py-2"
          >
            <Phone className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Call</span>
          </Button>
        )}
      </div>

      {/* Customer Info Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Customer Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {order.customer_name.charAt(0).toUpperCase()}
          </div>

          {/* Customer Details */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {order.customer_name}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="truncate">{order.customer_phone_masked}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>
                {formatOrderTime(order.created_at)} (
                {formatTimeElapsed(currentTimeElapsed)})
              </span>
            </div>
          </div>
        </div>

        {/* Order Total */}
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-gray-900">
            ₹{order.total_amount}
          </p>
          <p className="text-xs text-gray-500">ID: {order.customer_id}</p>
        </div>
      </div>
    </div>
  );
}
