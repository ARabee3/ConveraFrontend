"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { api } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  label?: string;
}

export default function ImageUploader({ value, onChange, maxFiles = 5, label = "Upload images" }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (value.length + acceptedFiles.length > maxFiles) {
        setError(`Maximum ${maxFiles} images allowed`);
        return;
      }
      setError("");
      setUploading(true);

      try {
        const formData = new FormData();
        acceptedFiles.forEach((file) => formData.append("images", file));

        const { data } = await api.post<{ urls: string[] }>("/upload/images", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        onChange([...value, ...data.urls]);
      } catch {
        setError("Failed to upload images. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [value, onChange, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    disabled: uploading || value.length >= maxFiles,
  });

  const removeImage = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-800">{label}</label>

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {value.map((url, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1.5 right-1.5 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      {value.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-[#FF385C] bg-red-50"
              : "border-gray-300 hover:border-gray-400 bg-gray-50"
          } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <Upload className={`w-8 h-8 mb-2 ${isDragActive ? "text-[#FF385C]" : "text-gray-400"}`} />
              <p className="text-sm text-gray-600 text-center">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG up to {maxFiles} images
              </p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-gray-400">{value.length} / {maxFiles} images</p>
    </div>
  );
}
