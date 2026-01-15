import React, { useEffect } from "react";
import StockSwitch from "../stock-dialog/StockSwitch";
import { useInventoryItems } from "@/hooks/useInventoryItems";
import useInventoryStore from "../main-file/UseInventoryStates";
import { AlertCircle, Loader2, Package, Utensils } from "lucide-react";

export default function FoodItemCard({ categoryId }: any) {
  const { items, loading, error, refetch } = useInventoryItems(categoryId);
  const { updateCategoryItemsMap, highlightedItemId, highlightedItemType } = useInventoryStore();

  useEffect(() => {
    if (items && items.length > 0) {
      const itemIds = items.map((item) => item.id);
      updateCategoryItemsMap(categoryId, itemIds);
    }
  }, [items, categoryId, updateCategoryItemsMap]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 sm:py-8">
        <div className="flex items-center gap-2 sm:gap-3 text-gray-500">
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          <span className="text-xs sm:text-sm">Loading items...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-6 sm:py-8">
        <div className="flex items-center gap-2 sm:gap-3 text-red-500 bg-red-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-red-200 mx-2 sm:mx-0">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="text-xs sm:text-sm">Error loading items: {error}</span>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-center py-6 sm:py-8">
        <div className="flex flex-col items-center gap-2 sm:gap-3 text-gray-500">
          <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
          <span className="text-xs sm:text-sm text-center">No items in this category</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1 sm:space-y-2">
      {items.map((item, index) => {
        const isHighlighted = highlightedItemType === "inventory" && highlightedItemId === item?.id;
        return (
          <div
            key={item?.id || item?.name}
            id={`inventory-item-${item?.id}`}
            className={`
              group relative overflow-hidden rounded-lg border transition-all duration-200
              ${isHighlighted
                ? "border-2 border-orange-400 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-lg animate-pulse"
                : "border-gray-200 bg-white hover:shadow-md hover:border-gray-300"
              }
              ${index === 0 ? "rounded-t-lg" : ""}
              ${index === items.length - 1 ? "rounded-b-lg" : ""}
            `}
          >
            <div className="flex items-center justify-between p-3 sm:p-4 pr-1 sm:pr-6">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors flex-shrink-0">
                  <Utensils className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
                    {item?.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Food Item</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <div className="">
                  <StockSwitch
                    variableId={item?.id}
                    variableType="foodItem"
                    status={item?.status}
                  />
                </div>
              </div>
            </div>
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-50 opacity-0 group-hover:opacity-30 transition-opacity duration-200 pointer-events-none" />
          </div>
        );
      })}
    </div>
  );
}