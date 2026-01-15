import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import UseOptimizeImage from "@/hooks/UseOptimizeImage";
import { Item } from "@/types/menu.types";
import { ItemDropdownMenu } from "./navigation/ItemDropdownMenu";
import { IndianRupee, Settings, ImageIcon, Star } from "lucide-react";
import { OptimizeImageLoader } from "@/components/smallComponents/OptimizeImageLoader";

interface ItemRowProps {
  item: Item | any;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  isHighlighted?: boolean;
}

export const ItemRow = React.memo<ItemRowProps>(
  ({ item, onEdit, onDelete, isHighlighted = false }) => {
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    }; 

    return (
      <Card 
        id={`item-${item.id}`}
        className={`group hover:shadow-lg transition-all duration-200 ${
          isHighlighted
            ? "border-2 border-orange-400 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-lg animate-pulse"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Item Image */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm bg-gray-100">
                {item?.images && item.images.length > 0 ? (
                  <OptimizeImageLoader
                    src={item.images[0]}
                    alt={item.name} 
                    className="object-cover !w-full !h-full transition-transform duration-300 group-hover:scale-105"
                  />
                ) : ( 
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Rating Badge */}
              {item.rating && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <Star className="w-3 h-3 fill-current" />
                  {item.rating}
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                    {item.name}
                  </h3>

                  {/* Price and Tags */}
                  <ItemPriceAndTags item={item} />

                  {/* Availability Status */}
                  <ItemStatus status={item.status} />
                </div>

                {/* Action Menu */}
                <div className="flex-shrink-0 transition-opacity duration-200 ml-4">
                  <ItemDropdownMenu
                    item={item}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

const ItemPriceAndTags = ({ item }: { item: any }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 text-lg font-bold text-green-600">
        <IndianRupee className="w-4 h-4" />
        {item.price}
      </div>

      <Badge
        variant="secondary"
        className="text-xs bg-green-100 text-green-700 hover:bg-green-200"
      >
        <Settings className="w-3 h-3 mr-1" />
        Customizable
      </Badge>

      {item.is_veg ? (
        <Badge
          variant="outline"
          className="text-xs border-green-200 text-green-700 bg-green-50"
        >
          Veg
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="text-xs border-red-200 text-red-700 bg-red-50"
        >
          Non-Veg
        </Badge>
      )}
    </div>
  );
};

const ItemStatus = ({ status }: { status: any }) => {
  return (
    <div className="flex items-center gap-2 mt-2">
      <div
        className={`w-2 h-2 rounded-full ${
          status === "available"
            ? "bg-green-500"
            : status === "low_stock"
              ? "bg-yellow-400"
              : "bg-red-500"
        }`}
      ></div>
      <span
        className={`text-xs font-medium ${
          status === "available"
            ? "text-green-700"
            : status === "low_stock"
              ? "text-yellow-600"
              : "text-red-700"
        }`}
      >
        {status === "available"
          ? "Available"
          : status === "low_stock"
            ? "Low Stock"
            : "Out of Stock"}
      </span>
    </div>
  );
};

ItemRow.displayName = "ItemRow";
