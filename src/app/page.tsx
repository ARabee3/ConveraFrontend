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
      <section className="relative min-h-[75vh] flex items-center justify-center px-4 overflow-hidden bg-neutral-950">
        {/* Abstract glowing shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[600px] opacity-40 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600 rounded-full mix-blend-screen filter blur-[128px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-1/3 right-1/4 w-[32rem] h-[32rem] bg-indigo-500 rounded-full mix-blend-screen filter blur-[128px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        </div>
        
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[length:24px_24px]" />

        <div className="relative z-10 text-center max-w-4xl w-full py-20 mt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-primary-200 text-sm font-medium mb-8 backdrop-blur-md shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary-400"></span>
            Experience the new Convera
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-neutral-500 mb-6 tracking-tight text-balance">
            Elevate your next journey
          </h1>
          <p className="text-neutral-300 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Book premium stays and exclusive events in one seamless platform. Designed for the modern explorer.
          </p>
          <div className="flex justify-center px-4 w-full max-w-4xl mx-auto">
            <div className="w-full p-2 md:p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
              <SearchBar />
            </div>
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
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-neutral-950" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_bottom,var(--tw-gradient-stops))] from-primary-900 via-neutral-950 to-neutral-950" />
        <div className="max-w-4xl mx-auto text-center relative z-10 border border-white/10 bg-white/5 backdrop-blur-md rounded-3xl p-12 shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Ready to host?
          </h2>
          <p className="text-neutral-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            Join thousands of hosts earning extra income by sharing their space with travelers worldwide.
          </p>
          <Link
            href="/register?role=HOST"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 text-lg shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] active:scale-[0.98]"
          >
            Become a Host <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
