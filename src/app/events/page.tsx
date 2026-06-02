"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Search, Calendar, SlidersHorizontal, X } from "lucide-react";
import { eventsApi } from "@/lib/api";
import EventCard from "@/components/events/EventCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";

function EventsContent() {
  useSearchParams(); // initializes URL read for Suspense boundary
  const [searchText, setSearchText] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [priceMax, setPriceMax] = useState<number | "">("");
  const [showFilters, setShowFilters] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useInfiniteQuery({
      queryKey: ["events", dateFilter, priceMax],
      queryFn: ({ pageParam }: { pageParam?: string }) =>
        eventsApi.list({
          cursor: pageParam,
          limit: 12,
          date: dateFilter || undefined,
          priceMax: priceMax !== "" ? Number(priceMax) : undefined,
        }).then((r) => r.data),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (last) => last.nextCursor,
    });

  const allEvents = data?.pages?.flatMap((p) =>
    Array.isArray(p?.events) ? p.events : []
  ).filter((e) => e?.id) || [];

  const filtered = searchText
    ? allEvents.filter(
        (e) =>
          e.title.toLowerCase().includes(searchText.toLowerCase()) ||
          e.address.toLowerCase().includes(searchText.toLowerCase())
      )
    : allEvents;

  const clearFilters = () => {
    setSearchText("");
    setDateFilter("");
    setPriceMax("");
  };

  const hasFilters = searchText || dateFilter || priceMax !== "";
  useLockBodyScroll(showFilters);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-8">
        Events
      </h1>

      {/* Filter bar */}
      <div className="bg-white/60 backdrop-blur-xl border border-neutral-200/60 rounded-3xl p-5 mb-10 flex flex-wrap gap-5 items-end shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-neutral-50/50 hover:bg-neutral-100 border border-neutral-200/60 rounded-xl pl-9 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all"
            />
          </div>
        </div>

        <div className="hidden sm:block">
          <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">
            Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-neutral-50/50 hover:bg-neutral-100 border border-neutral-200/60 rounded-xl pl-9 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all cursor-pointer"
            />
          </div>
        </div>

        <div className="hidden sm:block">
          <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">
            Max price (EGP)
          </label>
          <input
            type="number"
            placeholder="Any"
            value={priceMax}
            onChange={(e) =>
              setPriceMax(e.target.value ? Number(e.target.value) : "")
            }
            min={0}
            className="bg-neutral-50/50 hover:bg-neutral-100 border border-neutral-200/60 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all w-32"
          />
        </div>

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
            className="sm:hidden"
          >
            Filters
          </Button>
        </div>
      </div>

      {/* Mobile filter slide-over */}
      {showFilters && (
        <>
          <div
            className="fixed inset-0 z-40 bg-neutral-950/30 backdrop-blur-sm sm:hidden"
            onClick={() => setShowFilters(false)}
          />
          <div className="fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-white shadow-xl sm:hidden flex flex-col">
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
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full border border-neutral-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1 uppercase tracking-wider">
                  Max price (EGP)
                </label>
                <input
                  type="number"
                  placeholder="Any"
                  value={priceMax}
                  onChange={(e) =>
                    setPriceMax(e.target.value ? Number(e.target.value) : "")
                  }
                  min={0}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                />
              </div>
            </div>
            <div className="p-4 border-t border-neutral-100 flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={clearFilters}>
                Clear
              </Button>
              <Button className="flex-1" onClick={() => setShowFilters(false)}>
                Show {filtered.length} results
              </Button>
            </div>
          </div>
        </>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="Failed to load events"
          description="Make sure the backend is running and try again."
          action={{ label: "Retry", onClick: () => window.location.reload() }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<SlidersHorizontal className="h-6 w-6" />}
          title="No events found"
          description="Try adjusting your filters to see more results."
          action={{ label: "Clear filters", onClick: clearFilters }}
        />
      ) : (
        <>
          <p className="text-sm text-neutral-500 mb-6">
            {filtered.length} events found
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((ev) => (
              <EventCard key={ev.id} event={ev} />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center mt-12">
              <Button
                variant="secondary"
                onClick={() => fetchNextPage()}
                isLoading={isFetchingNextPage}
                size="lg"
              >
                Load more events
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <EventsContent />
    </Suspense>
  );
}
