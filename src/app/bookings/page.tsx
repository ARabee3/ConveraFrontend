"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPrice, formatDateRange } from "@/lib/utils";
import type { BookingStatus } from "@/lib/types";
import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { bookingsApi } from "@/lib/api";
import { CalendarDays, MapPin } from "lucide-react";

const statusConfig: Record<
  BookingStatus,
  { variant: "default" | "primary" | "success" | "warning" | "error" | "neutral"; icon: React.ReactNode }
> = {
  PENDING_PAYMENT: { variant: "warning", icon: <CalendarDays className="h-3.5 w-3.5" /> },
  CONFIRMED: { variant: "success", icon: <CalendarDays className="h-3.5 w-3.5" /> },
  CANCELLED: { variant: "error", icon: <CalendarDays className="h-3.5 w-3.5" /> },
  COMPLETED: { variant: "neutral", icon: <CalendarDays className="h-3.5 w-3.5" /> },
};

const PLACEHOLDER = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80";

export default function BookingsPage() {
  const { user, hydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.push("/login");
  }, [user, hydrated, router]);

  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ["bookings", "me"],
    queryFn: () => bookingsApi.listMe().then((r) => r.data),
    enabled: !!user,
  });

  if (!hydrated || !user) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-1">
        My Bookings
      </h1>
      <p className="text-neutral-500 mb-10">
        Manage your reservations and tickets
      </p>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-neutral-200 rounded-2xl p-4 animate-pulse h-32"
            />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={<CalendarDays className="h-6 w-6" />}
          title="Failed to load bookings"
          description="Please try again later."
          action={{ label: "Retry", onClick: () => window.location.reload() }}
        />
      ) : !bookings || bookings.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-6 w-6" />}
          title="No bookings yet"
          description="Start exploring properties and events to make your first booking."
          action={{ label: "Browse properties", onClick: () => router.push("/properties") }}
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-5 hover:shadow-md transition-shadow duration-150"
            >
              {/* Image */}
              <div className="w-full sm:w-40 h-32 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-neutral-100 relative">
                <SafeImage
                  src={booking.property?.imageUrls?.[0] || PLACEHOLDER}
                  alt={booking.property?.title || "Property"}
                  containerClassName="h-full w-full"
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-neutral-900 truncate">
                    {booking.property?.title || "Property"}
                  </h3>
                  <Badge variant={statusConfig[booking.status].variant} size="sm">
                    <span className="flex items-center gap-1">
                      {statusConfig[booking.status].icon}
                      {booking.status.replace("_", " ")}
                    </span>
                  </Badge>
                </div>
                <p className="text-sm text-neutral-500 truncate mb-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {booking.property?.address || ""}
                </p>
                <p className="text-sm text-neutral-600 mb-3">
                  {formatDateRange(booking.startDate, booking.endDate)}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-900">
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
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(
          [
            "PENDING_PAYMENT",
            "CONFIRMED",
            "CANCELLED",
            "COMPLETED",
          ] as BookingStatus[]
        ).map((status) => (
          <div
            key={status}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-neutral-100 bg-white text-xs font-medium text-neutral-600"
          >
            {statusConfig[status].icon}
            <span className="text-center">{status.replace("_", " ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
