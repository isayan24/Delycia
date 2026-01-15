import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, EllipsisVertical, Plus, Trash2 } from "lucide-react";
import { Category } from '@/types/menu.types';

interface CategoryDropdownMenuProps {
  category: Category;
  onEdit: (category: Category) => void;
  onAddItem: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export const CategoryDropdownMenu = React.memo<CategoryDropdownMenuProps>(({ 
  category, 
  onEdit, 
  onAddItem, 
  onDelete 
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <EllipsisVertical className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => onEdit(category)}>
        <Edit className="mr-2 h-4 w-4" />
        Edit Category
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onAddItem(category)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Item
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => onDelete(category)}
        className="!text-red-600"
      >
        <Trash2 className="mr-2 h-4 w-4 !text-red-600" />
        Delete Category
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
));

CategoryDropdownMenu.displayName = 'CategoryDropdownMenu';