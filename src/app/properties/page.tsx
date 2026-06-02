"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { propertiesApi } from "@/lib/api";
import PropertyCard from "@/components/properties/PropertyCard";
import SearchBar from "@/components/properties/SearchBar";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useDebounce } from "@/hooks/use-debounce";

const propertyTypes = [
  { value: "APARTMENT", label: "Apartment" },
  { value: "HOTEL", label: "Hotel" },
];

function PropertiesContent() {
  const params = useSearchParams();
  const [priceMinInput, setPriceMinInput] = useState(0);
  const [priceMaxInput, setPriceMaxInput] = useState(10000);
  const [types, setTypes] = useState<string[]>([]);
  const [ratingMin, setRatingMin] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const priceMin = useDebounce(priceMinInput, 500);
  const priceMax = useDebounce(priceMaxInput, 500);

  const checkIn = params.get("checkIn") || undefined;
  const checkOut = params.get("checkOut") || undefined;
  const location = params.get("location") || undefined;

  const { data, isLoading, error } = useQuery({
    queryKey: ["properties", priceMin, priceMax, types, ratingMin, checkIn, checkOut, location],
    queryFn: () =>
      propertiesApi
        .list({
          search: location,
          priceMin: priceMin || undefined,
          priceMax: priceMax < 10000 ? priceMax : undefined,
          checkIn,
          checkOut,
          ratingMin: ratingMin || undefined,
        })
        .then((r) => r.data),
  });

  const properties = (Array.isArray(data) ? data : []).filter(
    (p) => p?.id && (types.length === 0 || types.includes(p.type))
  );

  const toggleType = (type: string) => {
    setTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setPriceMinInput(0);
    setPriceMaxInput(10000);
    setTypes([]);
    setRatingMin(0);
  };

  const hasFilters = priceMinInput > 0 || priceMaxInput < 10000 || types.length > 0 || ratingMin > 0;

  useLockBodyScroll(showFilters);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Search Bar */}
      <div className="flex justify-center mb-8 md:mb-10">
        <SearchBar variant="inline" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-neutral-900">
          {isLoading ? (
            <span className="inline-block w-32 h-6 bg-neutral-200 rounded animate-pulse" />
          ) : (
            `${properties.length} properties found`
          )}
        </h1>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<SlidersHorizontal className="h-4 w-4" />}
            onClick={() => setShowFilters(true)}
            className="md:hidden"
          >
            Filters
          </Button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters — desktop sticky, mobile slide-over */}
        <aside className="hidden md:block w-72 shrink-0">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 sticky top-24 space-y-8">
            <FilterContent
              priceMin={priceMinInput}
              setPriceMin={setPriceMinInput}
              priceMax={priceMaxInput}
              setPriceMax={setPriceMaxInput}
              types={types}
              toggleType={toggleType}
              ratingMin={ratingMin}
              setRatingMin={setRatingMin}
            />
          </div>
        </aside>

        {/* Mobile filter slide-over */}
        {showFilters && (
          <>
            <div
              className="fixed inset-0 z-40 bg-neutral-950/30 backdrop-blur-sm md:hidden"
              onClick={() => setShowFilters(false)}
            />
            <div className="fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-white shadow-xl md:hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-neutral-100">
                <span className="text-lg font-bold text-neutral-900">Filters</span>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 rounded-lg hover:bg-neutral-100"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5 text-neutral-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <FilterContent
                  priceMin={priceMinInput}
                  setPriceMin={setPriceMinInput}
                  priceMax={priceMaxInput}
                  setPriceMax={setPriceMaxInput}
                  types={types}
                  toggleType={toggleType}
                  ratingMin={ratingMin}
                  setRatingMin={setRatingMin}
                />
              </div>
              <div className="p-4 border-t border-neutral-100 flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={clearFilters}>
                  Clear
                </Button>
                <Button className="flex-1" onClick={() => setShowFilters(false)}>
                  Show {properties.length} results
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Results Grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              icon={<Search className="h-6 w-6" />}
              title="Failed to load properties"
              description="Make sure the backend is running and try again."
              action={{ label: "Retry", onClick: () => window.location.reload() }}
            />
          ) : properties.length === 0 ? (
            <EmptyState
              icon={<SlidersHorizontal className="h-6 w-6" />}
              title="No properties match your filters"
              description="Try adjusting your filters to see more results."
              action={{ label: "Clear filters", onClick: clearFilters }}
            />
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

function FilterContent({
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  types,
  toggleType,
  ratingMin,
  setRatingMin,
}: {
  priceMin: number;
  setPriceMin: (v: number) => void;
  priceMax: number;
  setPriceMax: (v: number) => void;
  types: string[];
  toggleType: (t: string) => void;
  ratingMin: number;
  setRatingMin: (v: number) => void;
}) {
  return (
    <>
      <div>
        <h3 className="font-semibold text-neutral-900 mb-3 text-sm">Price range</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">Min price (EGP)</label>
            <input
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(Number(e.target.value))}
              className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
              min={0}
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">Max price (EGP)</label>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
              min={0}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-neutral-900 mb-3 text-sm">Property type</h3>
        <div className="space-y-2">
          {propertyTypes.map((type) => (
            <label
              key={type.value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={types.includes(type.value)}
                  onChange={() => toggleType(type.value)}
                  className="peer h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500/20"
                />
              </div>
              <span className="text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors">
                {type.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-neutral-900 mb-3 text-sm">Min rating</h3>
        <select
          value={ratingMin}
          onChange={(e) => setRatingMin(Number(e.target.value))}
          className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
        >
          <option value={0}>Any rating</option>
          {[3, 3.5, 4, 4.5].map((r) => (
            <option key={r} value={r}>
              {r}+ stars
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <PropertiesContent />
    </Suspense>
  );
}
