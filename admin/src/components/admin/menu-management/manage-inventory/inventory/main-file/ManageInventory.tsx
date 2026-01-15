/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { HeaderSearch } from "../../header/HeaderSearch";
import useInventoryStore from "./UseInventoryStates";
import axios from "axios";
import logger from "@/lib/logger-dynamic";
import useToast from "@/hooks/UseToast";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurantSelector } from "@/hooks/useRestaurantSelector";
import { StockNotificationDialog } from "../stock-dialog/RestockDialog";
import HeaderNav from "../../header/HeaderNav";

export default function ManageInventory() {
  const { showSuccess, showError } = useToast();
  const { selectedRid } = useRestaurantSelector();

  const { getValidAccessToken } = useAuth();

  const {
    handleRestockDialog,
    pendingStockUpdates,
    removePendingStockUpdate,
    isPendingStockUpdate,
    updateVariableStockStatus,
    currentVariableType,
    cascadeCategoryStatusToItems,
    // Search and Highlighting
    handleHighlightItem,
    handleNavigateToItem,
  } = useInventoryStore();

  // Function to handle stock activation API call
  const activateStockInDatabase = async (variableId: string) => {
    try {
      const accessToken = await getValidAccessToken();
      // Your API call to update stock status in database
      if (currentVariableType === "category" && accessToken) {
        const catValues = {
          categoryId: variableId,
          is_active: "1",
          token: accessToken,
          rid: selectedRid,
        };
        await axios.patch("/api/category", catValues);

        // After successful category update, cascade UI changes to items
        cascadeUIStatusToItems(variableId, true);
      } else if (currentVariableType === "foodItem" && accessToken) {
        const itemValues = {
          id: variableId,
          status: "available",
          token: accessToken,
          rid: selectedRid,
        };
        await axios.patch("/api/inventory", itemValues);
      }

      showSuccess(
        "Stock activated",
        `${currentVariableType} updated successfully`
      );

      // Only update UI after successful database operation
      updateVariableStockStatus(variableId, true);

      // Remove from pending updates after successful API call
      removePendingStockUpdate(variableId);

      return true;
    } catch (error: any) {
      showError("Error activating", "Failed to activate stock");

      logger.error("Stock activation failed", {
        error,
        component: "ManageInventory",
      });
      // Remove from pending updates even on error to prevent infinite retries
      removePendingStockUpdate(variableId);
      return false;
    }
  };

  // Function to handle stock deactivation API call (for restock dialog)
  const deactivateStockInDatabase = async (variableId: string) => {
    try {
      const accessToken = await getValidAccessToken();
      if (currentVariableType === "category" && accessToken) {
        const catValues = {
          categoryId: variableId,
          is_active: "0",
          token: accessToken,
          rid: selectedRid,
        };
        await axios.patch("/api/category", catValues);

        // After successful category update, cascade UI changes to items
        cascadeUIStatusToItems(variableId, false);
      } else if (currentVariableType === "foodItem") {
        const itemValues = {
          id: variableId,
          status: "out_of_stock",
          token: accessToken,
          rid: selectedRid,
        };
        await axios.patch("/api/inventory", itemValues);
      }

      showSuccess(
        "Stock deactivated",
        `${currentVariableType} updated successfully`
      );

      // Only update UI after successful database operation
      updateVariableStockStatus(variableId, false);

      return true;
    } catch (error) {
      showError("Error deactivating", "Failed to deactivate stock");

      logger.error("Stock deactivation failed", {
        error,
        component: "ManageInventory",
      });

      return false;
    }
  };

  // Function to cascade UI changes to all items in a category (DB already handles the actual updates)
  const cascadeUIStatusToItems = (categoryId: string, newStatus: boolean) => {
    // Only update the UI state for all items in the category
    cascadeCategoryStatusToItems(categoryId, newStatus);
  };

  // Monitor pending stock updates and process them
  useEffect(() => {
    const processPendingUpdates = async () => {
      // Convert Set to Array for iteration
      const pendingArray = Array.from(pendingStockUpdates);

      // active the state
      for (const variableId of pendingArray) {
        await activateStockInDatabase(variableId);
      }
    };

    if (pendingStockUpdates.size > 0) {
      processPendingUpdates();
    }
  }, [pendingStockUpdates, removePendingStockUpdate]);

  const onConfirmDate = async (values: any, variableId: any) => {
    // Call the backend to update the stock status
    // This is for the restock dialog (when switching from in-stock to out-of-stock)

    // First update the database
    const success = await deactivateStockInDatabase(variableId);

    if (success) {
      // Only close the dialog after successful database update
      handleRestockDialog(variableId);
    } else {
      // Handle error - maybe show error message or keep dialog open
      console.error("Failed to update stock status in database");
    }
  };

  const handleSearch = (query: string) => {
    // Add search logic here if needed
  };

  return (
    <div className="w-full h-[calc(100vh-9rem)] rounded-2xl mt-[4rem] overflow-hidden">
      {/* todo move the search to dishes tabs only */}
      {/* review this leads to unnecessary crashes if the search moves from here to another place */}
      {/* <HeaderSearch
        onSearch={handleSearch}
        onHighlightItem={handleHighlightItem}
        onNavigateToItem={handleNavigateToItem}
      /> */}
      <HeaderNav />

      <section className="p-5 xxxxh-[calc(100vh-16rem)] ">
        {/* Your MenuContent component */}
        {/* <MenuContent /> */}

        {/* Debug info - remove in production */}
        {pendingStockUpdates.size > 0 && (
          <div className="mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded">
            <p className="text-sm text-yellow-800">
              Pending stock updates:{" "}
              {Array.from(pendingStockUpdates).join(", ")}
            </p>
          </div>
        )}

        <StockNotificationDialog handleConfirmDate={onConfirmDate} />
      </section>
    </div>
  );
}
