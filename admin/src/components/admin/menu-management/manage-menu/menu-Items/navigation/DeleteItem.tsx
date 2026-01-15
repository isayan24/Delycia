import { Button } from "@/components/ui/button";
import { Loader2, Trash2, TriangleAlert } from "lucide-react";
import React, { useTransition } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import useToast from "@/hooks/UseToast";
import { useAuth } from "@/hooks/useAuth";

export default function DeleteItem({
  onOpenChange,
  isOpen,
  refetch,
  currentFoodItem,
}: any) {
  const [isPending, startTransition] = useTransition();
  const { showError, showSuccess } = useToast();
  const { getValidAccessToken } = useAuth();

  const handleDelete = async () => {
    try {
      startTransition(async () => {
        const accessToken = await getValidAccessToken();
        await axios
          .delete(`/api/inventory`, {
            data: {
              id: currentFoodItem?.id,
              img: currentFoodItem?.images,
              token: accessToken,
              rid: currentFoodItem?.rid,
            },
          })
          .then(() => {
            refetch();
            showSuccess("Success", "Item deleted successfully");
            onOpenChange(false);
          });
      });
    } catch (error) {
      console.error("Error deleting category", error);
      showError("Error", "Error deleting category item");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[20rem]">
          <DialogHeader>
            <DialogTitle>Delete Food Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item?
              <TriangleAlert className="h-8 text-red-600 text-center w-full mt-3" />
              <span className="mt-4 border border-red-500 bg-red-200 p-4 px-2  rounded-md text-red-600 flex gap-1 flex-col justify-center items-center">
                <span>Note: This process can not be undone.</span>
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              onClick={handleDelete}
              disabled={isPending}
              type="button"
              variant="outline"
              className="border border-red-300 text-red-500 hover:text-red-500 bg-[#c7000027] hover:bg-[#c700003b]"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
