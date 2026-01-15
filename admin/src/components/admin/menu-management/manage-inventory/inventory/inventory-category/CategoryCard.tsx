import React, { useId, useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Moon, Sun, ChevronDown, Package, ShoppingCart } from "lucide-react";
import { RemoveShoppingCart } from "@mui/icons-material";
import StockSwitch from "../stock-dialog/StockSwitch";
import { CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import FoodItemCard from "../inventory-fooditems/FoodItemCard";
import useInventoryStore from "../main-file/UseInventoryStates";

interface CategoryCardProps {
  category: any;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const { 
    highlightedItemId, 
    highlightedItemType, 
    isAccordionOpen, 
    toggleAccordion,
    openAccordion 
  } = useInventoryStore();
  
  // Check if this accordion should be open based on global state
  const isOpen = isAccordionOpen(category?.id);
  const isHighlighted = highlightedItemType === "category" && highlightedItemId === category?.id;
  
  const [isHovered, setIsHovered] = useState(false);

  // Handle accordion toggle
  const handleAccordionToggle = () => {
    toggleAccordion(category?.id);
  };

  // Effect to handle external requests to open this accordion (from search)
  useEffect(() => {
    // This effect can be used to trigger additional actions when accordion opens
    // Currently, the state management is handled through the store
  }, [isOpen]);

  return (
    <div
      id={`inventory-category-${category?.id}`}
      data-category-id={category?.id}
      className={`
        w-full rounded-xl overflow-hidden shadow-sm border transition-all duration-300
        ${isHighlighted 
          ? "border-2 border-orange-400 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-lg animate-pulse" 
          : "bg-white border-gray-200 hover:shadow-md hover:border-gray-300"
        }
        ${isOpen ? "shadow-lg" : ""}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header - This is the clickable area */}
      <div
        data-category-id={category?.id}
        className={`
          flex items-center justify-between p-2 sm:p-4 md:p-5 cursor-pointer
          rounded-t-xl transition-all duration-200
          ${isOpen ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200" : "hover:bg-gray-50"}
        `}
        onClick={handleAccordionToggle}
      >
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
          <div
            className={`
              flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full
              transition-all duration-200 flex-shrink-0
              ${isOpen ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}
              ${isHovered ? "scale-110" : ""}
            `}
          >
            <Package className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              className={`
                text-base sm:text-lg md:text-xl font-semibold transition-colors duration-200
                ${isOpen ? "text-blue-900" : "text-gray-900"}
              `}
            >
              {category?.name}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">
              Category Management
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-3 md:gap-4 flex-shrink-0">
          <div onClick={(e) => e.stopPropagation()}>
            <StockSwitch
              variableId={category.id}
              status={category?.is_active ? "available" : "out_of_stock"}
              variableType="category"
            />
          </div>
          <ChevronDown
            className={`
              w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-all duration-300
              ${isOpen ? "rotate-180 text-blue-600" : ""}
              ${isHovered ? "text-gray-600" : ""}
            `}
          />
        </div>
      </div>

      {/* Content - Accordion body */}
      <div
        data-category-content={category?.id}
        data-state={isOpen ? "open" : "closed"}
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? "max-h-[100vh] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="p-3 sm:p-4 md:p-5 pt-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 text-gray-600 mt-2">
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">Food Items</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 sm:p-3 md:p-4">
            <FoodItemCard categoryId={category.id} />
          </div>
        </div>
      </div>
    </div>
  );
}