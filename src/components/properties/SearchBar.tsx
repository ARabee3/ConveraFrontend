"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  variant?: "hero" | "inline";
}

export default function SearchBar({ className, variant = "hero" }: SearchBarProps) {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [isExpanded, setIsExpanded] = useState(variant === "hero");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    const qs = params.toString();
    router.push(qs ? `/properties?${qs}` : "/properties");
  };

  if (variant === "inline" && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={cn(
          "flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-4 py-2.5 shadow-sm hover:shadow transition-shadow text-left w-full max-w-md",
          className
        )}
      >
        <Search className="h-4 w-4 text-primary-600 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-900">Where to?</p>
          <p className="text-xs text-neutral-500">Anywhere · Any week</p>
        </div>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSearch}
      className={cn(
        "bg-white sm:rounded-full rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col sm:flex-row items-stretch sm:items-center divide-y sm:divide-y-0 sm:divide-x divide-neutral-200 w-full max-w-4xl mx-auto border border-neutral-200/60",
        variant === "inline" && "absolute top-0 left-0 right-0 z-20 mx-4 sm:relative sm:mx-0",
        className
      )}
    >
      {/* Location */}
      <div className="flex-1 flex items-center gap-3 px-6 py-4 min-w-0 group hover:bg-neutral-50/50 transition-colors sm:rounded-l-full rounded-t-2xl cursor-text" onClick={() => document.getElementById('search-location')?.focus()}>
        <MapPin className="h-5 w-5 text-neutral-400 group-hover:text-primary-500 transition-colors shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <label htmlFor="search-location" className="block text-[11px] font-bold text-neutral-900 uppercase tracking-widest cursor-pointer">
            Where
          </label>
          <input
            id="search-location"
            type="text"
            placeholder="Search destinations"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="text-sm font-medium text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal outline-none w-full bg-transparent mt-0.5 truncate"
          />
        </div>
      </div>

      {/* Check in */}
      <div className="flex-1 flex items-center gap-3 px-6 py-4 min-w-0 group hover:bg-neutral-50/50 transition-colors cursor-text" onClick={() => document.getElementById('search-checkin')?.focus()}>
        <Calendar className="h-5 w-5 text-neutral-400 group-hover:text-primary-500 transition-colors shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <label htmlFor="search-checkin" className="block text-[11px] font-bold text-neutral-900 uppercase tracking-widest cursor-pointer">
            Check in
          </label>
          <input
            id="search-checkin"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="text-sm font-medium text-neutral-900 outline-none bg-transparent mt-0.5 w-full cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
          />
        </div>
      </div>

      {/* Check out */}
      <div className="flex-1 flex items-center gap-3 px-6 py-4 min-w-0 group hover:bg-neutral-50/50 transition-colors cursor-text" onClick={() => document.getElementById('search-checkout')?.focus()}>
        <Calendar className="h-5 w-5 text-neutral-400 group-hover:text-primary-500 transition-colors shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <label htmlFor="search-checkout" className="block text-[11px] font-bold text-neutral-900 uppercase tracking-widest cursor-pointer">
            Check out
          </label>
          <input
            id="search-checkout"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="text-sm font-medium text-neutral-900 outline-none bg-transparent mt-0.5 w-full cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
          />
        </div>
      </div>

      {/* Search button */}
      <div className="flex items-center p-2 sm:pr-2.5">
        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white sm:rounded-full rounded-xl px-6 py-3.5 sm:py-3 transition-all duration-200 font-bold text-sm w-full sm:w-auto shadow-sm active:scale-95"
        >
          <Search className="h-4 w-4 stroke-[3]" />
          <span className="sm:hidden lg:inline">Search</span>
        </button>
      </div>
    </form>
  );
}
