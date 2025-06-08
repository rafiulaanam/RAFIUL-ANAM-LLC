"use client";

import { Editor as TinyMCEEditor } from '@tinymce/tinymce-react';
import { useCallback } from 'react';
import { toast } from "sonner";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

interface BlobInfo {
  blob: () => Blob;
  filename: () => string;
  base64: () => string;
}

export function Editor({ value, onChange, disabled }: EditorProps) {
  const handleImageUpload = useCallback(
    async (blobInfo: BlobInfo): Promise<string> => {
      return new Promise(async (resolve, reject) => {
        try {
          const formData = new FormData();
          formData.append('file', blobInfo.blob());
          formData.append('type', 'blog'); // Specify type for blog uploads
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Upload failed');
          }

          if (!result.success || !result.url) {
            throw new Error(result.error || 'Failed to get upload URL');
          }

          resolve(result.url);
        } catch (error) {
          console.error('Error uploading image:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
          toast.error(errorMessage);
          reject(errorMessage);
        }
      });
    },
    []
  );

  return (
    <div className="w-full rounded-md border border-input bg-background">
      <TinyMCEEditor
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
        value={value}
        onEditorChange={(content) => {
          onChange(content);
        }}
        init={{
          height: 500,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'searchreplace', 'visualblocks', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | formatselect | ' +
            'bold italic backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'image | removeformat | help',
          content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 14px }',
          skin: 'oxide',
          content_css: 'default',
          readonly: disabled,
          branding: false,
          promotion: false,
          statusbar: false,
          // Image upload settings
          images_upload_handler: handleImageUpload,
          automatic_uploads: true,
          images_upload_credentials: true,
          file_picker_types: 'image',
          // Image toolbar and settings
          image_title: true,
          image_description: false,
          image_caption: true,
          image_advtab: true,
          // Allow local images to be uploaded
          paste_data_images: true,
          // Image upload validation
          images_file_types: 'jpeg,jpg,png,gif,webp',
          max_file_size: 5242880, // 5MB
          images_upload_base_path: '/',
          images_reuse_filename: true
        }}
      />
    </div>
  );
} 