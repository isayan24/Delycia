// eslint-disable @next/next/no-img-element
import React from "react";
import { X, Trash2 } from "lucide-react";
import { fileToBase64 } from "@/helpers/image/fileToBase64";
import { ImageUploader } from "./ImageUploader";

// Updated types for multiple images
interface ItemImage {
  id: string;
  image: string | null;
  previewImage: string | null;
  base64Data: string | null;
}

interface ImageUploadSectionProps {
  itemImages: ItemImage[];
  setItemImages: any;
  onImageUpload: (images: ItemImage[]) => void;
  onRemoveImage: (imageId: string) => void;
  isImageLoading: boolean;
  hasError: any;
}

export default function ImageUploadSection({
  itemImages,
  onImageUpload,
  onRemoveImage,
  hasError,
}: ImageUploadSectionProps) {
  const handleFilesReady = async (imageFiles: any[]) => {
    onImageUpload(imageFiles);
  };

  return (
    <div>
      {/* File Uploader Component */}
      <ImageUploader
        oldImages={itemImages}
        onRemoveImage={onRemoveImage}
        maxFiles={5}
        maxSize={1024 * 1024 * 5} // 5MB
        onImagesReady={handleFilesReady}
        className="w-full"
        // Optional: Enable image cropping
        cropAspectRatio={1} // Fixed aspect ratio (optional)
        cropMinWidth={100}
        cropMinHeight={100}
      />

      {/* Image Counter */}
      {itemImages && itemImages.length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          {itemImages.length} image{itemImages.length > 1 ? "s" : ""} selected
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="mt-2 text-sm text-red-600">
          Please upload at least one image
        </div>
      )}
    </div>
  );
}
