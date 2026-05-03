"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Badge from "@/components/ui/Badge";
import { formatPrice, formatDateRange, formatDate } from "@/lib/utils";
import type { BookingStatus } from "@/lib/types";
import Link from "next/link";

// Since there's no GET /bookings endpoint documented, we show a note
// In a real app this would fetch from the API

const statusColors: Record<BookingStatus, string> = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  COMPLETED: "bg-gray-100 text-gray-700",
};

export default function BookingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
      <p className="text-gray-500 mb-10">Manage your reservations and tickets</p>

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

      {/* Info box */}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> After making a booking on a property or event page, you&apos;ll be redirected to the payment page. Once paid, your booking will appear here once the API returns booking history. Logged in as <strong>{user?.email}</strong>.
        </p>
      </div>

      {/* Booking status legend */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["PENDING_PAYMENT", "CONFIRMED", "CANCELLED", "COMPLETED"] as BookingStatus[]).map((status) => (
          <div key={status} className={`px-3 py-2 rounded-xl text-xs font-medium text-center ${statusColors[status]}`}>
            {status.replace("_", " ")}
          </div>
        ))}
      </div>
    </div>
  );
}
