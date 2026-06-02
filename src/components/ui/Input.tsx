"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, icon, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-neutral-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "flex h-11 w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150",
              "focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10",
              "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500",
              icon && "pl-10",
              error
                ? "border-error-300 focus:border-error-500 focus:ring-error-500/10"
                : "border-neutral-200 hover:border-neutral-300",
              className
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={cn(errorId, helperId) || undefined}
            {...props}
          />
        </div>
        {error && (
          <p
            id={errorId}
            className="mt-1.5 flex items-center gap-1 text-xs font-medium text-error-600"
            role="alert"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-xs text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export default Input;
