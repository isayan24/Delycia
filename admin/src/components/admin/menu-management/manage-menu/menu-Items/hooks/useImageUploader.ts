import { useState, useRef, useCallback, useEffect } from "react";
import type { Crop } from "react-image-crop";
import { fileToBase64 } from "@/helpers/image/fileToBase64";
import type { ItemImage } from "../types/addItemModal";

export interface ImageFile {
  id: string;
  file: File | null;
  name: string;
  size: number;
  preview: string;
  croppedPreview?: string;
  originalFile?: File | null;
  base64Data?: string | null;
  isNew: boolean;
}

export interface UseImageUploaderProps {
  oldImages: ItemImage[];
  onImagesReady?: (images: ItemImage[]) => void;
  onRemoveImage: (imageId: string) => void;
  maxFiles?: number;
  maxSize?: number;
  cropAspectRatio?: number;
  cropMinWidth?: number;
  cropMinHeight?: number;
}

export const useImageUploader = ({
  oldImages,
  onImagesReady,
  onRemoveImage,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024,
  cropAspectRatio,
  cropMinWidth = 50,
  cropMinHeight = 50,
}: UseImageUploaderProps) => {
  // State management
  const [images, setImages] = useState<ImageFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [currentCropImage, setCurrentCropImage] = useState<ImageFile | null>(
    null
  );
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [imgRef, setImgRef] = useState<HTMLImageElement | null>(null);
  const [isLoadingOldImages, setIsLoadingOldImages] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // mark Load old images effect
  useEffect(() => {
    const loadOldImages = async () => {
      if (oldImages && oldImages.length > 0) {
        setIsLoadingOldImages(true);
        const loadedImages: ImageFile[] = await Promise.all(
          oldImages.map(async (img) => {
            let previewUrl = "";
            // eslint-disable-next-line prefer-const
            let file: File | null = null;
            let base64Data = img.base64Data || null;
            let size = 0;

            if (img.base64Data) {
              try {
                const byteCharacters = atob(img.base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: "image/png" });
                previewUrl = URL.createObjectURL(blob);
                size = blob.size;
              } catch (error) {
                console.error("Error processing base64 data:", error);
                previewUrl = img.image || "";
                base64Data = null;
              }
            } else if (img.image) {
              previewUrl = img.image;
              try {
                const response = await fetch(img.image);
                const blob = await response.blob();
                size = blob.size;
              } catch (error) {
                size = 0;
              }
            }

            return {
              id: img.id,
              file: file,
              name: img.image
                ? img.image.substring(img.image.lastIndexOf("/") + 1)
                : "image",
              size,
              preview: previewUrl,
              croppedPreview: previewUrl,
              base64Data: base64Data,
              isNew: false,
            };
          })
        );

        setImages(loadedImages);
        setIsLoadingOldImages(false);
      } else {
        setImages([]);
        setIsLoadingOldImages(false);
      }
    };

    loadOldImages();

    return () => {
      images.forEach((img) => {
        if (img.preview && img.preview.startsWith("blob:")) {
          URL.revokeObjectURL(img.preview);
        }
        if (img.croppedPreview && img.croppedPreview.startsWith("blob:")) {
          URL.revokeObjectURL(img.croppedPreview);
        }
      });
    };
  }, [oldImages]);

  // Utility functions
  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
    return `${formattedSize} ${sizes[i]}`;
  }, []);

  const validateImage = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        return "Only image files are allowed";
      }
      if (file.size > maxSize) {
        return `File size exceeds ${formatFileSize(maxSize)}`;
      }
      return null;
    },
    [maxSize, formatFileSize]
  );

  const createCroppedImage = useCallback(
    async (
      image: HTMLImageElement,
      crop: Crop,
      fileName: string
    ): Promise<File> => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("No 2d context");
      }

      const displayedWidth = image.width;
      const displayedHeight = image.height;
      const naturalWidth = image.naturalWidth;
      const naturalHeight = image.naturalHeight;

      const scaleX = naturalWidth / displayedWidth;
      const scaleY = naturalHeight / displayedHeight;

      let cropX, cropY, cropWidth, cropHeight;

      if (crop.unit === "%") {
        cropX = (crop.x / 100) * naturalWidth;
        cropY = (crop.y / 100) * naturalHeight;
        cropWidth = (crop.width / 100) * naturalWidth;
        cropHeight = (crop.height / 100) * naturalHeight;
      } else {
        cropX = crop.x * scaleX;
        cropY = crop.y * scaleY;
        cropWidth = crop.width * scaleX;
        cropHeight = crop.height * scaleY;
      }

      cropX = Math.max(0, Math.min(cropX, naturalWidth - cropWidth));
      cropY = Math.max(0, Math.min(cropY, naturalHeight - cropHeight));
      cropWidth = Math.min(cropWidth, naturalWidth - cropX);
      cropHeight = Math.min(cropHeight, naturalHeight - cropY);

      canvas.width = Math.round(cropWidth);
      canvas.height = Math.round(cropHeight);

      ctx.drawImage(
        image,
        Math.round(cropX),
        Math.round(cropY),
        Math.round(cropWidth),
        Math.round(cropHeight),
        0,
        0,
        Math.round(cropWidth),
        Math.round(cropHeight)
      );

      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create blob"));
              return;
            }
            const file = new globalThis.File([blob], fileName, {
              type: "image/jpeg",
            });
            resolve(file);
          },
          "image/jpeg",
          0.95
        );
      });
    },
    []
  );

  const initializeCrop = useCallback(
    (imageWidth: number, imageHeight: number) => {
      const aspectRatio = cropAspectRatio || imageWidth / imageHeight;
      const cropPercentage = 60;
      let cropWidth = cropPercentage;
      let cropHeight = cropWidth / aspectRatio;

      if (cropHeight > cropPercentage) {
        cropHeight = cropPercentage;
        cropWidth = cropHeight * aspectRatio;
      }

      const cropX = (100 - cropWidth) / 2;
      const cropY = (100 - cropHeight) / 2;

      const initialCrop: Crop = {
        unit: "%",
        x: cropX,
        y: cropY,
        width: cropWidth,
        height: cropHeight,
      };

      setCrop(initialCrop);
      setCompletedCrop(initialCrop);
    },
    [cropAspectRatio]
  );

  // mark Image management functions
  const addImages = useCallback(
    (newFiles: FileList) => {
      if (images.length >= maxFiles) return;

      const filesToAdd = Array.from(newFiles).slice(
        0,
        maxFiles - images.length
      );

      const processedImages = filesToAdd
        .filter((file) => !validateImage(file))
        .map(
          (file) =>
            ({
              id: Math.random().toString(36).substring(2, 11),
              file,
              name: file.name,
              size: file.size,
              preview: URL.createObjectURL(file),
              originalFile: file,
              base64Data: null,
              isNew: true,
            }) as ImageFile
        );

      const imagesWithBase64Promises = processedImages.map(async (img) => {
        try {
          const base64String = (await fileToBase64(img.file as File)).split(
            ","
          )[1];
          return { ...img, base64Data: base64String || null };
        } catch (error) {
          console.error("Error converting file to base64:", error);
          return { ...img, base64Data: null };
        }
      });

      Promise.all(imagesWithBase64Promises).then((imagesWithBase64) => {
        setImages((prevImages) => {
          const newImageList = [...prevImages, ...imagesWithBase64];

          if (onImagesReady) {
            const itemImagesToSend: ItemImage[] = newImageList.map((img) => ({
              id: img.id,
              image: img.isNew ? null : img.preview,
              previewImage: img.croppedPreview || img.preview || null,
              base64Data: img.base64Data || null,
              size: img.size || null,
            }));
            onImagesReady(itemImagesToSend);
          }

          return newImageList;
        });
      });
    },
    [images, maxFiles, validateImage, onImagesReady]
  );

  const removeImage = useCallback(
    (imageId: string) => {
      setImages((prevImages) => {
        const imageToRemove = prevImages.find((img) => img.id === imageId);

        if (imageToRemove) {
          URL.revokeObjectURL(imageToRemove.preview);
          if (imageToRemove.croppedPreview) {
            URL.revokeObjectURL(imageToRemove.croppedPreview);
          }
          onRemoveImage(imageToRemove.id);
        }

        const updatedImages = prevImages.filter((img) => img.id !== imageId);

        if (onImagesReady) {
          const itemImagesToSend: ItemImage[] = updatedImages.map((img) => ({
            id: img.id,
            image: img.isNew ? null : img.preview,
            previewImage: img.croppedPreview || img.preview || null,
            base64Data: img.base64Data || null,
            size: img.size || null,
          }));
          onImagesReady(itemImagesToSend);
        }

        return updatedImages;
      });
    },
    [onImagesReady, onRemoveImage]
  );

  const clearAllImages = useCallback(() => {
    images.forEach((img) => {
      URL.revokeObjectURL(img.preview);
      if (img.croppedPreview) URL.revokeObjectURL(img.croppedPreview);
    });

    setImages([]);
    if (onImagesReady) {
      onImagesReady([]);
    }
  }, [images, onImagesReady]);

  // Cropping functions
  const openCropDialog = useCallback(async (image: ImageFile) => {
    let imageToEdit = image;

    if (!image.file && !image.isNew) {
      try {
        let blob: Blob;

        if (image.base64Data) {
          const byteCharacters = atob(image.base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          blob = new Blob([byteArray], { type: "image/png" });
        } else if (image.preview && !image.preview.startsWith("blob:")) {
          const response = await fetch(image.preview);
          blob = await response.blob();
        } else {
          throw new Error("No valid image source for cropping");
        }

        const file = new File([blob], image.name, { type: blob.type });
        const newPreviewUrl = URL.createObjectURL(blob);

        setImages((prevImages) =>
          prevImages.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  file: file,
                  preview: newPreviewUrl,
                  size: file.size,
                }
              : img
          )
        );

        imageToEdit = {
          ...image,
          file: file,
          preview: newPreviewUrl,
          size: file.size,
        };
      } catch (error) {
        console.error("Error preparing image for cropping:", error);
        return;
      }
    }

    setCurrentCropImage(imageToEdit);
    setCropDialogOpen(true);
  }, []);

  const handleCropComplete = useCallback(async () => {
    if (!completedCrop || !imgRef || !currentCropImage) return;

    try {
      const croppedFile = await createCroppedImage(
        imgRef,
        completedCrop,
        currentCropImage.name
      );

      const croppedPreview = URL.createObjectURL(croppedFile);
      const croppedBase64 = (await fileToBase64(croppedFile)).split(",")[1];

      setImages((prevImages) => {
        const updatedImages = prevImages.map((img) =>
          img.id === currentCropImage.id
            ? {
                ...img,
                file: croppedFile,
                croppedPreview,
                size: croppedFile.size,
                originalFile:
                  currentCropImage.originalFile || currentCropImage.file,
                base64Data: croppedBase64 || null,
                isNew: true,
              }
            : img
        );

        if (onImagesReady) {
          const itemImagesToSend: ItemImage[] = updatedImages.map((img) => ({
            id: img.id,
            image: img.isNew ? null : img.preview,
            previewImage: img.croppedPreview || img.preview || null,
            base64Data: img.base64Data || null,
            size: img.size || null,
          }));
          onImagesReady(itemImagesToSend);
        }

        return updatedImages;
      });

      setCropDialogOpen(false);
      setCurrentCropImage(null);
      setCrop(undefined);
      setCompletedCrop(undefined);
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  }, [
    completedCrop,
    imgRef,
    currentCropImage,
    createCroppedImage,
    onImagesReady,
  ]);

  const handleCropCancel = useCallback(() => {
    setCropDialogOpen(false);
    setCurrentCropImage(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, []);

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addImages(e.dataTransfer.files);
      }
    },
    [addImages]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addImages(e.target.files);
      }
    },
    [addImages]
  );

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    // State
    images,
    dragActive,
    cropDialogOpen,
    currentCropImage,
    crop,
    completedCrop,
    imgRef,
    isLoadingOldImages,
    fileInputRef,

    // Setters for crop dialog
    setCrop,
    setCompletedCrop,
    setImgRef,
    setCropDialogOpen,

    // Functions
    formatFileSize,
    addImages,
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

    // Computed values
    maxFiles,
    cropMinWidth,
    cropMinHeight,
    cropAspectRatio,
  };
};
