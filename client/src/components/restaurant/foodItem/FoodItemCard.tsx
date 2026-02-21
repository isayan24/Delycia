import { useState } from 'react'
import { Button } from '../../ui/button'
import { Heart, Loader2, Minus, Plus, Triangle } from 'lucide-react'
import { useItemStore } from '@/store/order-store'
import HoverInfo from '../../smallComponents/HoverInfo'
import { Drawer } from '@/components/ui/drawer'
import FoodItemInfo from './FoodItemInfo'
import { ImageCarousel } from '@/hooks/useImageCarousel'
import { useItemVariantsQuery } from '@/hooks/queries/useItemVariantsQuery'
import { useItemAddonsQuery } from '@/hooks/queries/useItemAddonsQuery'

interface FoodItemCardProps {
  id: string
  name: string
  description: string
  price: number
  images: any[]
  category: string
  quantity: number
  isVeg: boolean
  status: string
  stock: number
}

export default function FoodItemCard({
  id,
  name,
  description,
  price,
  images,
  category,
  quantity,
  isVeg,
  status,
  stock,
}: FoodItemCardProps) {
  // zustand store
  const addFoodItem = useItemStore((state) => state.addItem)
  const allItems = useItemStore((state) => state.items)
  const updateItem = useItemStore((state) => state.updateItem)
  const removeItem = useItemStore((state) => state.removeItem)
  const selectedItems = useItemStore((state) => state.selectedItems)
  const updateSelectedItems = useItemStore((state) => state.updateSelectedItems)
  const removeAllQuantity = useItemStore((state) => state.removeAllQuantity)

  const [isPending, setIsPending] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  // TanStack Query: cached & deduplicated — no manual useEffect needed
  const { data: variantsData } = useItemVariantsQuery(id)
  const variants = variantsData?.variants ?? []

  const { data: addonsData } = useItemAddonsQuery(id)

  const handleCartClick = (
    id: string,
    itemName: string = name,
    itemPrice: number = price,
    _quantity: number, // unused
    isVeg: boolean,
    status: string,
    variantId?: number,
  ) => {
    setIsPending(true)

    // Addons data is already cached by TanStack Query — no network call needed
    const hasAddons = (addonsData?.addons?.length ?? 0) > 0

    if ((variants.length > 0 || hasAddons) && !dialogOpen) {
      setDialogOpen(true)
      setIsPending(false)
    } else {
      // Generate composite ID
      const cartId = variantId ? `${id}-${variantId}` : id
      // Note: For FoodItemCard direct add, we don't have addons.
      // But we should use the same convention.

      const itemExists = allItems.find((item) => item.id === cartId)

      // Calculate total quantity of this product (all variants) to check stock
      const totalProductQty = allItems
        .filter((item) => (item.productId || item.id) === id)
        .reduce((sum, item) => sum + (item.quantity || 0), 0)

      if (!itemExists) {
        // Check if stock is available before adding
        if (stock <= 0 || totalProductQty >= stock) {
          setIsPending(false)
          return // Don't add if no stock
        }

        // add default check to item when going to the cart
        updateSelectedItems([...selectedItems, cartId])

        addFoodItem({
          id: cartId,
          productId: id,
          name: itemName,
          price: itemPrice,
          description,
          images,
          category,
          quantity: 1,
          isVeg,
          status,
          variantId,
        })
      } else {
        // if item in the cart, then update the quantity
        const newQuantity = (itemExists.quantity || 0) + 1
        // Check if new quantity exceeds stock (considering total product usage)
        if (stock > 0 && totalProductQty < stock) {
          updateItem(cartId, {
            ...itemExists,
            productId: id, // ensure productId is set
            name: itemName,
            price: itemPrice,
            quantity: newQuantity,
          })
        }
      }

      setTimeout(() => setIsPending(false), 100)
    }
  }

  // Updated quantity handlers to support variants
  const handleQuantityIncrease = (
    id: string,
    _itemName: string = name,
    _itemPrice: number = price,
    variantId?: number,
  ) => {
    // Logic for quantity increase from outside (cart logic usually handles this, but this seems to be a card control)
    // If we rely on composite IDs, we need to know WHICH item to increase.
    // The props passed here seem to assume 1 item per product?
    // "handleQuantityIncrease" is called with 'id' which is product ID.
    // This UI component seems to assume only 1 variant in cart?
    // If I have multiple variants, which one do I increase?
    // The UI shows ONE 'minus/number/plus' control.
    // Making this work for multiple variants is tricky.
    // For now, let's find the FIRST matching item or the most recently added?
    // Or just disable this control if multiple variants exist in cart to avoid ambiguity?
    // Let's assume for FoodItemCard (list view), we interact with the 'base' or 'default' item or just sum them.

    // Actually, `handleQuantityIncrease` is passed to `FoodItemInfo` too.
    // In `FoodItemInfo`, we know the variant.

    // For the main card, let's try to find an item that matches the product.
    const productItems = allItems.filter(
      (item) => (item.productId || item.id) === id,
    )
    const totalProductQty = productItems.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0,
    )

    if (totalProductQty >= stock) return

    // If we have items, increase the last one added? Or the one matching current variantId?
    // If variantId is passed, use it.
    const cartId = variantId ? `${id}-${variantId}` : id
    let targetItem = allItems.find((item) => item.id === cartId)

    // Fallback: any item of this product
    if (!targetItem && productItems.length > 0) targetItem = productItems[0]

    if (!targetItem) {
      // Add new (similar to handleCartClick)
      // ... simplified for brevity, reuse handleCartClick logic?
      // handleCartClick handles the adding.
      // Calling handleCartClick here logic duplication.
      return
    }

    updateItem(targetItem.id, {
      ...targetItem,
      quantity: (targetItem.quantity || 0) + 1,
    })
  }

  const handleQuantityDecrease = (
    id: string,
    _itemName: string = name,
    _itemPrice: number = price,
  ) => {
    // Decrease quantity
    // Find item.
    // If multiple variants exist, which one to decrease?
    // This is ambiguous in the UI if it just shows total quantity.
    // We'll decrease the last one or the default one.

    const productItems = allItems.filter(
      (item) => (item.productId || item.id) === id,
    )
    if (productItems.length === 0) return

    // Try to find exact match if we could (passed variantId?) no variantId passed here.
    // Just take the last one
    const targetItem = productItems[productItems.length - 1]

    if (targetItem.quantity === 1) {
      removeItem([targetItem.id])
    } else {
      updateItem(targetItem.id, {
        ...targetItem,
        quantity: (targetItem.quantity || 0) - 1,
      })
    }
  }

  // ui
  const UI = [
    {
      cardStructure:
        'bg-white rounded-2xl w-[280px] h-[330px] flex flex-col shadow-sm min-[700px]:hover:shadow-lg transition-all duration-300 border border-gray-100 max-[700px]:w-[30rem] max-[700px]:flex-row-reverse max-[700px]:h-[10rem] max-[700px]:border-none max-[700px]:shadow-none max-[700px]:mx-auto max-[500px]:w-[100%] relative overflow-hidden',
      imageSection:
        'w-full h-[180px] max-[700px]:mt-5 rounded-t-2xl relative bg-gradient-to-br from-gray-50 to-gray-100 max-[700px]:w-[10rem] max-[700px]:h-[10rem] shrink-0 max-[500px]:w-[7rem] max-[500px]:h-[7rem] max-[500px]:mr-2 ',
      quantityBtnUI:
        'rounded-full flex justify-between items-center w-[90px] h-[32px] select-none bg-orange-500 shadow-md',

      heartBtnUI:
        'absolute w-8 h-8 rounded-full p-1.5 bg-white/90 backdrop-blur-sm top-3 right-3 text-gray-400 min-[700px]:hover:text-red-500 min-[700px]:hover:bg-white transition-all duration-300 min-[700px]:hover:scale-110 cursor-pointer z-[5] max-[700px]:hidden shadow-sm',
      addToCartBtnUI:
        'rounded-full relative text-sm h-[32px] w-[90px] max-[700px]:active:scale-95 min-[700px]:active:scale-95 transition-all duration-200 bg-orange-500 min-[700px]:hover:bg-orange-600 text-white font-medium shadow-md max-[700px]:bg-[#ffe1e1] max-[700px]:hover:bg-[#ffe1e1] max-[700px]:text-[#ea580c]',

      quantityBtnIncreaseUI:
        'rounded-full transition-all duration-200 bg-transparent text-white text-lg h-full w-[28px] flex items-center justify-center max-[700px]:active:scale-[0.9] min-[700px]:active:scale-[0.9] font-bold min-[700px]:hover:bg-white/20',

      quantityBtnUILarge:
        'hidden max-[700px]:flex items-center justify-center p-2 absolute -bottom-5 left-1/2 transform -translate-x-1/2 z-[9]',
    },
  ]

  // Get current quantity in cart for this product (sum of all variants)
  const getCurrentCartQuantity = () => {
    return allItems
      .filter((item) => (item.productId || item.id) === id)
      .reduce((sum, item) => sum + (item.quantity || 0), 0)
  }

  const currentCartQuantity = getCurrentCartQuantity()
  const isStockLimitReached = currentCartQuantity >= stock
  const isOutOfStock = stock <= 0 || status === 'out_of_stock'

  return (
    <>
      <main
        id={`food-item-${id}`}
        className={`${UI[0].cardStructure} ${status === 'out_of_stock' ? 'grayscale-100 opacity-75' : ''} transition-all duration-300 min-[700px]:hover:scale-[1.02]`}
      >
        {/* Discount badge */}
        {status === 'available' && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 max-[700px]:hidden">
            Fresh
          </div>
        )}

        {/* Status badge for out of stock */}
        {status === 'out_of_stock' && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 max-[700px]:hidden">
            Out of Stock
          </div>
        )}

        {/* Low stock badge */}
        {status === 'low_stock' && (
          <div className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 max-[700px]:hidden">
            Low Stock
          </div>
        )}

        <section className={`${UI[0].imageSection}`}>
          <Heart className={`${UI[0].heartBtnUI}`} />

          {/* mark image */}
          <div
            onClick={() => setDialogOpen(true)}
            className="relative w-full h-full overflow-hidden cursor-pointer group"
          >
            {images && (
              <ImageCarousel
                images={images}
                className="w-full h-full object-cover min-[700px]:group-hover:scale-105 transition-transform duration-300"
              />
            )}

            {/* Overlay gradient for better text readability */}
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 min-[700px]:group-hover:opacity-100 transition-opacity duration-300" />

            {/* mark Veg/Non-veg and info icons */}
            <div className="bg-white p-1 rounded-md absolute bottom-0 -right-1 pr-4 flex items-center justify-between mb-3 max-[700px]:hidden">
              {isVeg ? (
                <div className="border rounded-sm border-green-500 flex items-center justify-center p-1">
                  <span className="rounded-full bg-green-500 h-2 w-2"></span>
                </div>
              ) : (
                <div className="border rounded-sm border-red-500 flex items-center justify-center p-1">
                  <Triangle className="text-red-500 h-2 w-2 fill-current" />
                </div>
              )}

              {/* Stock indicator */}
              {stock > 0 && stock <= 10 && (
                <span className="text-xs text-orange-600 bg-orange-50 ml-2 px-2 py-1 rounded-full">
                  {stock} left
                </span>
              )}
            </div>
          </div>

          {/* Mobile add to cart button */}
          <section className={`${UI[0].quantityBtnUILarge}`}>
            {currentCartQuantity === 0 && (
              <Button
                onClick={() =>
                  handleCartClick(id, name, price, quantity, isVeg, status)
                }
                disabled={isOutOfStock || isPending}
                className={`${UI[0].addToCartBtnUI} !hover:bg-none ${
                  isPending || isOutOfStock
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                <Plus className="absolute top-[.2rem] right-[.7rem]" />
                {isPending ? (
                  <Loader2 className="animate-spin" />
                ) : isOutOfStock ? (
                  'No Stock'
                ) : (
                  'Add'
                )}
              </Button>
            )}

            {currentCartQuantity > 0 && (
              <div className={`${UI[0].quantityBtnUI}`}>
                <button
                  onClick={() => handleQuantityDecrease(id)}
                  className={`${UI[0].quantityBtnIncreaseUI}`}
                >
                  <Minus className="h-4 w-4" />
                </button>

                <span className="text-white font-bold text-sm">
                  {currentCartQuantity}
                </span>

                <button
                  onClick={() => handleQuantityIncrease(id)}
                  className={`${UI[0].quantityBtnIncreaseUI} ${
                    isStockLimitReached ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isStockLimitReached}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </section>
        </section>

        {/* Content section */}
        <div className="max-[700px]:w-full flex flex-col justify-between min-[700px]:h-full min-[700px]:p-3">
          <section
            onClick={() => setDialogOpen(true)}
            className="p-3 pb-0 cursor-pointer min-[700px]:p-0"
          >
            {/* Veg/Non-veg indicator for desktop */}

            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight max-[700px]:text-[16px] max-[700px]:leading-tight max-[700px]:mb-1">
              {name}
            </h3>

            <p className="text-sm min-[700px]:italic text-gray-500 line-clamp-2 mb-2 leading-[1.3] max-[700px]:my-2 max-[700px]:text-gray-500">
              {description}
            </p>

            {/* mark Mobile specific content */}
            <div className="flex items-baseline gap-2 min-[700px]:hidden">
              <span className="text-[15px] font-bold text-btnColor">
                ₹{price}
              </span>
            </div>

            <div className="min-[700px]:hidden">
              {stock > 0 && stock <= 10 && (
                <p className="text-xs text-orange-600 mt-1">
                  Only {stock} left in stock
                </p>
              )}
            </div>

            {/* mark Mobile veg/non-veg and info icons */}
            <div className="flex items-center gap-2 pt-2 min-[700px]:hidden">
              <HoverInfo className="z-10 h-6 w-6 border-dashed border-[#bfbfbf]!" />
              {isVeg ? (
                <div className="border rounded-[2px] border-green-500 flex items-center justify-center p-1">
                  <span className="rounded-full bg-green-500 h-[.6rem] w-[.6rem]"></span>
                </div>
              ) : (
                <div className="border rounded-[2px] border-red-500 flex items-center justify-center p-1">
                  <Triangle className="text-red-500 h-[.6rem] w-[.6rem] fill-current" />
                </div>
              )}
            </div>
          </section>

          {/* mark Desktop add to cart section */}
          <section className="max-[700px]:hidden flex items-center justify-between mt-1 pt-1">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">₹{price}</span>
              {variants && variants.length > 0 && (
                <span className="text-xs text-gray-500 mt-0">
                  + {variants.length + 1} variants
                </span>
              )}
            </div>

            {currentCartQuantity === 0 && (
              <Button
                onClick={() =>
                  handleCartClick(id, name, price, quantity, isVeg, status)
                }
                disabled={isOutOfStock || isPending}
                className={`${UI[0].addToCartBtnUI} ${
                  isPending || isOutOfStock
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {isPending ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : isOutOfStock ? (
                  'No Stock'
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </>
                )}
              </Button>
            )}

            {currentCartQuantity > 0 && (
              <div className={`${UI[0].quantityBtnUI}`}>
                <button
                  onClick={() => handleQuantityDecrease(id)}
                  className={`${UI[0].quantityBtnIncreaseUI}`}
                >
                  <Minus className="h-4 w-4" />
                </button>

                <span className="text-white font-bold text-sm min-w-[20px] text-center">
                  {currentCartQuantity}
                </span>

                <button
                  onClick={() => handleQuantityIncrease(id)}
                  className={`${UI[0].quantityBtnIncreaseUI} ${
                    isStockLimitReached ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isStockLimitReached}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
      <hr className="my-1 w-[90%] mx-auto border-dashed border-[#bfbfbf] border min-[700px]:hidden" />

      <Drawer open={dialogOpen} onOpenChange={setDialogOpen}>
        <FoodItemInfo
          id={id}
          name={name}
          description={description}
          price={price}
          images={images}
          quantity={currentCartQuantity}
          isVeg={isVeg}
          status={status}
          stock={stock}
          variants={variants}
          onClose={() => setDialogOpen(false)}
          onAddToCart={(itemName: any, itemPrice: any, variantId: any) =>
            handleCartClick(
              id,
              itemName,
              itemPrice,
              quantity,
              isVeg,
              status,
              variantId,
            )
          }
          isPending={isPending}
          onQuantityIncrease={(itemName: any, itemPrice: any, variantId: any) =>
            handleQuantityIncrease(id, itemName, itemPrice, variantId)
          }
          onQuantityDecrease={(itemName: any, itemPrice: any) =>
            handleQuantityDecrease(id, itemName, itemPrice)
          }
          onRemoveAllQuantity={() => removeAllQuantity(id)}
        />
      </Drawer>
    </>
  )
}
