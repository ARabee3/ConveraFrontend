"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import SearchBar from "@/components/properties/SearchBar";
import PropertyCard from "@/components/properties/PropertyCard";
import EventCard from "@/components/events/EventCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
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

  const properties = (Array.isArray(propertiesData) ? propertiesData : []).filter(p => p?.id).slice(0, 8);
  const events = (Array.isArray(eventsData?.events) ? eventsData.events : Array.isArray(eventsData) ? eventsData : []).filter(e => e?.id).slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#FF385C] to-[#E31C5F] min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-3xl w-full">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Find your<br />perfect stay
          </h1>
          <p className="text-white/80 text-lg mb-10">
            Discover amazing properties and unforgettable events nearby
          </p>
          <div className="flex justify-center">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Explore Properties</h2>
            <p className="text-gray-500 text-sm mt-1">Find your next home away from home</p>
          </div>
          <Link
            href="/properties"
            className="flex items-center gap-1 text-sm font-semibold text-[#FF385C] hover:underline"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingProperties ? (
          <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No properties available yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
            <p className="text-gray-500 text-sm mt-1">Discover experiences not to be missed</p>
          </div>
          <Link
            href="/events"
            className="flex items-center gap-1 text-sm font-semibold text-[#FF385C] hover:underline"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingEvents ? (
          <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No events available yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <EventCard key={ev.id} event={ev} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Become a Host</h2>
          <p className="text-gray-500 text-lg mb-8">Earn extra income by sharing your space with travelers from around the world.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#FF385C] hover:bg-[#E31C5F] text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
          >
            Get started <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
