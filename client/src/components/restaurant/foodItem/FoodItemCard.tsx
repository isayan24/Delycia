'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '../../ui/button'
import {
  AlertTriangle,
  Check,
  Heart,
  Info,
  Loader2,
  Minus,
  Plus,
  Triangle,
  Vegan,
} from 'lucide-react'
import { useItemStore } from '@/store/order-store'
import HoverInfo from '../../smallComponents/HoverInfo'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import FoodItemInfo from './FoodItemInfo'
import { ImageCarousel } from '@/hooks/useImageCarousel'
import axiosInstance from '@/lib/server-axios'

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
  const [variants, setVariants] = useState<any>({})

  useEffect(() => {
    async function fetchVariants() {
      try {
        await axiosInstance.get(`/variants?inventory_id=${id}`).then((res) => {
          setVariants(res?.data?.variants)
        })
      } catch (error) {
        console.error('Failed to fetch variants from db', error)
      }
    }
    fetchVariants()
  }, [id])

  const handleCartClick = (
    id: string,
    itemName: string = name,
    itemPrice: number = price,
    quantity: number,
    isVeg: boolean,
    status: string,
    variantId?: number,
  ) => {
    if (variants.length > 0 && !dialogOpen) {
      console.log(variants)
      setDialogOpen(true)
    } else {
      setIsPending(true)

      const itemExists = allItems.find((item) => item.id === id)
      if (!itemExists) {
        // Check if stock is available before adding
        if (stock <= 0) {
          setIsPending(false)
          return // Don't add if no stock
        }

        // add default check to item when going to the cart
        updateSelectedItems([...selectedItems, id])

        addFoodItem({
          id,
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
        const currentItem = allItems.find((item) => item.id === id)
        if (currentItem) {
          const newQuantity = (currentItem.quantity || 0) + 1
          // Check if new quantity exceeds stock
          if (newQuantity <= stock) {
            updateItem(id, {
              ...currentItem,
              name: itemName, // Update name and price with current selection
              price: itemPrice,
              quantity: newQuantity,
            })
          }
        }
      }

      setTimeout(() => setIsPending(false), 100)
    }
  }

  // Updated quantity handlers to support variants
  const handleQuantityIncrease = (
    id: string,
    itemName: string = name,
    itemPrice: number = price,
    variantId?: number,
  ) => {
    const itemExists = allItems.find((item) => item.id === id)

    if (!itemExists) {
      // Check if stock is available before adding
      if (stock <= 0) {
        return // Don't add if no stock
      }

      addFoodItem({
        id,
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
      const newQuantity = (itemExists.quantity || 0) + 1
      // Check if new quantity exceeds stock
      if (newQuantity <= stock) {
        updateItem(id, {
          ...itemExists,
          name: itemName, // Update name and price with current selection
          price: itemPrice,
          quantity: newQuantity,
        })
      }
    }
  }

  const handleQuantityDecrease = (
    id: string,
    itemName: string = name,
    itemPrice: number = price,
  ) => {
    const itemExists = allItems.find((item) => item.id === id)

    if (itemExists?.quantity === 1) {
      removeItem([id])
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    } else if (itemExists?.quantity! > 0) {
      updateItem(id, {
        ...itemExists!,
        name: itemName, // Update name and price with current selection
        price: itemPrice,
        quantity: itemExists!.quantity! - 1,
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

  const statusOptions = [
    {
      value: 'available',
      label: 'Available',
      icon: <Check className="h-4 w-4" />,
      color: 'text-green-600',
    },
    {
      value: 'out_of_stock',
      label: 'Out of Stock',
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'text-red-600',
    },
    {
      value: 'low_stock',
      label: 'Low Stock',
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'text-yellow-600',
    },
  ]

  // Get current quantity in cart for this item (simple ID lookup)
  const getCurrentCartQuantity = () => {
    return allItems.find((item) => item.id === id)?.quantity || 0
  }

  const currentCartQuantity = getCurrentCartQuantity()
  const isStockLimitReached = currentCartQuantity >= stock
  const isOutOfStock = stock <= 0 || status === 'out_of_stock'

  return (
    <>
      <main
        id={`food-item-${id}`}
        className={`${UI[0].cardStructure} ${status === 'out_of_stock' ? 'grayscale-[100%] opacity-75' : ''} transition-all duration-300 min-[700px]:hover:scale-[1.02]`}
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 min-[700px]:group-hover:opacity-100 transition-opacity duration-300" />

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
        <div className="max-[700px]:w-[100%] flex flex-col justify-between min-[700px]:h-full min-[700px]:p-3">
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
              <HoverInfo className="z-10 h-6 w-6 border-dashed !border-[#bfbfbf]" />
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
      <hr className="my-1 w-[90%] mx-auto border-dashed border-[#bfbfbf] border-1 min-[700px]:hidden" />

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
