"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MapPin, Calendar, Users, ChevronLeft, Clock } from "lucide-react";
import Link from "next/link";
import { eventsApi, bookingsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { formatPrice, formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import MapView from "@/components/ui/MapView";

const PLACEHOLDER = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [bookingError, setBookingError] = useState("");

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => eventsApi.get(id).then((r) => r.data),
    enabled: !!id,
  });

  // Events use the booking endpoint with today + tomorrow as default dates (event day)
  const ticketMutation = useMutation({
    mutationFn: () => {
      if (!event) throw new Error("No event");
      const start = event.date.split("T")[0];
      const end = start; // same day
      return bookingsApi.create(id, start, end);
    },
    onSuccess: (res) => {
      router.push(`/bookings/${res.data.id}/payment`);
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      setBookingError(error?.response?.data?.message || "Failed to get ticket. Please try again.");
    },
  });

  const handleBuyTicket = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setBookingError("");
    ticketMutation.mutate();
  };

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!event) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Event not found.</p>
      <Link href="/events" className="text-[#FF385C] mt-4 inline-block">← Back to events</Link>
    </div>
  );

  const capacityPct = Math.round(((event.maxCapacity - event.remainingSpots) / event.maxCapacity) * 100);

  return (
    <div>
      {/* Cover image */}
      <div className="relative w-full h-[50vh] bg-gray-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.coverImage || PLACEHOLDER}
          alt={event.title}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8">
            <Link href="/events" className="flex items-center gap-1 text-white/80 hover:text-white text-sm mb-4">
              <ChevronLeft className="w-4 h-4" /> Back to events
            </Link>
            <span className="bg-white/20 backdrop-blur text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 inline-block">
              {event.category?.name}
            </span>
            <h1 className="text-4xl font-bold text-white mb-2">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(event.date)}</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{event.address}</span>
              {event.status === "CANCELLED" && (
                <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">Cancelled</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">About this event</h2>
            <p className="text-gray-600 leading-relaxed">{event.description}</p>
          </div>

          {/* Location Map */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
            <MapView
              lat={event.locationLat}
              lng={event.locationLng}
              address={event.address}
            />
          </div>

            {/* Capacity */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400" /> Capacity
              </h2>
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{event.maxCapacity - event.remainingSpots} attending</span>
                  <span>{event.remainingSpots} spots left</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#FF385C] h-2 rounded-full transition-all"
                    style={{ width: `${capacityPct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{capacityPct}% filled · {event.maxCapacity} total capacity</p>
              </div>
            </div>

            {/* Eligibility */}
            {event.eligibility && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Eligibility</h2>
                <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                  {event.eligibility.minAge && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="font-medium">Minimum age:</span> {event.eligibility.minAge}+
                    </div>
                  )}
                  {event.eligibility.ticketTypes?.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Ticket types: </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {event.eligibility.ticketTypes.map((t) => (
                          <span key={t} className="bg-white border border-gray-200 text-xs px-2 py-1 rounded-full text-gray-600">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {event.eligibility.specialRequirements && (
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="font-medium">Requirements:</span>
                      <span>{event.eligibility.specialRequirements}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Gallery */}
            {event.galleryImages && event.galleryImages.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {event.galleryImages.sort((a, b) => a.displayOrder - b.displayOrder).map((img) => (
                    <div key={img.id} className="rounded-xl overflow-hidden aspect-square bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Ticket widget */}
          <div>
            <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl shadow-card p-6">
              <div className="flex items-end gap-1 mb-2">
                <span className="text-2xl font-bold text-gray-900">{formatPrice(event.price)}</span>
                <span className="text-gray-500 text-sm mb-0.5">/ ticket</span>
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-500 mb-6">
                <Clock className="w-4 h-4" />
                {formatDate(event.date)}
              </div>

              {event.isSoldOut ? (
                <div className="bg-gray-100 text-gray-500 text-center py-3 rounded-xl font-semibold">
                  Sold Out
                </div>
              ) : event.status === "CANCELLED" ? (
                <div className="bg-red-50 text-red-600 text-center py-3 rounded-xl font-semibold">
                  Event Cancelled
                </div>
              ) : (
                <>
                  {bookingError && (
                    <p className="text-red-500 text-xs mb-3">{bookingError}</p>
                  )}
                  <Button
                    className="w-full py-3 text-base"
                    onClick={handleBuyTicket}
                    isLoading={ticketMutation.isPending}
                  >
                    {user ? "Get Ticket" : "Log in to get ticket"}
                  </Button>
                  <p className="text-xs text-gray-400 text-center mt-3">
                    {event.remainingSpots} spots remaining
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
