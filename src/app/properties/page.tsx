"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { propertiesApi } from "@/lib/api";
import PropertyCard from "@/components/properties/PropertyCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import SearchBar from "@/components/properties/SearchBar";

function PropertiesContent() {
  const params = useSearchParams();
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(10000);
  const [types, setTypes] = useState<string[]>([]);
  const [ratingMin, setRatingMin] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const checkIn = params.get("checkIn") || undefined;
  const checkOut = params.get("checkOut") || undefined;

  const { data, isLoading, error } = useQuery({
    queryKey: ["properties", priceMin, priceMax, types, ratingMin, checkIn, checkOut],
    queryFn: () =>
      propertiesApi.list({
        priceMin: priceMin || undefined,
        priceMax: priceMax < 10000 ? priceMax : undefined,
        checkIn,
        checkOut,
        ratingMin: ratingMin || undefined,
      }).then((r) => r.data),
  });

  const properties = (Array.isArray(data) ? data : []).filter((p) =>
    p?.id && (types.length === 0 || types.includes(p.type))
  );

  const toggleType = (type: string) => {
    setTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Bar */}
      <div className="flex justify-center mb-8">
        <SearchBar />
      </div>

      {/* Filter toggle (mobile) */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          {isLoading ? "Loading..." : `${properties.length} properties found`}
        </h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2 text-sm font-medium hover:border-gray-900 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-64 flex-shrink-0`}>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Price range</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Min price (EGP)</label>
                  <input
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:border-gray-900"
                    min={0}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Max price (EGP)</label>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:border-gray-900"
                    min={0}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Property type</h3>
              <div className="space-y-2">
                {["APARTMENT", "HOTEL"].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={types.includes(type)}
                      onChange={() => toggleType(type)}
                      className="accent-[#FF385C] w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{type === "APARTMENT" ? "Apartment" : "Hotel"}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Min rating</h3>
              <select
                value={ratingMin}
                onChange={(e) => setRatingMin(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
              >
                <option value={0}>Any rating</option>
                {[3, 3.5, 4, 4.5].map((r) => (
                  <option key={r} value={r}>{r}+ stars</option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-2xl aspect-[4/3] mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-500">Failed to load properties. Make sure the backend is running.</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">No properties match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <PropertiesContent />
    </Suspense>
  );
}
