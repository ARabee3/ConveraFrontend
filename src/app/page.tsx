"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import SearchBar from "@/components/properties/SearchBar";
import PropertyCard from "@/components/properties/PropertyCard";
import EventCard from "@/components/events/EventCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { propertiesApi, eventsApi } from "@/lib/api";

export default function HomePage() {
  const { data: propertiesData, isLoading: loadingProperties } = useQuery({
    queryKey: ["properties", "home"],
    queryFn: () => propertiesApi.list().then((r) => r.data),
  });

  const { data: eventsData, isLoading: loadingEvents } = useQuery({
    queryKey: ["events", "home"],
    queryFn: () => eventsApi.list({ limit: 6 }).then((r) => r.data),
  });

  const properties = (Array.isArray(propertiesData) ? propertiesData : [])
    .filter((p) => p?.id)
    .slice(0, 8);
  const events = (
    Array.isArray(eventsData?.events)
      ? eventsData.events
      : Array.isArray(eventsData)
      ? eventsData
      : []
  )
    .filter((e) => e?.id)
    .slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 min-h-[60vh] flex items-center justify-center px-4 overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[length:24px_24px]" />

        <div className="relative text-center max-w-3xl w-full py-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight tracking-tight">
            Find your perfect stay
          </h1>
          <p className="text-white/80 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            Discover amazing properties and unforgettable events nearby
          </p>
          <div className="flex justify-center px-4">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
              Explore Properties
            </h2>
            <p className="text-neutral-500 text-sm md:text-base mt-1.5">
              Find your next home away from home
            </p>
          </div>
          <Link
            href="/properties"
            className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors shrink-0"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loadingProperties ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <EmptyState
            icon={<ArrowRight className="h-6 w-6" />}
            title="No properties yet"
            description="Check back soon for new listings."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="border-t border-neutral-100" />

      {/* Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
              Upcoming Events
            </h2>
            <p className="text-neutral-500 text-sm md:text-base mt-1.5">
              Discover experiences not to be missed
            </p>
          </div>
          <Link
            href="/events"
            className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors shrink-0"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loadingEvents ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon={<ArrowRight className="h-6 w-6" />}
            title="No events yet"
            description="Stay tuned for upcoming experiences."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <EventCard key={ev.id} event={ev} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="bg-neutral-100 py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">
            Become a Host
          </h2>
          <p className="text-neutral-500 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Earn extra income by sharing your space with travelers from around the world.
          </p>
          <Link
            href="/register?role=HOST"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors duration-150 text-lg shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            Become a Host <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
