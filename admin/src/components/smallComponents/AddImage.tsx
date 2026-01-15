/* eslint-disable @next/next/no-img-element */

import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { fileToBase64 } from "@/helpers/image/fileToBase64";
import useToast from "@/hooks/UseToast";
import { Images, Upload, X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface CategoryImage {
  image: string | null;
  previewImage: string | null;
}

export default function AddImage({
  OldImage,
  onImageUpload,
  required = false,
}: {
  OldImage?: string | null;
  onImageUpload: any;
  required?: boolean;
}) {
  const [categoryImage, setCategoryImage] = useState<CategoryImage>({
    image: OldImage || null,
    previewImage: null,
  });
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useToast();

  // Initialize on mount - set the existing image as valid
  useEffect(() => {
    if (OldImage) {
      // Set image in state
      setCategoryImage({
        image: OldImage,
        previewImage: null,
      });

      // Important: Tell parent component we have a valid image
      if (typeof onImageUpload === "function") {
        onImageUpload("VALID_IMAGE");
      }
      // Clear any errors since we have a valid image
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle when OldImage prop changes
  useEffect(() => {
    if (OldImage) {
      setCategoryImage((prev) => ({
        ...prev,
        image: OldImage,
      }));
      // Clear errors since we have a valid image
      setError(null);
    }
  }, [OldImage]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setIsImageLoading(true);
    setError(null);

    try {
      // Convert to base64 for ImageKit SDK
      const base64Avatar = await fileToBase64(file);
      const base64Data = base64Avatar.split(",")[1];

      // Create object URL for preview
      const previewUrl = URL.createObjectURL(file);

      // Update state with preview URL
      setCategoryImage({
        image: null,
        previewImage: previewUrl,
      });

      // Send base64 data to parent component
      onImageUpload(base64Data);
    } catch (error) {
      console.error("Error processing image:", error);
      setError("Failed to process image. Please try another one.");
      setIsImageLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setCategoryImage({
      image: null,
      previewImage: null,
    });

    // If image is required, show error when removed
    if (required) {
      setError("Image is required");
      showError("Error", "Image is required");
    }
    // Send null to parent component
    onImageUpload(null);
  };

  // Handle image loading
  const handleImageLoaded = () => {
    setIsImageLoading(false);
  };

  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center gap-2">
        <div
          className={`
            relative bg-gray-50 shrink-0 !w-[9rem] h-[5rem] rounded-md overflow-hidden  
            flex items-center justify-center border transition-colors
            ${error ? "border-red-500 bg-red-50" : "border-input"} 
            ${!categoryImage.previewImage && !categoryImage.image ? "border-dashed" : ""}
          `}
        >
          <input
            className="hidden"
            type="file"
            id="categoryImage"
            name="categoryImage"
            onChange={handleAvatarChange}
            accept="image/*"
          />

          <div className="relative w-full h-full flex items-center justify-center">
            {isImageLoading && (
              <div className="absolute inset-0 z-10">
                <Skeleton className="h-full w-full" />
              </div>
            )}

            {categoryImage.previewImage || categoryImage.image ? (
              <>
                <img
                  key={`img-${categoryImage.previewImage || categoryImage.image}`}
                  src={categoryImage.previewImage || categoryImage.image || ""}
                  alt="Food item image"
                  loading="lazy"
                  className="object-cover h-full w-full"
                  onLoad={handleImageLoaded}
                  onError={() => {
                    setIsImageLoading(false);
                    setError("Failed to load image");
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-white/90 p-1 rounded-full hover:bg-white transition-colors shadow-sm"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4 text-red-500" />
                </button>
              </>
            ) : (
              <Label
                htmlFor="categoryImage"
                className="flex flex-col items-center justify-center p-4 text-muted-foreground"
              >
                <Images className="h-10 w-10 mb-2 opacity-70" />
              </Label>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p
            className={`text-xs italic flex-wrap ${error ? "text-red-500 font-medium" : "text-muted-foreground"}`}
          >
            {error ||
              (required
                ? "Upload a high-quality image of your food item (required)"
                : "Add an image of your food item")}
          </p>

          <div className="flex gap-1">
            <label
              htmlFor="categoryImage"
              className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background hover:bg-accent text-xs font-medium transition-colors"
            >
              <Upload className="h-3 w-3" />
              Choose Image
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
