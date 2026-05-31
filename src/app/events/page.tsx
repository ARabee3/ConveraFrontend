"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Search, Calendar } from "lucide-react";
import { eventsApi } from "@/lib/api";
import EventCard from "@/components/events/EventCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";

function EventsContent() {
  const _params = useSearchParams(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [searchText, setSearchText] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [priceMax, setPriceMax] = useState<number | "">("");

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

  const allEvents = data?.pages?.flatMap((p) => Array.isArray(p?.events) ? p.events : []).filter(e => e?.id) || [];
  const filtered = searchText
    ? allEvents.filter(
        (e) =>
          e.title.toLowerCase().includes(searchText.toLowerCase()) ||
          e.address.toLowerCase().includes(searchText.toLowerCase())
      )
    : allEvents;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Events</h1>

      {/* Filter bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-8 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Max price (EGP)</label>
          <input
            type="number"
            placeholder="Any"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) : "")}
            min={0}
            className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-900 w-32"
          />
        </div>

        {(searchText || dateFilter || priceMax !== "") && (
          <button
            onClick={() => { setSearchText(""); setDateFilter(""); setPriceMax(""); }}
            className="text-sm text-[#FF385C] font-medium hover:underline self-end pb-2.5"
          >
            Clear filters
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner fullPage />
      ) : error ? (
        <div className="text-center py-16 text-red-500">Failed to load events. Make sure the backend is running.</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-xl mb-2">No events found</p>
          <p className="text-gray-300 text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-6">{filtered.length} events found</p>
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
