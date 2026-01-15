import React from "react";
import { Category } from "@/types/menu.types";
import { CategoryDropdownMenu } from "./CategoryDropdownMenu";
import { OptimizeImageLoader } from "@/components/smallComponents/OptimizeImageLoader";
import { Badge } from "@/components/ui/badge";
import { ImageIcon } from "lucide-react";
import { useInventoryItems } from "@/hooks/useInventoryItems";

interface CategoryItemProps {
  category: any;
  isSelected: boolean;
  onSelect: (category: Category) => void;
  onEdit: (category: Category) => void;
  onAddItem: (category: Category) => void;
  onDelete: (category: Category) => void;
  isHighlighted?: boolean;
}

export const CategoryItem = React.memo(function CategoryItem({
  category,
  isSelected,
  onSelect,
  onEdit,
  onAddItem,
  onDelete,
  isHighlighted = false,
}: CategoryItemProps) {

  const { items } = useInventoryItems(category.id);

  return (
    <div
      id={`category-${category.id}`}
      className={`group relative transition-all duration-200 ease-in-out rounded-md ${
        isHighlighted
          ? "bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-400 shadow-lg animate-pulse"
          : isSelected
          ? "bg-gradient-to-r from-green-50 to-white border-l-4 border-green-500 shadow-md "
          : "hover:bg-gray-50 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between p-4">
        <div
          onClick={() => onSelect(category)}
          className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
        >
          {/* Category Image */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm bg-gray-100">
              {category.img ? (
                <OptimizeImageLoader
                  src={category.img}
                  alt={category.name}
                  width={80}
                  height={80}
                  className="object-cover !w-full !h-full transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-600 rounded-full border-2 border-white"></div>
            )}
          </div>

          {/* Category Details */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 truncate">
              {category.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className="text-xs font-medium bg-green-100 text-green-700 hover:bg-blue-200"
              >
                {items?.length || 0} items
              </Badge>
              {category.isActive && (
                <Badge
                  variant="outline"
                  className="text-xs font-medium border-green-200 text-green-700 bg-green-50"
                >
                  Active
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Action Menu */}
        <div className="flex-shrink-0 transition-opacity duration-200">
          <CategoryDropdownMenu
            category={category}
            onEdit={onEdit}
            onAddItem={onAddItem}
            onDelete={onDelete}
          />
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute inset-0 bg-blue-500 opacity-5 pointer-events-none rounded-lg"></div>
      )}
    </div>
  );
});

CategoryItem.displayName = "CategoryItem";
