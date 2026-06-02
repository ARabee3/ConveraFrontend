"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6 text-[11px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
  xl: "h-14 w-14 text-base",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, name, size = "md", className }, ref) => {
    const [error, setError] = React.useState(false);
    const showFallback = !src || error;

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden rounded-full font-semibold uppercase tracking-wide",
          "bg-primary-50 text-primary-700",
          sizeClasses[size],
          className
        )}
        aria-label={`Avatar for ${name}`}
      >
        {!showFallback && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={src}
            alt={name}
            className="h-full w-full object-cover"
            onError={() => setError(true)}
          />
        )}
        {showFallback && <span>{getInitials(name)}</span>}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar };
