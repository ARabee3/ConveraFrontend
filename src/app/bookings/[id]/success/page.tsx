"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Home, ArrowRight } from "lucide-react";
import Link from "next/link";
import { bookingsApi } from "@/lib/api";
import { formatPrice, formatDateRange } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";

const PLACEHOLDER = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80";

export default function PaymentSuccessPage() {
  const { id } = useParams<{ id: string }>();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings", "me"],
    queryFn: () => bookingsApi.listMe().then((r) => r.data),
  });

  const booking = bookings?.find((b) => b.id === id);

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-card p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 text-sm mb-8">
          Your booking has been confirmed. We&apos;ve sent a confirmation to your email.
        </p>

        {booking && (
          <div className="bg-gray-50 rounded-2xl p-5 text-left mb-8">
            <div className="flex items-center gap-3 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={booking.property?.imageUrls?.[0] || PLACEHOLDER}
                alt={booking.property?.title || "Property"}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{booking.property?.title}</h3>
                <p className="text-xs text-gray-500">{booking.property?.address}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Dates</span>
                <span className="font-medium text-gray-900">{formatDateRange(booking.startDate, booking.endDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-semibold text-gray-900">{formatPrice(booking.totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="text-green-600 font-medium">Confirmed</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link href="/bookings">
            <Button className="w-full py-3 gap-2">
              View My Bookings <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/">
            <Button variant="secondary" className="w-full py-3 gap-2">
              <Home className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
