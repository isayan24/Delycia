import { ChefHat, Combine, HelpCircle, LeafyGreen, PackageCheck } from "lucide-react";
import React from "react";

export default function StockAvailability({ value, onChange, hasError }: any) {
  return (
    <div className="">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-2">
          <PackageCheck className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-[500] text-gray-800">
            Stock Availability
          </h2>
        </div>
        <div className="group relative">
          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
          <div className="absolute bottom-full -left-[4rem] transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
            How many items are available in stock
          </div>
        </div>
      </div>

      <div className="relative">
        <input
          type="number"
          placeholder="items in stock"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-[15rem] p-2 text-md border rounded-md pl-12 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            hasError ? "border-red-500 bg-red-50" : ""
          }`}
        />
        <Combine className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
}
