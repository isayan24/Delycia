"use client";
import { useItemStore } from "@/store/order-store";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cartItemSchema } from "@/schemas/cartItemSchema";
import CartItem from "./CartItem";
import CartSidebar from "./CartSidebar";   
import EmptyCart from "./EmptyCart";

export default function FoodCart() {
  // access data from zustand store
  const showCartItems = useItemStore((state) => state.items);
  const removeItem = useItemStore((state) => state.removeItem);
  const updateItem = useItemStore((state) => state.updateItem);
  const updateSelectedItems = useItemStore(
    (state) => state.updateSelectedItems
  );
  const selectedItems = useItemStore((state) => state.selectedItems); 

  useEffect(() => {
    useItemStore.persist.rehydrate();
  }, []);
  // mark Remove checkout items that are no longer in cart
  useEffect(() => {
    // mark Filter out selected items that no longer exist in cart
    const validSelectedItems = selectedItems.filter((itemId) =>
      showCartItems.some((item) => item.id === itemId)
    );

    // Update selected items if there are any to remove
    if (validSelectedItems.length !== selectedItems.length) {
      updateSelectedItems(validSelectedItems);
    }
  }, [showCartItems, selectedItems]);

  const handleRemove = (id: any) => {
    removeItem([id]);
  };

  const handleQuantityDecrease = (id: any) => { 
    const currentItem = showCartItems.find((item) => item.id === id);
    // mark old code if (currentItem?.quantity! > 1) {   updateItem(id, { ...currentItem!, quantity: currentItem?.quantity! - 1 });
    if (
      currentItem &&
      typeof currentItem.quantity === "number" &&
      currentItem.quantity > 1
    ) {
      updateItem(id, { ...currentItem, quantity: currentItem.quantity - 1 });
    }
  };
  // mark old code updateItem(id, { ...currentItem!, quantity: currentItem?.quantity! + 1 });
  const handleQuantityIncrease = (id: any) => {
    const currentItem = showCartItems.find((item) => item.id === id);

    if (currentItem) {
      updateItem(id, {
        ...currentItem,
        quantity: (currentItem.quantity || 0) + 1,
      });
    }
  };

  // form
  const form = useForm<z.infer<typeof cartItemSchema>>({
    resolver: zodResolver(cartItemSchema),
    defaultValues: {
      selectedItems: [],
    },
  });

  const handleItemSelection = (itemId: string, checked: boolean) => {
    let currentSelectedItems = [...selectedItems];

    if (checked) {
      // Only add if not already in selected items
      if (!currentSelectedItems.includes(itemId)) {
        currentSelectedItems.push(itemId);

        // Add to checkout if not already there
        const item = showCartItems.find((item) => item.id === itemId);
      }
    } else {
      // Remove from selected items
      currentSelectedItems = currentSelectedItems.filter((id) => id !== itemId);
    }

    // Update global state directly
    updateSelectedItems(currentSelectedItems);

    // Optional: Update form if needed
    form.setValue("selectedItems", currentSelectedItems);
  };

  const totalPrice = useMemo(() => { 
    const filteredCartItems = showCartItems.filter((item) =>
      selectedItems.includes(item.id)
    );
    const totalPrice = filteredCartItems.reduce(
      (acc, item) => acc + item.price * item.quantity!,
      0
    );
    const totalDiscount = filteredCartItems.reduce(
      (acc, item) => acc + item.discount!,
      0
    );
    return [totalPrice , totalDiscount];
  }, [showCartItems, selectedItems]); 
 

  return (
    <main>  
      {showCartItems.length === 0 ? (
        <EmptyCart/>
      ) : (
        <div className="flex gap-10 max-[1000px]:flex-col relative">
          <CartItem
            form={form}
            handleItemSelection={handleItemSelection}
            handleRemove={handleRemove}
            selectedItems={selectedItems}
            handleQuantityDecrease={handleQuantityDecrease}
            handleQuantityIncrease={handleQuantityIncrease}
            showCartItems={showCartItems}
          />
          <CartSidebar totalPrice={totalPrice[0]} totalDiscount={totalPrice[1]} selectedItems={selectedItems} />
        </div>
      )}
    </main>
  );
}
