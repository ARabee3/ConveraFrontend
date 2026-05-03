"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar } from "lucide-react";

export default function SearchBar() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white rounded-full shadow-card hover:shadow-card-hover transition-shadow flex items-stretch divide-x divide-gray-200 overflow-hidden max-w-2xl w-full"
    >
      {/* Location */}
      <div className="flex-1 flex items-center gap-2 px-5 py-3 min-w-0">
        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-gray-800 uppercase tracking-wider leading-none">Where</p>
          <input
            type="text"
            placeholder="Search destinations"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="text-sm text-gray-700 placeholder-gray-400 outline-none w-full bg-transparent mt-0.5"
          />
        </div>
      </div>

      {/* Check in */}
      <div className="flex items-center gap-2 px-5 py-3">
        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <div>
          <p className="text-[10px] font-bold text-gray-800 uppercase tracking-wider leading-none">Check in</p>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="text-sm text-gray-700 outline-none bg-transparent mt-0.5 cursor-pointer"
          />
        </div>
      </div>

      {/* Check out */}
      <div className="flex items-center gap-2 px-5 py-3">
        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <div>
          <p className="text-[10px] font-bold text-gray-800 uppercase tracking-wider leading-none">Check out</p>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="text-sm text-gray-700 outline-none bg-transparent mt-0.5 cursor-pointer"
          />
        </div>
      </div>

      {/* Search button */}
      <div className="flex items-center pl-2 pr-2">
        <button
          type="submit"
          className="bg-[#FF385C] hover:bg-[#E31C5F] text-white rounded-full p-3 transition-colors flex items-center gap-2 font-semibold text-sm"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:block pr-1">Search</span>
        </button>
      </div>
    </form>
  );
}
