"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React from "react";
import CustomizedSteppers from "./OrderStepper";
import {
  CookingPot,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Cookie,
} from "lucide-react";
import { Order } from "@/types/Order";
import UseOptimizeImage from "@/hooks/UseOptimizeImage";
import FoodSkeleton from "@/components/smallComponents/FoodSkeleton";

import deliveredImg from "@/../public/order-states/delivered.svg";
import pendingImg from "@/../public/order-states/pending.svg";
import processingImg from "@/../public/order-states/processing.svg";
import readyImg from "@/../public/order-states/ready.svg";
import cancelledImg from "@/../public/order-states/cancelled.svg";
import Image from "@/lib/next-compat";

interface UserOrdersListProps {
  orders: Order[];
}

export default function UserOrdersList({ orders }: UserOrdersListProps) {
  // Helper function to get status display properties
  const getStatusDisplay = (status: string) => {
    const statusLower = status.toLowerCase();

    switch (statusLower) {
      case "pending":
        return {
          text: "Pending",
          statusNumber: 0,
          statusDescription: "Waiting for restaurant confirmation",
          statusColor: "#FFD700", // Gold
          bgColor: "bg-yellow-500/10",
          textColor: "text-yellow-600",
          icon: <Clock className="h-4 w-4" />,
          statusImage: pendingImg,
        };
      case "processing":
        return {
          text: "Processing",
          statusNumber: 2,
          statusDescription: "Your order is being prepared",
          statusColor: "#ff921d", // Orange
          bgColor: "bg-yellow-300/10",
          textColor: "text-orange-600",
          icon: <CookingPot className="h-4 w-4" />,
          statusImage: processingImg,
        };
      case "ready":
        return {
          text: "Ready",
          statusNumber: 3,
          statusDescription: "Your order is ready",
          statusColor: "#26a4ff", // Blue
          bgColor: "bg-blue-300/10",
          textColor: "text-blue-600",
          icon: <CheckCircle2 className="h-4 w-4" />,
          statusImage: readyImg,
        };
      case "completed":
        return {
          text: "Completed",
          statusNumber: 4,
          statusDescription: "Your order has been delivered",
          statusColor: "#10B981", // Green
          bgColor: "bg-green-300/10",
          textColor: "text-green-600",
          icon: <CheckCircle2 className="h-4 w-4" />,
          statusImage: deliveredImg,
        };
      case "cancelled":
        return {
          text: "Cancelled",
          statusNumber: 5,
          statusDescription: "Your order has been cancelled",
          statusColor: "#FF0000", // Red
          bgColor: "bg-red-300/10",
          textColor: "text-red-600",
          icon: <XCircle className="h-4 w-4" />,
          statusImage: cancelledImg,
        };
      default:
        return {
          text: status || "Unknown",
          statusNumber: 0,
          statusDescription: "Status unknown",
          statusColor: "#6B7280", // Gray
          bgColor: "bg-gray-300/10",
          textColor: "text-gray-600",
          icon: <Clock className="h-4 w-4" />,
          statusImage: pendingImg,
        };
    }
  };

  return (
    <div className="flex flex-col gap-5 mt-4">
      {orders.map((order) => {
        const {
          text: statusText,
          statusNumber,
          statusDescription,
          statusColor,
          bgColor,
          textColor,
          icon: statusIcon,
          statusImage,
        } = getStatusDisplay(order.order_status);

        const foodDetails = order.foodDetails;

        return (
          <Accordion key={order.id} type="single" collapsible className="">
            <div className="flex gap-5 items-center justify-between">
              {foodDetails?.preparation_time ? (
                <p className="text-xs text-gray-500 ml-2">
                  Prep time: {foodDetails.preparation_time} min
                </p>
              ) : (
                <p className="text-xs text-gray-500 ml-2">Prep time: 0 min</p>
              )}
              <p className="text-xs text-gray-500 mr-2">
                Ordered: {order.ordered_on_ist}
              </p>
            </div>

            <AccordionItem
              value="item-1"
              className={`rounded-xl shadow-sm ${bgColor}`}
              style={{ border: `1px solid ${statusColor}` }}
            >
              <main className="flex gap-5 max-[600px]:gap-2 justify-between rounded-xl p-2">
                <section className="flex gap-5 max-[600px]:gap-2">
                  <div className="rounded-xl overflow-hidden h-[5rem] w-[5rem] border shrink-0 max-[350px]:w-[4rem] max-[350px]:h-[4rem] bg-gray-100 flex items-center justify-center">
                    {foodDetails?.img ? (
                      <UseOptimizeImage
                        src={foodDetails?.img}
                        alt={foodDetails?.name}
                        width={100}
                        height={100}
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                    ) : (
                      <Image
                        src={statusImage}
                        alt={`${statusText} status`}
                        width={100}
                        height={100}
                        className="object-contain w-full h-full"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="mt-2 max-[350px]:mt-0">
                    <div className="flex items-center gap-1">
                      <span className="max-[600px]:text-[.9rem]">
                        {foodDetails?.name || `Item #${order.item_id}`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Quantity: x{order.quantity}
                    </p>

                    <h1 className="text-sm min-[800px]:hidden mt-2">
                      ₹{order.total_amount}
                    </h1>
                  </div>
                </section>

                <section className="flex gap-10 pt-2 max-[600px]:gap-2 max-[350px]:pt-0 max-[400px]:w-[8rem]">
                  <div className="max-[800px]:hidden borderd min-[800px]:w-[6rem]">
                    <h1 className="">₹{order.total_amount}</h1>
                    <p className="text-xs text-gray-500">
                      Payment: {order.payment_status}
                    </p>
                  </div>

                  {/* Status display section */}
                  <div className="borderd min-[800px]:w-[13rem]">
                    <div className="flex gap-1 items-center">
                      <span
                        style={{ backgroundColor: statusColor }}
                        className={`flex w-2 h-2 rounded-full`}
                      ></span>
                      <h1
                        style={{ border: `1px solid ${statusColor}` }}
                        className={`${bgColor} ${textColor} rounded-2xl p-1 px-3 max-[600px]:text-[.9rem] flex items-center gap-1`}
                      >
                        {statusText}
                        <span className="ml-1">{statusIcon}</span>
                      </h1>
                    </div>
                    <p className="text-xs text-gray-500 ml-3 max-[600px]:text-[0.6rem]">
                      {statusDescription}
                    </p>
                    <div className="text-xs max-[600px]:text-[.6rem] text-gray-700 ml-3 mt-2  font-[500]">
                      Order ID: {order.id}
                    </div>
                  </div>
                  <AccordionTrigger className="max-[800px]:hidden"></AccordionTrigger>
                </section>
              </main>
              <AccordionContent className="p-5 border-t">
                <div>
                  <CustomizedSteppers
                    activeStep={statusNumber}
                    status={order.order_status}
                  />
                </div>
              </AccordionContent>
              <AccordionTrigger className="mx-auto p-0 min-[800px]:hidden my-2"></AccordionTrigger>
            </AccordionItem>
          </Accordion>
        );
      })}
    </div>
  );
}
