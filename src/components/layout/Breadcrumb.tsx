"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1.5 text-sm text-neutral-500", className)}
    >
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-neutral-900 transition-colors"
        aria-label="Home"
      >
        <Home className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
      {items.map((item, index) => (
        <div key={item.label + index} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-neutral-300" aria-hidden="true" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-neutral-900 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-neutral-900 font-medium" aria-current="page">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
