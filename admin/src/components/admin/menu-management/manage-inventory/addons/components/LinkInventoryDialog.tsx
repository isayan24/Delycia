
import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";
import { fuzzySearch, SearchResult } from "@/helpers/fuzzySearch";
import type { Addon } from "@/api/types/addons.types";

interface InventoryItem {
  id: string;
  name: string;
  price: number;
  category_id: string;
  category_name?: string;
}

interface LinkInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addon: Addon | null;
  onLink: (addonId: string, inventoryIds: string[]) => Promise<void>;
  allInventoryItems: InventoryItem[];
  loading?: boolean;
}

export function LinkInventoryDialog({
  open,
  onOpenChange,
  addon,
  onLink,
  allInventoryItems,
  loading = false,
}: LinkInventoryDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setSelectedItems(new Set());
    }
  }, [open]);

  // Fuzzy search filtered items
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return allInventoryItems;
    }
    const results = fuzzySearch(searchQuery, allInventoryItems);
    return results as InventoryItem[];
  }, [searchQuery, allInventoryItems]);

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map((item) => item.id)));
    }
  };

  const handleSubmit = async () => {
    if (!addon || selectedItems.size === 0) return;

    setIsSubmitting(true);
    try {
      console.log(selectedItems, "selectedItems");
      await onLink(addon.id, Array.from(selectedItems));
      onOpenChange(false);
    } catch (error) {
      console.error("Error linking items:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!addon) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Link Items to &ldquo;{addon.name}&rdquo;</DialogTitle>
          <DialogDescription>
            Search and select inventory items to link with this addon
          </DialogDescription>
        </DialogHeader>

        {/* Search Box */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Select All */}
        {filteredItems.length > 0 && (
          <div className="flex items-center space-x-2 py-2 border-b">
            <Checkbox
              id="select-all"
              checked={selectedItems.size === filteredItems.length}
              onCheckedChange={toggleSelectAll}
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium cursor-pointer"
            >
              Select All ({selectedItems.size} of {filteredItems.length}{" "}
              selected)
            </label>
          </div>
        )}

        {/* Items List */}
        <ScrollArea className="flex-1 -mx-6 px-6 overflow-hidden">
          <div className="space-y-2 py-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">
                  {searchQuery
                    ? "No items found"
                    : "No inventory items available"}
                </p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition"
                  onClick={() => toggleItemSelection(item.id)}
                >
                  <Checkbox
                    checked={selectedItems.has(item.id)}
                    onCheckedChange={() => toggleItemSelection(item.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{item.name}</h4>
                      {item.category_name && (
                        <Badge variant="outline" className="text-xs">
                          {item.category_name}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ₹{item.price?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedItems.size === 0 || isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Link {selectedItems.size > 0 && `(${selectedItems.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
