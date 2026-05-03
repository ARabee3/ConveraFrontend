import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

export default function StarRating({ rating, size = "sm", showValue = true, className }: StarRatingProps) {
  const sizes = { sm: "w-3 h-3", md: "w-4 h-4", lg: "w-5 h-5" };
  const textSizes = { sm: "text-xs", md: "text-sm", lg: "text-base" };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizes[size],
            star <= Math.round(rating) ? "fill-[#FF385C] text-[#FF385C]" : "fill-gray-200 text-gray-200"
          )}
        />
      ))}
      {showValue && (
        <span className={cn("font-semibold text-gray-800 ml-0.5", textSizes[size])}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
