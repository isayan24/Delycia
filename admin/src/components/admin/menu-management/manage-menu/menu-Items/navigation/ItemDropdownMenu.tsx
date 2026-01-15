import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, EllipsisVertical, Plus, Trash2 } from "lucide-react";
import { Item } from "@/types/menu.types";

interface ItemDropdownMenu {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

export const ItemDropdownMenu = React.memo<ItemDropdownMenu>(
  ({ item, onEdit, onDelete }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(item)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Item
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(item)}
          className="text-red-600 hover:!text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4 text-red-600" />
          Delete Item
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
);

ItemDropdownMenu.displayName = "ItemDropdownMenu";
