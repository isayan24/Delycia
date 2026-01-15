import React from "react";
import { Badge } from "@/components/ui/badge";

interface OrderHeaderProps {
  orderId: string | number;
  time: string;
  customerName: string;
  customerPhone?: string;
  isPremium?: boolean;
  orderCount?:any
}

export function OrderHeader({
  orderId,
  time,
  customerName,
  customerPhone,
  orderCount
}: OrderHeaderProps) {
  return (
    <div className="flex justify-between items-start py-3 border-b">
      <div>
        <p className="text-sm text-muted-foreground">
          Customer ID: {orderId} | {time}
        </p>
        {customerPhone && (
          <p className="text-xs text-muted-foreground mt-1">
            Phone: {customerPhone}
          </p>
        )}
      </div>
      <div className="text-right">
        <p className="text-lg font-medium">{customerName}</p>
      </div>
    </div>
  );
}
