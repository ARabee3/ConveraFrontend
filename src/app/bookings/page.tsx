"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatPrice, formatDateRange } from "@/lib/utils";
import type { BookingStatus } from "@/lib/types";
import Link from "next/link";
import { bookingsApi } from "@/lib/api";

const statusColors: Record<BookingStatus, string> = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  COMPLETED: "bg-gray-100 text-gray-700",
};

const PLACEHOLDER = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80";

export default function BookingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ["bookings", "me"],
    queryFn: () => bookingsApi.listMe().then((r) => r.data),
    enabled: !!user,
  });

  if (!user) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
      <p className="text-gray-500 mb-10">Manage your reservations and tickets</p>

      {isLoading ? (
        <LoadingSpinner fullPage />
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-500">Failed to load bookings. Please try again later.</p>
        </div>
      ) : !bookings || bookings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h2>
          <p className="text-gray-500 text-sm mb-6">
            Start exploring properties and events to make your first booking
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/properties"
              className="bg-[#FF385C] hover:bg-[#E31C5F] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              Browse Properties
            </Link>
            <Link
              href="/events"
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              Browse Events
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-5 hover:shadow-card transition-shadow"
            >
              {/* Property Image */}
              <div className="w-full sm:w-40 h-32 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={booking.property?.imageUrls?.[0] || PLACEHOLDER}
                  alt={booking.property?.title || "Property"}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {booking.property?.title || "Property"}
                  </h3>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[booking.status]}`}>
                    {booking.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate mb-1">
                  {booking.property?.address || ""}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  {formatDateRange(booking.startDate, booking.endDate)}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">
                    {formatPrice(booking.totalPrice)}
                  </span>
                  <div className="flex gap-3">
                    {booking.status === "PENDING_PAYMENT" ? (
                      <Link href={`/bookings/${booking.id}/payment`}>
                        <Button size="sm">Complete Payment</Button>
                      </Link>
                    ) : (
                      <Link href={`/properties/${booking.propertyId}`}>
                        <Button variant="secondary" size="sm">
                          View Property
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking status legend */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["PENDING_PAYMENT", "CONFIRMED", "CANCELLED", "COMPLETED"] as BookingStatus[]).map((status) => (
          <div key={status} className={`px-3 py-2 rounded-xl text-xs font-medium text-center ${statusColors[status]}`}>
            {status.replace("_", " ")}
          </div>
        ))}
      </div>
    </div>
  );
}
