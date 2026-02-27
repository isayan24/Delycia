import { useEffect, useState } from 'react'
import { DrawerContent } from '@/components/ui/drawer'
import { DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  AlertTriangle,
  Check,
  Loader2,
  Triangle,
  ShoppingCart,
} from 'lucide-react'
import { useItemStore } from '@/store/order-store'
import { ImageCarousel } from '@/hooks/useImageCarousel'
import AddonSelector from './addon/AddonSelector'
import useToast from '@/hooks/UseToast'

export default function FoodItemInfo({
  id,
  name,
  description,
  price,
  images,
  discount,
  isVeg,
  status,
  onAddToCart: _onAddToCart, // unused, we handle it internally
  isPending,
  onQuantityIncrease: _onQuantityIncrease, // unused
  onQuantityDecrease: _onQuantityDecrease, // unused
  onRemoveAllQuantity: _onRemoveAllQuantity, // unused
  stock,
  variants,
  category, // added
  onClose,
}: any) {
  const { showError, showSuccess } = useToast()
  const showCartItems = useItemStore((state) => state.items)
  const addFoodItem = useItemStore((state) => state.addItem)
  const updateSelectedItems = useItemStore((state) => state.updateSelectedItems)
  const selectedItems = useItemStore((state) => state.selectedItems)
  const updateItem = useItemStore((state) => state.updateItem)

  const [selectedVariant, setSelectedVariant] = useState<any>(null)

  const [selectedAddons, setSelectedAddons] = useState<
    {
      id: number
      name: string
      price: number
      is_veg: number
      quantity: number
    }[]
  >([])
  const [addonsTotal, setAddonsTotal] = useState(0)

  // Initialize with no variant selected (original item selected by default)
  useEffect(() => {
    // Don't auto-select any variant - let user choose between original and variants
    if (variants && variants.length > 0) {
      setSelectedVariant(null) // Start with original item selected
    }
    setSelectedAddons([])
    setAddonsTotal(0)
  }, [variants, id])

  // Status options for display
  const statusOptions = [
    {
      value: 'available',
      label: 'Available',
      icon: <Check className="h-5 w-5" />,
      color: 'text-green-600 bg-green-100',
    },
    {
      value: 'out_of_stock',
      label: 'Out of Stock',
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'text-red-600 bg-red-100',
    },
    {
      value: 'low_stock',
      label: 'Low Stock',
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'text-yellow-600 bg-yellow-100',
    },
  ]

  // Get current status display info
  const currentStatus =
    statusOptions.find((option) => option.value === status) || statusOptions[0]

  // Get current price (variant price or base price) + addons
  const getCurrentPrice = () => {
    const base = selectedVariant ? selectedVariant.price : price
    return base + addonsTotal
  }

  // Get current name (with variant if selected)
  const getCurrentName = () => {
    return selectedVariant ? `${name} - ${selectedVariant.name}` : name
  }

  /* Removing complex logic block as we handle it cleanly in handleAddToCart now */

  const handleAddonsChange = (addons: any[], total: number) => {
    setSelectedAddons(addons)
    setAddonsTotal(total)
  }

  const handleAddToCart = () => {
    const currentPrice = getCurrentPrice()
    const currentName = getCurrentName()
    const variantId = selectedVariant ? selectedVariant.id : null

    // Generate composite ID for cart
    // Hash addons? or just stringify IDs + Quantities
    const addonsHash =
      selectedAddons.length > 0
        ? '-' +
          selectedAddons
            .map((a) => `${a.id}x${a.quantity}`)
            .sort()
            .join('_')
        : ''

    const cartId = `${id}${variantId ? '-' + variantId : ''}${addonsHash}`

    // Check stock for the PRODUCT
    // Sum all cart items that have this productId
    const totalProductQty = showCartItems
      .filter((item) => (item.productId || item.id) === id)
      .reduce((sum, item) => sum + (item.quantity || 0), 0)

    if (stock <= 0 || totalProductQty >= stock) {
      showError('Error', 'Out of stock')
      return
    }

    const itemExists = showCartItems.find((item) => item.id === cartId)

    if (itemExists) {
      updateItem(cartId, {
        ...itemExists,
        productId: id,
        name: currentName,
        price: currentPrice,
        quantity: (itemExists.quantity || 0) + 1,
      })
    } else {
      const itemToAdd = {
        id: cartId,
        productId: id,
        name: currentName,
        price: currentPrice,
        description,
        images,
        category,
        quantity: 1,
        isVeg,
        status,
        variantId,
        addons: selectedAddons,
      }
      addFoodItem(itemToAdd)
    }

    updateSelectedItems([...selectedItems, cartId])
    showSuccess('Success', 'Item added to cart')
    if (onClose) onClose()
  }

  return (
    <DrawerContent className="max-[768px]:mx-4 p-0 max-w-260 mx-auto overflow-hidden max-h-[90vh]">
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
        <div className="w-1/2 p-8 overflow-y-auto max-h-[500px]">
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
              <h3 className="text-lg font-semibold mb-2">Size</h3>
              <p className="text-sm text-gray-500 mb-4">
                Required • Select any 1 option
              </p>

              <div className="space-y-3">
                {/* Original item option */}
                <div
                  onClick={() => {
                    if (selectedVariant !== null) {
                      setSelectedVariant(null)
                    }
                  }}
                  className={`flex items-center justify-between cursor-pointer p-3 border rounded-lg ${
                    !selectedVariant ? 'border-btnColor' : 'border-gray-300'
                  } hover:border-btnColor transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        !selectedVariant
                          ? 'border-btnColor bg-btnColor'
                          : 'border-gray-300'
                      }`}
                    >
                      {!selectedVariant && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Regular</span>
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
                    onClick={() => setSelectedVariant(variant)}
                    className={`flex items-center justify-between cursor-pointer p-3 border rounded-lg ${
                      selectedVariant?.id === variant.id
                        ? 'border-btnColor'
                        : 'border-gray-300'
                    } hover:border-btnColor transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedVariant?.id === variant.id
                            ? 'border-btnColor bg-btnColor'
                            : 'border-gray-300'
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

          {/* Addons Section */}
          <div className="mb-6">
            <AddonSelector
              itemId={id}
              onAddonsChange={handleAddonsChange}
              selectedAddons={selectedAddons}
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <DialogDescription className="text-gray-700">
              {description}
            </DialogDescription>
          </div>

          {/* Desktop Highlighted Features */}
          <div className="gap-4 mb-6 flex-nowrap text-nowrap hidden lg:flex">
            {/* ... existing features ... */}
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
                  {isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <div className="flex-1">
              <Button
                onClick={handleAddToCart}
                disabled={isPending || status === 'out_of_stock'}
                className={`w-full bg-btnColor hover:bg-btnColor/90 text-white rounded-xl text-[1rem] h-12 ${status === 'out_of_stock' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <ShoppingCart className="h-5 w-5 mr-2" />
                )}
                Add to Cart ₹{getCurrentPrice()}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden p-2 max-h-[80vh] overflow-y-auto">
        <div className="relative w-full h-64">
          <ImageCarousel
            images={images}
            className="w-full h-full overflow-hidden rounded-xl"
          />

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-4 right-4 bg-yellow-400 text-black font-bold px-3 py-1 rounded-full shadow-lg z-10">
              {discount}% OFF
            </div>
          )}

          {/* Veg/Non-veg Badge */}
          <div className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-lg z-10">
            {isVeg ? (
              <div className="border-2 rounded-sm border-green-500 p-1">
                <div className="rounded-full bg-green-500 h-2 w-2"></div>
              </div>
            ) : (
              <div className="border-2 rounded-sm border-red-500 p-1">
                <Triangle className="text-red-500 h-2 w-2 fill-current" />
              </div>
            )}
          </div>

          {/* Title Overlay with Gradient */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl flex items-end p-4">
            <DialogTitle className="text-white text-2xl font-bold drop-shadow-md">
              {name}
            </DialogTitle>
          </div>
        </div>

        <div className="py-6 w-full">
          <div className="bg-gray-50 rounded-xl p-4 -mt-6 relative z-10 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-btnColor">
                  ₹{getCurrentPrice().toFixed(2)}
                </span>
              </div>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${currentStatus.color}`}
              >
                {currentStatus.label}
              </div>
            </div>
          </div>

          <div className="my-6 px-2">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700">{description}</p>
          </div>

          {/* Variants */}
          {variants && variants.length > 0 && (
            <div className="mb-6 px-2">
              <h3 className="text-lg font-semibold mb-2">Size</h3>
              <div className="space-y-3">
                <div
                  onClick={() => setSelectedVariant(null)}
                  className={`flex items-center justify-between cursor-pointer p-3 border rounded-lg ${
                    !selectedVariant
                      ? 'border-btnColor bg-orange-50/50'
                      : 'border-gray-200'
                  } transition-colors`}
                >
                  <span className="font-medium">Regular</span>
                  <span className="text-btnColor font-semibold">
                    ₹{price.toFixed(0)}
                  </span>
                </div>
                {variants.map((variant: any) => (
                  <div
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`flex items-center justify-between cursor-pointer p-3 border rounded-lg ${
                      selectedVariant?.id === variant.id
                        ? 'border-btnColor bg-orange-50/50'
                        : 'border-gray-200'
                    } transition-colors`}
                  >
                    <span className="font-medium">{variant.name}</span>
                    <span className="text-btnColor font-semibold">
                      ₹{variant.price.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Addons Mobile */}
          <div className="mb-6 px-2">
            <AddonSelector
              itemId={id}
              onAddonsChange={handleAddonsChange}
              selectedAddons={selectedAddons}
            />
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex gap-3 z-30">
            <Button
              onClick={handleAddToCart}
              disabled={isPending || status === 'out_of_stock'}
              className="w-full bg-btnColor hover:bg-btnColor/90 text-white rounded-xl text-[1rem] h-12"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <ShoppingCart className="h-5 w-5 mr-2" />
              )}
              Add to Cart ₹{getCurrentPrice().toFixed(0)}
            </Button>
          </div>

          <div className="h-24"></div>
        </div>
      </div>
    </DrawerContent>
  )
}
