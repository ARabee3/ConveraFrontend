import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return `EGP ${amount.toLocaleString("en-EG")}`;
}

export function formatDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

export function formatDateRange(start: string, end: string): string {
  try {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    return `${format(startDate, "MMM d")} – ${format(endDate, "MMM d, yyyy")}`;
  } catch {
    return `${start} – ${end}`;
  }
}

export function diffDays(start: string, end: string): number {
  try {
    const s = parseISO(start);
    const e = parseISO(end);
    return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  } catch {
    return 1;
  }
}
