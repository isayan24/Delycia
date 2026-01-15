import { HelpCircle, ScrollText } from "lucide-react";
import React from "react";

export default function ItemDescriptionInput({
  value,
  onChange,
  hasError,
}: any) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-[#ffa908]" />
          <h2 className="text-lg font-[500] text-gray-800">
            Item Description
          </h2>
        </div>
      </div>
      <textarea
        placeholder="Tell us a little bit about the item description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-4 border rounded-md resize-none h-24 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
          hasError ? "border-red-500 bg-red-50" : ""
        }`}
      />
    </div>
  );
}
