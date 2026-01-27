import React, { useEffect, useState } from "react";
import { DrawerContent } from "@/components/ui/drawer";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Check,
  Heart,
  Loader2,
  Minus,
  Plus,
  Triangle,
  Percent,
  ShoppingCart,
  ChefHat,
  Award,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import Link from "@/lib/next-compat";
import { useItemStore } from "@/store/order-store";
import { ImageCarousel } from "@/hooks/useImageCarousel";
import axiosInstance from "@/lib/axios";

export default function FoodItemInfo({
  id,
  name,
  description,
  price,
  images,
  quantity,
  discount,
  isVeg,
  status,
  preparationTime,
  onAddToCart,
  isPending,
  onQuantityIncrease,
  onQuantityDecrease,
  onRemoveAllQuantity,
  stock,
  variants,
}: any) {
  const showCartItems = useItemStore((state) => state.items);
  const [selectedVariant, setSelectedVariant] = useState<any>(null); 

  // Initialize with no variant selected (original item selected by default)
  useEffect(() => {
    // Don't auto-select any variant - let user choose between original and variants
    if (variants && variants.length > 0) {
      setSelectedVariant(null); // Start with original item selected
    }
  }, [variants]);

  // Status options for display
  const statusOptions = [
    {
      value: "available",
      label: "Available",
      icon: <Check className="h-5 w-5" />,
      color: "text-green-600 bg-green-100",
    },
    {
      value: "out_of_stock",
      label: "Out of Stock",
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "text-red-600 bg-red-100",
    },
    {
      value: "low_stock",
      label: "Low Stock",
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "text-yellow-600 bg-yellow-100",
    },
  ];

  // Get current status display info
  const currentStatus =
    statusOptions.find((option) => option.value === status) || statusOptions[0];

  // Calculate discounted price
  const discountedPrice =
    discount > 0 ? price - (price * discount) / 100 : price;

  // Get current price (variant price or base price)
  const getCurrentPrice = () => {
    return selectedVariant ? selectedVariant.price : price;
  };

  // Get current name (with variant if selected)
  const getCurrentName = () => {
    return selectedVariant ? `${name} - ${selectedVariant.name}` : name;
  };

  // Modified cart handlers to use variant data
  const handleAddToCartWithVariant = () => {
    const currentPrice = getCurrentPrice();
    const currentName = getCurrentName();
    const variantId = selectedVariant ? selectedVariant.id : null;
    // Call the original onAddToCart but with variant data
    onAddToCart(currentName, currentPrice, variantId);
  };

  const handleQuantityIncreaseWithVariant = () => {
    const currentPrice = getCurrentPrice();
    const currentName = getCurrentName();
    const variantId = selectedVariant ? selectedVariant.id : null;

    onQuantityIncrease(currentName, currentPrice, variantId);
  };

  const handleQuantityDecreaseWithVariant = () => {
    const currentPrice = getCurrentPrice();
    const currentName = getCurrentName();

    onQuantityDecrease(currentName, currentPrice);
  }; 

  const updateCartItemVariant = (variant: any) => {
    if (quantity > 0) {
      // Check if the clicked variant is different from currently selected
      const isSelectingDifferentVariant = selectedVariant?.id !== variant?.id;
      const isSelectingOriginalFromVariant = selectedVariant && !variant;
      const isSelectingVariantFromOriginal = !selectedVariant && variant;

      // Only update if we're actually switching to a different option
      if (
        isSelectingDifferentVariant ||
        isSelectingOriginalFromVariant ||
        isSelectingVariantFromOriginal
      ) {  
        onRemoveAllQuantity(); 
      }
    }
  };

  // Also update your handleVariantClick function:
  const handleVariantClick = (variant: any) => {
    // Only update selectedVariant if we're switching to something different
    const isDifferentVariant = selectedVariant?.id !== variant?.id;
    const isSelectingOriginalFromVariant = selectedVariant && !variant;
    const isSelectingVariantFromOriginal = !selectedVariant && variant;

    if (
      isDifferentVariant ||
      isSelectingOriginalFromVariant ||
      isSelectingVariantFromOriginal
    ) {
      setSelectedVariant(variant);
      updateCartItemVariant(variant);
    } 
  };
 

  return (
    <DrawerContent className="max-[768px]:mx-4 p-0 max-w-[65rem] mx-auto overflow-hidden max-h-[90vh]">
      {/* Desktop layout - side by side */}
      <div className="hidden md:flex flex-row mt-2 px-2">
        {/* Image section - taking only 50% width on desktop */}
        <div className="relative w-1/2 h-[500px]">
          <ImageCarousel images={images} className="w-full h-full" />

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-4 right-4 bg-yellow-400 text-black font-bold px-3 py-1 rounded-full shadow-lg">
              {discount}% OFF
            </div>
          )}

          {/* Veg/Non-veg Badge */}
          <div className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-lg">
            {isVeg ? (
              <div className="border-2 rounded-sm border-green-500 p-1">
                <div className="rounded-full bg-green-500 h-3 w-3"></div>
              </div>
            ) : (
              <div className="border-2 rounded-sm border-red-500 p-1">
                <Triangle className="text-red-500 h-3 w-3 fill-current" />
              </div>
            )}
          </div>
        </div>

        {/* Details section - taking the other 50% width */}
        <div className="w-1/2 p-8 overflow-y-auto">
          <DialogTitle className="text-3xl font-bold mb-2">{name}</DialogTitle>

          {/* Status and Price Section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-btnColor">
                ₹{getCurrentPrice().toFixed(2)}
              </span>
            </div>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${currentStatus.color}`}
            >
              {currentStatus.icon}
              <span className="font-medium">{currentStatus.label}</span>
            </div>
          </div>

          {stock > 0 && stock <= 10 && (
            <p className="text-xs text-orange-600 mb-4">
              Only {stock} left in stock
            </p>
          )}

          {/* Variants Section */}
          {variants && variants.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Quantity</h3>
              <p className="text-sm text-gray-500 mb-4">
                Required • Select any 1 option
              </p>

              <div className="space-y-3">
                {/* Original item option */}
                <div 
                  onClick={() => {
                    if (selectedVariant !== null) {
                      setSelectedVariant(null);
                      updateCartItemVariant(null);
                    }
                  }}
                  className={`flex items-center justify-between cursor-pointer p-3 border rounded-lg ${
                    !selectedVariant ? "border-btnColor" : "border-gray-300"
                  } hover:border-btnColor transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        !selectedVariant
                          ? "border-btnColor bg-btnColor"
                          : "border-gray-300"
                      }`}
                    >
                      {!selectedVariant && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Full</span>
                    </div>
                  </div>
                  <span className="text-btnColor font-semibold">
                    ₹{price.toFixed(0)}
                  </span>
                </div>

                {/* Variant options */}
                {variants.map((variant: any) => (
                  <div
                    key={variant.id}
                    onClick={() => handleVariantClick(variant)}
                    className={`flex items-center justify-between cursor-pointer p-3 border rounded-lg ${
                      selectedVariant?.id === variant.id
                        ? "border-btnColor"
                        : "border-gray-300"
                    } hover:border-btnColor transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedVariant?.id === variant.id
                            ? "border-btnColor bg-btnColor"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedVariant?.id === variant.id && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <span className="font-medium">{variant.name}</span>
                      </div>
                    </div>
                    <span className="text-btnColor font-semibold">
                      ₹{variant.price.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <DialogDescription className="text-gray-700">{description}</DialogDescription>
          </div>

          {/* Desktop Highlighted Features */}
          <div className="flex gap-4 mb-6 flex-nowrap text-nowrap">
            <div className=" bg-btnColor/5 p-3 rounded-lg flex items-center gap-3 border border-btnColor/20">
              <div className="bg-btnColor/10 p-2 rounded-full">
                {isVeg ? (
                  <div className="border rounded-sm border-green-500 flex items-center justify-center p-1">
                    <span className="rounded-full bg-green-500 h-2 w-2"></span>
                  </div>
                ) : (
                  <div className="border rounded-sm border-red-500 flex items-center justify-center p-1">
                    <Triangle className="text-red-500 h-2 w-2 fill-current" />
                  </div>
                )}
              </div>  
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">
                  {isVeg ? "Vegetarian" : "Non-Vegetarian"}
                </p>
              </div>
            </div>

             

            <div className="bg-btnColor/5 p-3 rounded-lg flex items-center gap-3 border border-btnColor/20">
              <div className="bg-btnColor/10 p-2 rounded-full">
                <Award className="h-5 w-5 text-btnColor" />
              </div>
              <div className="text-nowrap">
                <p className="text-sm text-gray-500">Rating</p>
                <p className="font-medium">Top Rated</p>
              </div>
            </div>

            {discount > 0 && (
              <div className="bg-btnColor/5 p-4 rounded-lg flex items-center gap-3 border border-btnColor/20">
                <div className="bg-btnColor/10 p-2 rounded-full">
                  <Percent className="h-5 w-5 text-btnColor" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Discount</p>
                  <p className="font-medium">{discount}% OFF</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            {/* Quantity Controls */}
            <div className="flex-1">
              {quantity === 0 ? (
                <Button
                  onClick={handleAddToCartWithVariant}
                  disabled={isPending || status === "out_of_stock"}
                  className={`w-full bg-btnColor hover:bg-btnColor/90 text-white rounded-xl text-[1rem] h-12 ${status === "out_of_stock" ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isPending ? (
                    <Loader2 className="!h-5 !w-5 animate-spin mr-2" />
                  ) : (
                    <ShoppingCart className="!h-5 !w-5 mr-2" />
                  )}
                  Add to Cart ₹{getCurrentPrice()}
                </Button>
              ) : (
                <div className="flex items-center justify-between rounded-xl h-12 px-2 border border-btnColor text-btnColor text-[1.3rem] w-[8rem]">
                  <Button
                    onClick={handleQuantityDecreaseWithVariant}
                    className="bg-transparent border border-white/10 hover:bg-transparent h-8 w-8 p-0 rounded-full"
                  >
                    <Minus className="!h-5 !w-5 text-btnColor" />
                  </Button>
                  <span className="mx-3 font-bold">{quantity} </span>
                  <Button
                    onClick={handleQuantityIncreaseWithVariant}
                    className="bg-transparent border border-white/10 hover:bg-transparent h-8 w-8 p-0 rounded-full"
                  >
                    <Plus className="!h-5 !w-5 text-btnColor" />
                  </Button>
                </div>
              )}
            </div>

            {/* Order Button - Show total price when quantity > 0 */}
            {quantity > 0 ? (
              <Link
                href={`/cart/`}
                className="h-12 w-full px-3 flex items-center justify-center bg-btnColor text-white hover:bg-btnColor/90 rounded-xl relative"
              >
                Order at ₹{getCurrentPrice() * quantity}
              </Link>
            ) : (
              /* Cart Icon when no quantity */
              <Link
                href={`/cart/`}
                className="h-12 w-12 p-0 flex items-center justify-center bg-btnColor text-white hover:bg-btnColor/90 rounded-xl relative"
              >
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {showCartItems.length}
                </div>
                <ShoppingBag className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile layout - stacked with adjusted height */}
      <div className="md:hidden p-2 max-h-[80vh] overflow-y-auto">
        {/* Hero Image Section */}
        <div className="relative w-full h-56">
          <ImageCarousel
            images={images}
            className="w-full h-full overflow-hidden rounded-xl"
          />

          {/* Veg/Non-veg Badge */}
          <div className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-lg">
            {isVeg ? (
              <div className="border-2 rounded-sm border-green-500 p-1">
                <div className="rounded-full bg-green-500 h-3 w-3"></div>
              </div>
            ) : (
              <div className="border-2 rounded-sm border-red-500 p-1">
                <Triangle className="text-red-500 h-3 w-3 fill-current" />
              </div>
            )}
          </div>

          {/* Dark gradient overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent rounded-xl"></div>

          {/* Item name on top of gradient */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-bold text-white">{name}</h2>
          </div>
        </div>

        <div className="py-6 w-full">
          {/* Highlighted info section */}
          <div className="bg-gray-50 rounded-xl p-4 -mt-6 relative z-10 shadow-md">
            <div className="flex justify-between items-center mb-2">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${currentStatus.color}`}
              >
                {currentStatus.icon}
                <span className="font-medium">{currentStatus.label}</span>
              </div>

              <div className="flex items-center gap-2">
                {isVeg ? (
                  <div className="border rounded-sm border-green-500 p-1">
                    <span className="rounded-full bg-green-500 h-3 w-3 block"></span>
                  </div>
                ) : (
                  <div className="border rounded-sm border-red-500 p-1">
                    <Triangle className="text-red-500 h-3 w-3 fill-current" />
                  </div>
                )}
                <span className="text-sm font-medium">
                  {isVeg ? "Veg" : "Non-Veg"}
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-btnColor">
                ₹{getCurrentPrice().toFixed(2)}
              </span>
            </div>
            {stock > 0 && stock <= 10 && (
              <p className="text-xs text-orange-600 mt-1">
                Only {stock} left in stock
              </p>
            )}
          </div>

          {/* Description */}
          <div className="my-6 px-2">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700">{description}</p>
          </div>

          {/* Fixed Variants Section for Mobile */}
          {variants && variants.length > 0 && (
            <div className="mb-6 px-2">
              <h3 className="text-lg font-semibold mb-2">Quantity</h3>
              <p className="text-sm text-gray-500 mb-4">
                Required • Select any 1 option
              </p>

              <div className="space-y-3">
                {/* Original item option */}
                <div
                  onClick={() => {
                    if (selectedVariant !== null) {
                      setSelectedVariant(null);
                      updateCartItemVariant(null);
                    }
                  }}
                  className={`flex items-center justify-between cursor-pointer p-3 border rounded-lg ${
                    !selectedVariant ? "border-btnColor" : "border-gray-300"
                  } transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center  transition-colors ${
                        !selectedVariant
                          ? "border-btnColor bg-btnColor"
                          : "border-gray-300"
                      }`}
                    >
                      {!selectedVariant && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Full</span>
                    </div>
                  </div>
                  <span className="text-btnColor font-semibold">
                    ₹{price.toFixed(0)}
                  </span>
                </div>

                {/* Variant options */}
                {variants.map((variant: any) => (
                  <div
                    onClick={() => handleVariantClick(variant)}
                    key={variant.id}
                    className={`flex items-center justify-between cursor-pointer p-3 border rounded-lg ${
                      selectedVariant?.id === variant.id
                        ? "border-btnColor"
                        : "border-gray-300"
                    } transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedVariant?.id === variant.id
                            ? "border-btnColor bg-btnColor"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedVariant?.id === variant.id && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <span className="font-medium">{variant.name}</span>
                      </div>
                    </div>
                    <span className="text-btnColor font-semibold">
                      ₹{variant.price.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mobile Highlighted Features */}
          <div className="flex overflow-x-auto gap-3 pb-2 mb-6 scrollbar-hide px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="bg-btnColor/5 p-3 rounded-lg flex flex-col items-center min-w-[100px] border border-btnColor/20">
              <ChefHat className="h-6 w-6 text-btnColor mb-1" />
              <p className="text-xs text-gray-500">Chef&apos;s Choice</p>
            </div>

            <div className="bg-btnColor/5 p-3 rounded-lg flex flex-col items-center min-w-[100px] border border-btnColor/20">
              <Award className="h-6 w-6 text-btnColor mb-1" />
              <p className="text-xs text-gray-500">Top Rated</p>
            </div>

            {discount > 0 && (
              <div className="bg-btnColor/5 p-3 rounded-lg flex flex-col items-center min-w-[100px] border border-btnColor/20">
                <Percent className="h-6 w-6 text-btnColor mb-1" />
                <p className="text-xs text-gray-500">{discount}% Discount</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex gap-3 z-20">
            {/* Quantity Controls */}
            <div className="flex-1">
              {quantity === 0 ? (
                <Button
                  onClick={handleAddToCartWithVariant}
                  disabled={isPending || status === "out_of_stock"}
                  className={`w-full bg-btnColor hover:bg-btnColor/90 text-white rounded-xl text-[1rem] h-12 ${status === "out_of_stock" ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isPending ? (
                    <Loader2 className="!h-5 !w-5 animate-spin mr-2" />
                  ) : (
                    <ShoppingCart className="!h-5 !w-5 mr-2" />
                  )}
                  Add to Cart ₹{getCurrentPrice()}
                </Button>
              ) : (
                <div className="flex items-center justify-between rounded-xl h-12 px-2 border border-btnColor text-btnColor text-[1.3rem] w-[8rem]">
                  <Button
                    onClick={handleQuantityDecreaseWithVariant}
                    className="bg-transparent border border-white/10 hover:bg-transparent h-8 w-8 p-0 rounded-full"
                  >
                    <Minus className="!h-5 !w-5 text-btnColor" />
                  </Button>
                  <span className="mx-3 font-bold">{quantity} </span>
                  <Button
                    onClick={handleQuantityIncreaseWithVariant}
                    className="bg-transparent border border-white/10 hover:bg-transparent h-8 w-8 p-0 rounded-full"
                  >
                    <Plus className="!h-5 !w-5 text-btnColor" />
                  </Button>
                </div>
              )}
            </div>

            {/* Order Button or Cart Icon */}
            {quantity > 0 ? (
              <Link
                href={`/cart/`}
                className="h-12 w-full px-3 flex items-center justify-center bg-btnColor text-white hover:bg-btnColor/90 rounded-xl relative"
              >
                Order at ₹{getCurrentPrice() * quantity}
              </Link>
            ) : (
              <Link
                href={`/cart/`}
                className="h-12 min-w-12 px-3 flex items-center justify-center bg-btnColor text-white hover:bg-btnColor/90 rounded-xl relative"
              >
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {showCartItems.length}
                </div>
                <ShoppingBag className="h-5 w-5" />
              </Link>
            )}
          </div>

          {/* Add padding at bottom to prevent content from being hidden behind fixed buttons */}
          <div className="h-24"></div>
        </div>
      </div>
    </DrawerContent>
  );
}