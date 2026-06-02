"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  containerClassName?: string;
}

const DEFAULT_PLACEHOLDER = "https://placehold.co/800x600/f3f4f6/9ca3af?text=No+Image+Available";

export function SafeImage({
  src,
  alt = "",
  fallback = DEFAULT_PLACEHOLDER,
  className,
  containerClassName,
  onError,
  ...props
}: SafeImageProps) {
  const [error, setError] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setError(true);
    onError?.(e);
  };

  return (
    <div className={cn("relative overflow-hidden bg-neutral-100", containerClassName)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={error ? fallback : src || fallback}
        alt={alt}
        className={cn("h-full w-full object-cover", className)}
        onError={(e) => {
          handleError(e);
          if (error) {
            // Prevent infinite loop if fallback also fails
            e.currentTarget.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // 1x1 transparent
          }
        }}
        {...props}
      />
    </div>
  );
}
