/* eslint-disable @next/next/no-img-element */
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, X, Check, Crop as CropIcon, Loader2 } from "lucide-react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useImageUploader } from "../hooks/useImageUploader";
import type { ItemImage } from "../types/addItemModal";

export interface ImageUploaderProps {
  onImagesReady?: (images: ItemImage[]) => void;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
  cropAspectRatio?: number;
  cropMinWidth?: number;
  cropMinHeight?: number;
  onRemoveImage: (imageId: string) => void;
  oldImages: ItemImage[];
}

export function ImageUploader({
  oldImages,
  onRemoveImage,
  onImagesReady,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024,
  className,
  cropAspectRatio,
  cropMinWidth = 50,
  cropMinHeight = 50,
}: ImageUploaderProps) {
  const {
    images,
    dragActive,
    cropDialogOpen,
    currentCropImage,
    crop,
    completedCrop,
    imgRef,
    isLoadingOldImages,
    fileInputRef,
    setCrop,
    setCompletedCrop,
    setImgRef,
    setCropDialogOpen,
    formatFileSize,
    removeImage,
    clearAllImages,
    openCropDialog,
    handleCropComplete,
    handleCropCancel,
    handleDrag,
    handleDrop,
    handleInputChange,
    openFileDialog,
    initializeCrop,
  } = useImageUploader({
    oldImages,
    onImagesReady,
    onRemoveImage,
    maxFiles,
    maxSize,
    cropAspectRatio,
    cropMinWidth,
    cropMinHeight,
  });

  return (
    <div className={cn("w-full space-y-4", className)}>
      {isLoadingOldImages && (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <p className="ml-2 text-gray-600">Loading images...</p>
        </div>
      )}

      {/* {!isLoadingOldImages && ( */}
      <>
        <Card
          className={cn(
            "relative border-2 border-dashed transition-colors duration-200",
            dragActive ? "border-primary bg-primary/5" : "border-primary",
            images.length >= maxFiles && "opacity-50 pointer-events-none"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center p-4 text-center">
            <div
              className={cn(
                "flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-colors",
                dragActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground"
              )}
            >
              <Upload className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-semibold mb-2">
              {dragActive ? "Drop images here" : "Upload Images"}
            </h3>

            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop images here or click to browse
              <span className="block text-xs text-primary mt-1">
                Image cropping enabled
              </span>
            </p>

            <Button
              onClick={openFileDialog}
              variant="outline"
              className="transition-all duration-200 hover:bg-primary hover:text-primary-foreground border-primary"
              disabled={images.length >= maxFiles}
            >
              Choose Images
            </Button>

            <p className="text-xs text-muted-foreground mt-2">
              Max {maxFiles} images, up to {formatFileSize(maxSize)} each
            </p>
          </CardContent>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
        </Card>

        {images.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                Uploaded Images ({images.length}/{maxFiles})
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllImages}
                className="text-xs hover:bg-destructive/10 hover:text-destructive text-red-600 border border-red-300"
              >
                Clear All
              </Button>
            </div>

            <section className="flex flex-wrap gap-3">
              {images.map((imageData) => (
                <Card
                  key={imageData.id}
                  className="relative overflow-hidden group w-[23rem]"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border">
                        <img
                          src={imageData.croppedPreview || imageData.preview}
                          alt={imageData.name}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate">
                            {imageData.name}
                          </p>
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {imageData.croppedPreview && (
                            <Badge variant="secondary" className="text-xs">
                              Cropped
                            </Badge>
                          )}
                        </div>

                        {/* {imageData.size > 0 && ( */}
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(imageData.size)}
                        </p>
                        {/* // )} */}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openCropDialog(imageData)}
                          className="flex-shrink-0 h-8 w-8 rounded-full opacity-70 hover:opacity-100"
                          title="Crop image"
                        >
                          <CropIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeImage(imageData.id)}
                          className="flex-shrink-0 h-8 w-8 rounded-full opacity-70 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>
          </div>
        )}

        <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] w-full overflow-hidden">
            <DialogHeader>
              <DialogTitle>Crop Image</DialogTitle>
            </DialogHeader>
            {currentCropImage && (
              <div className="space-y-4 flex flex-col h-full">
                <div className="flex justify-center flex-1 overflow-auto p-4">
                  <div className="relative max-w-full max-h-full">
                    <ReactCrop
                      crop={crop}
                      onChange={(c) => setCrop(c)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={cropAspectRatio}
                      minWidth={cropMinWidth}
                      minHeight={cropMinHeight}
                      keepSelection
                      className="max-w-full max-h-full"
                    >
                      <img
                        ref={setImgRef}
                        src={currentCropImage.preview}
                        alt="Crop preview"
                        onLoad={(e) => {
                          const { naturalWidth, naturalHeight } =
                            e.currentTarget;
                          initializeCrop(naturalWidth, naturalHeight);
                        }}
                        crossOrigin="anonymous"
                        style={{
                          maxWidth: "80vw",
                          maxHeight: "60vh",
                          width: "auto",
                          height: "auto",
                          display: "block",
                        }}
                      />
                    </ReactCrop>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
                  <Button variant="outline" onClick={handleCropCancel}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCropComplete}
                    disabled={!completedCrop}
                  >
                    Apply Crop
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
      {/* // )} */}
    </div>
  );
}
