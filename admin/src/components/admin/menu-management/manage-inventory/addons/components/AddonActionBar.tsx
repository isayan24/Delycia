
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle2, Power, PowerOff, Trash2, X } from "lucide-react";
import { useState } from "react";

interface AddonActionBarProps {
  selectedCount: number;
  onBulkDelete: () => Promise<void>;
  onBulkActivate: () => Promise<void>;
  onBulkDeactivate: () => Promise<void>;
  onClearSelection: () => void;
}

export function AddonActionBar({
  selectedCount,
  onBulkDelete,
  onBulkActivate,
  onBulkDeactivate,
  onClearSelection,
}: AddonActionBarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (selectedCount === 0) return null;

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    try {
      await onBulkDelete();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Bulk delete error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkActivate = async () => {
    setIsProcessing(true);
    try {
      await onBulkActivate();
    } catch (error) {
      console.error("Bulk activate error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDeactivate = async () => {
    setIsProcessing(true);
    try {
      await onBulkDeactivate();
    } catch (error) {
      console.error("Bulk deactivate error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-background border rounded-lg shadow-lg p-4 flex items-center gap-4 min-w-[400px]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span className="font-medium">{selectedCount} selected</span>
          </div>

          <div className="flex-1 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkActivate}
              disabled={isProcessing}
              className="gap-2"
            >
              <Power className="h-4 w-4" />
              Activate
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDeactivate}
              disabled={isProcessing}
              className="gap-2"
            >
              <PowerOff className="h-4 w-4" />
              Deactivate
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isProcessing}
              className="gap-2 text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClearSelection}
            disabled={isProcessing}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear selection</span>
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedCount} addon(s)?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected addons from your restaurant.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isProcessing ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
