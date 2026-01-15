/* eslint-disable @next/next/no-img-element */
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Plus } from "lucide-react";
import { CategoryTemplate } from "./types/wizardTypes";

interface TemplatePreviewModalProps {
  template: CategoryTemplate;
  isOpen: boolean;
  onClose: () => void;
  isSelected: boolean;
  onToggle: () => void;
}

export default function TemplatePreviewModal({
  template,
  isOpen,
  onClose,
  isSelected,
  onToggle,
}: TemplatePreviewModalProps) {
  const handleToggle = () => {
    onToggle();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{template.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image */}
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {template.img ? (
              <img
                src={template.img}
                alt={template.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext fill='%23a0aec0' font-family='Arial' font-size='18' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                }}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-400">
                No Image Available
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                Description
              </h4>
              <p className="text-gray-600">
                {template.description || "No description available"}
              </p>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-gray-700 font-medium">Cuisine:</span>{" "}
                <Badge variant="secondary">{template.cuisine_type}</Badge>
              </div>
              {template.usage_count > 0 && (
                <div>
                  <span className="text-gray-700 font-medium">Used:</span>{" "}
                  <span className="text-gray-600">
                    {template.usage_count} time
                    {template.usage_count !== 1 && "s"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={handleToggle}
            className={
              isSelected
                ? "bg-green-500 hover:bg-green-600"
                : "bg-orange-500 hover:bg-orange-600"
            }
          >
            {isSelected ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Selected
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add to Selection
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
