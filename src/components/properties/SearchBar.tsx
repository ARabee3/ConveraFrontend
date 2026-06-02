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
        "bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col sm:flex-row items-stretch sm:items-center divide-y sm:divide-y-0 sm:divide-x divide-neutral-100 overflow-hidden w-full max-w-3xl",
        variant === "inline" && "absolute top-0 left-0 right-0 z-20 mx-4 sm:relative sm:mx-0",
        className
      )}
    >
      {/* Location */}
      <div className="flex-1 flex items-center gap-3 px-5 py-3.5 min-w-0">
        <MapPin className="h-4 w-4 text-neutral-400 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <label className="block text-xs font-semibold text-neutral-900 uppercase tracking-wider">
            Where
          </label>
          <input
            type="text"
            placeholder="Search destinations"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="text-sm text-neutral-700 placeholder:text-neutral-400 outline-none w-full bg-transparent mt-0.5"
          />
        </div>
      </div>

      {/* Check in */}
      <div className="flex items-center gap-3 px-5 py-3.5">
        <Calendar className="h-4 w-4 text-neutral-400 shrink-0" aria-hidden="true" />
        <div>
          <label className="block text-xs font-semibold text-neutral-900 uppercase tracking-wider">
            Check in
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="text-sm text-neutral-700 outline-none bg-transparent mt-0.5 cursor-pointer"
          />
        </div>
      </div>

      {/* Check out */}
      <div className="flex items-center gap-3 px-5 py-3.5">
        <Calendar className="h-4 w-4 text-neutral-400 shrink-0" aria-hidden="true" />
        <div>
          <label className="block text-xs font-semibold text-neutral-900 uppercase tracking-wider">
            Check out
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="text-sm text-neutral-700 outline-none bg-transparent mt-0.5 cursor-pointer"
          />
        </div>
      </div>

      {/* Search button */}
      <div className="flex items-center p-2">
        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-5 py-2.5 transition-colors duration-150 font-semibold text-sm w-full sm:w-auto"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>
    </form>
  );
}
