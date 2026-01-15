import React from "react";
import { HelpCircle, LayoutList } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CategorySelector({
  selectedCategoryId,
  categories,
  onChange,
  hasError,
}: any) {
  return (
    <div className="">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-2">
          <LayoutList className="h-5 w-5 text-[#dc9629]" />
          <h2 className="text-lg font-[500] text-gray-800">Menu Category</h2>
        </div>
        <div className="group relative">
          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
          <div className="absolute bottom-full -left-[70%] transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
            Menu category of the item
          </div>
        </div>
      </div>
      
      <Select value={selectedCategoryId} onValueChange={onChange}>
        <SelectTrigger 
          className={`w-[15rem] ${
            hasError ? "border-red-500 bg-red-50" : ""
          } !text-lg`}
        >
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {categories?.map((category: any) => (
            <SelectItem key={category.id} value={category.id} className="!text-[1rem]">
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}