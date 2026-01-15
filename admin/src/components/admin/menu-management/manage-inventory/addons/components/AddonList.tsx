import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { Addon } from "@/api/types/addons.types";
import { cn } from "@/lib/utils";
import { foodIcons } from "../utils/addonIcons";

interface AddonListProps {
  addons: Addon[];
  selectedAddon: Addon | null;
  selectedAddons: Set<string>;
  onSelectAddon: (addon: Addon) => void;
  onToggleSelection: (addonId: string) => void;
  onSelectAll: (selected: boolean) => void;
  onAddNew: () => void;
  onEdit: (addon: Addon) => void;
  onDelete: (addon: Addon) => void;
}

export function AddonList({
  addons,
  selectedAddon,
  selectedAddons,
  onSelectAddon,
  onToggleSelection,
  onSelectAll,
  onAddNew,
  onEdit,
  onDelete,
}: AddonListProps) {
  const allSelected =
    addons.length > 0 && selectedAddons.size === addons.length;
  const someSelected = selectedAddons.size > 0 && !allSelected;

  // Generate stable random icons for the session
  const addonIcons = useMemo(() => {
    const iconMap = new Map();
    addons.forEach((addon) => {
      // Pick a random icon
      const randomIcon =
        foodIcons[Math.floor(Math.random() * foodIcons.length)];
      iconMap.set(addon.id, randomIcon);
    });
    return iconMap;
  }, [addons.length]); // Re-generate only when addons list length changes (new added/removed)

  return (
    <div className="flex flex-col h-full">
      {/* Header with Add button and Select All */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) => onSelectAll(checked === true)}
            aria-label="Select all addons"
            className={cn(someSelected && "data-[state=checked]:bg-primary/50")}
          />
          <h3 className="font-semibold text-lg">Addons</h3>
        </div>
        <Button onClick={onAddNew} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Addon List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {addons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No addons yet</p>
              <p className="text-xs mt-1">
                Click &quot;Add&quot; to create one
              </p>
            </div>
          ) : (
            addons.map((addon) => {
              // Get icon from stable map, fallback to first icon if missing
              const Icon = addonIcons.get(addon.id) || foodIcons[0];
              return (
                <Card
                  key={addon.id}
                  className={cn(
                    "p-4 transition-all hover:border-primary/50",
                    selectedAddon?.id === addon.id &&
                      "border-primary bg-primary/5",
                    selectedAddons.has(addon.id) && "bg-primary/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedAddons.has(addon.id)}
                      onCheckedChange={() => onToggleSelection(addon.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${addon.name}`}
                    />

                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => onSelectAddon(addon)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-md bg-secondary/50 text-secondary-foreground">
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">
                              {addon.name}
                            </h4>
                            <Badge
                              variant={
                                addon.is_active === 1 ? "default" : "secondary"
                              }
                              className={cn(
                                "text-[10px] px-1.5 py-0 h-5",
                                addon.is_active === 1
                                  ? "bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/20"
                                  : "bg-gray-500/10 text-gray-700 border-gray-200 hover:bg-gray-500/20"
                              )}
                            >
                              {addon.is_active === 1 ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                              ₹{addon.price}
                            </span>
                            {addon.linked_items_count !== undefined && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                                <span className="text-xs">
                                  {addon.linked_items_count} item
                                  {addon.linked_items_count !== 1 ? "s" : ""}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-0.5 ml-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(addon);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(addon);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
