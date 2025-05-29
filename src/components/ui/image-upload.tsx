"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: () => void;
  value: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value
}) => {
  const [loading, setLoading] = useState(false);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload image');
      }

      onChange(data.secure_url);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <input
        type="file"
        accept="image/*"
        disabled={disabled || loading}
        style={{ display: 'none' }}
        onChange={onUpload}
        id="imageUpload"
      />
      <div className="flex flex-col items-center justify-center gap-4">
        {value && (
          <div className="relative w-40 h-40">
            <Image
              fill
              alt="Product image"
              src={value}
              className="object-cover rounded-md"
            />
          </div>
        )}
        <div className="flex gap-2">
          <Button
            type="button"
            disabled={disabled || loading}
            variant="secondary"
            onClick={() => document.getElementById('imageUpload')?.click()}
          >
            {loading ? 'Uploading...' : value ? 'Change Image' : 'Upload Image'}
          </Button>
          {value && (
            <Button
              type="button"
              disabled={disabled || loading}
              variant="destructive"
              onClick={onRemove}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload; 