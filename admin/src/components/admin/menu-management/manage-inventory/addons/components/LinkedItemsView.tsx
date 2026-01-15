
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link2, Unlink, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchAddons,
  fetchAddonsByInventoryId,
} from "@/api/endpoints/addons.api";
import type { Addon } from "@/api/types/addons.types";
import Image from "next/image";
import { OptimizeImageLoader } from "@/components/smallComponents/OptimizeImageLoader";

interface LinkedItem {
  id: string;
  name: string;
  category?: string;
  price?: number;
  image?: string;
}

interface LinkedItemsViewProps {
  selectedAddon: Addon | null;
  onUnlinkItem?: (itemId: string) => void;
  onOpenLinkDialog?: () => void;
}

export function LinkedItemsView({
  selectedAddon,
  onUnlinkItem,
  onOpenLinkDialog,
}: LinkedItemsViewProps) {
  const { getValidAccessToken } = useAuth();
  const [linkedItems, setLinkedItems] = useState<LinkedItem[]>([]);
  const [itemsCache, setItemsCache] = useState<Record<string, LinkedItem[]>>(
    {}
  );
  const [loading, setLoading] = useState(false);

  // Fetch linked items when addon is selected
  useEffect(() => {
    const fetchLinkedItems = async () => {
      if (!selectedAddon) {
        setLinkedItems([]);
        return;
      }

      // Check cache first
      if (itemsCache[selectedAddon.id]) {
        setLinkedItems(itemsCache[selectedAddon.id]);
        return;
      }

      setLoading(true);
      try {
        const accessToken = await getValidAccessToken();
        if (!accessToken) {
          setLoading(false);
          return;
        }

        // Fetch items linked to this addon by passing addon_id
        const items = await fetchAddons(
          {
            addon_id: selectedAddon.id,
          },
          accessToken
        );

        // Map to LinkedItem format
        const formattedItems = items.map((item: any) => ({
          id: item.inventory_id,
          name: item.inventory_item_name,
          category: item.inventory_item_category_name || "Unknown",
          price: item.inventory_item_price || 0,
          image: item.inventory_item_images[0] || "",
        }));

        setLinkedItems(formattedItems);

        // Update cache
        setItemsCache((prev) => ({
          ...prev,
          [selectedAddon.id]: formattedItems,
        }));
      } catch (error) {
        console.error("Error fetching linked items:", error);
        setLinkedItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLinkedItems();
  }, [selectedAddon, getValidAccessToken, itemsCache]);

  if (!selectedAddon) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Link2 className="h-12 w-12 mb-4 opacity-20" />
        <p className="text-sm">Select an addon to view linked items</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">
            Linked to &ldquo;{selectedAddon.name}&rdquo;
          </h3>
          {onOpenLinkDialog && (
            <Button onClick={onOpenLinkDialog} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Link
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Menu items that have this addon attached
        </p>
      </div>

      {/* Linked Items List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))
          ) : linkedItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Unlink className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm">No items linked yet</p>
              <p className="text-xs mt-1">
                This addon hasn&apos;t been attached to any menu items
              </p>
              {onOpenLinkDialog && (
                <Button
                  onClick={onOpenLinkDialog}
                  variant="outline"
                  size="sm"
                  className="mt-4 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Link Items
                </Button>
              )}
            </div>
          ) : (
            linkedItems.map((item) => (
              <Card
                key={item.id}
                className="p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <OptimizeImageLoader
                      src={item.image || ""}
                      alt={item.name}
                      width={50}
                      height={50}
                      className="rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{item.name}</h4>
                        {item.category && (
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        )}
                      </div>
                      {item.price && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Base Price: ₹{item.price}
                        </p>
                      )}
                    </div>
                  </div>

                  {onUnlinkItem && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 text-red-600 hover:text-red-600 hover:bg-red-50"
                      onClick={() => onUnlinkItem(item.id)}
                    >
                      <Unlink className="h-4 w-4 mr-1" />
                      Unlink
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
