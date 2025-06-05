"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  disabled?: boolean;
  type?: "products" | "categories";
}

const ImageUpload = ({
  value,
  onChange,
  onRemove,
  disabled,
  type = "products"
}: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setIsUploading(true);
      const file = acceptedFiles[0];

      if (!file) return;

      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      // Upload to your storage service (e.g., S3, Cloudinary)
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }
      
      onChange(data.url);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  }, [onChange, type]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"]
    },
    maxFiles: 1,
    disabled: disabled || isUploading,
  });

  const aspectRatio = type === "categories" ? "aspect-video" : "aspect-square";

  return (
    <div className="mb-4 flex flex-col items-center justify-center gap-4">
      {value ? (
        <div className={`relative ${aspectRatio} w-full max-w-[400px] rounded-lg overflow-hidden`}>
          <div className="absolute right-2 top-2 z-10">
            <Button
              type="button"
              onClick={onRemove}
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Image
            src={value}
            alt="Uploaded image"
            className="object-cover"
            fill
            sizes="(max-width: 400px) 100vw, 400px"
          />
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            relative flex ${aspectRatio} w-full max-w-[400px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors
            ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
            ${disabled ? "cursor-not-allowed opacity-50" : "hover:border-primary hover:bg-primary/5"}
          `}
        >
          <input {...getInputProps()} />
          <ImagePlus className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            {isUploading ? "Uploading..." : "Drag & drop or click to upload"}
          </p>
          <p className="text-xs text-muted-foreground">
            {type === "categories" ? "Recommended size: 600x400" : "Recommended size: 800x800"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 