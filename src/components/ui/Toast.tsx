"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

const toastVariants = {
  default: "bg-white border-neutral-200 text-neutral-900",
  success: "bg-success-50 border-success-200 text-success-900",
  error: "bg-error-50 border-error-200 text-error-900",
  warning: "bg-warning-50 border-warning-200 text-warning-900",
};

const toastIcons = {
  default: Info,
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
};

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning";
  duration?: number;
  onDismiss: (id: string) => void;
}

export function Toast({
  id,
  title,
  description,
  variant = "default",
  duration = 5000,
  onDismiss,
}: ToastProps) {
  const Icon = toastIcons[variant];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <ToastPrimitive.Root
      className={cn(
        "relative flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg",
        "data-[state=open]:animate-slide-in data-[state=closed]:animate-slide-out data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
        toastVariants[variant]
      )}
      duration={duration}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="flex-1">
        <ToastPrimitive.Title className="text-sm font-semibold">
          {title}
        </ToastPrimitive.Title>
        {description && (
          <ToastPrimitive.Description className="mt-1 text-sm opacity-90">
            {description}
          </ToastPrimitive.Description>
        )}
      </div>
      <ToastPrimitive.Close
        className="rounded-md p-1 text-neutral-400 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
        aria-label="Close notification"
        onClick={() => onDismiss(id)}
      >
        <X className="h-4 w-4" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
}

export const ToastProvider = ToastPrimitive.Provider;
export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-0 right-0 z-[100] flex flex-col gap-2 p-4 sm:bottom-4 sm:right-4 sm:p-0",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = "ToastViewport";
