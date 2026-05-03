import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
}

export default function LoadingSpinner({ className, size = "md", fullPage }: LoadingSpinnerProps) {
  const sizes = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };

  const spinner = (
    <Loader2 className={cn("animate-spin text-[#FF385C]", sizes[size], className)} />
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        {spinner}
      </div>
    );
  }

  return spinner;
}
