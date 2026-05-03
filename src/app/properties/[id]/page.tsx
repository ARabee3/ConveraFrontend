"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MapPin, Wifi, Star, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { propertiesApi, bookingsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { formatPrice, formatDate, diffDays } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import StarRating from "@/components/ui/StarRating";
import Button from "@/components/ui/Button";

const PLACEHOLDER = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80";

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [bookingError, setBookingError] = useState("");

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: () => propertiesApi.get(id).then((r) => r.data),
    enabled: !!id,
  });

  const bookMutation = useMutation({
    mutationFn: () => bookingsApi.create(id, checkIn, checkOut),
    onSuccess: (res) => {
      router.push(`/bookings/${res.data.id}/payment`);
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      setBookingError(error?.response?.data?.message || "Booking failed. Please try again.");
    },
  });

  const nights = checkIn && checkOut ? diffDays(checkIn, checkOut) : 0;
  const total = property ? nights * property.basePrice : 0;

  const handleReserve = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!checkIn || !checkOut) {
      setBookingError("Please select check-in and check-out dates.");
      return;
    }
    if (nights <= 0) {
      setBookingError("Check-out must be after check-in.");
      return;
    }
    setBookingError("");
    bookMutation.mutate();
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  if (!property) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Property not found.</p>
      <Link href="/properties" className="text-[#FF385C] mt-4 inline-block">← Back to properties</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link href="/properties" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to properties
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />{property.address}
        </div>
        {property.avgRating !== undefined && property.avgRating > 0 && (
          <StarRating rating={property.avgRating} size="sm" />
        )}
        <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium">
          {property.type === "APARTMENT" ? "Apartment" : "Hotel"}
        </span>
      </div>

      {/* Image gallery */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[420px] mb-10">
        <div className="col-span-2 row-span-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={property.imageUrls?.[0] || PLACEHOLDER}
            alt={property.title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
          />
        </div>
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx} className="overflow-hidden bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={property.imageUrls?.[idx] || PLACEHOLDER}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">About this place</h2>
            <p className="text-gray-600 leading-relaxed">{property.description}</p>
          </div>

          {property.amenities?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">What this place offers</h2>
              <div className="grid grid-cols-2 gap-3">
                {property.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-gray-700">
                    <Wifi className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {property.reviews && property.reviews.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 fill-[#FF385C] text-[#FF385C]" />
                {property.avgRating?.toFixed(1)} · {property.reviews.length} reviews
              </h2>
              <div className="space-y-4">
                {property.reviews.map((r) => (
                  <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                        G
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formatDate(r.createdAt)}</p>
                        <StarRating rating={r.rating} size="sm" showValue={false} />
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Booking widget */}
        <div>
          <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl shadow-card p-6">
            <div className="flex items-end gap-1 mb-6">
              <span className="text-2xl font-bold text-gray-900">{formatPrice(property.basePrice)}</span>
              <span className="text-gray-500 text-sm mb-0.5">/ night</span>
            </div>

            <div className="border border-gray-300 rounded-xl overflow-hidden mb-3">
              <div className="grid grid-cols-2 divide-x divide-gray-300">
                <div className="p-3">
                  <p className="text-[10px] font-bold uppercase text-gray-800 mb-1">Check-in</p>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="text-sm w-full outline-none cursor-pointer"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="p-3">
                  <p className="text-[10px] font-bold uppercase text-gray-800 mb-1">Check-out</p>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="text-sm w-full outline-none cursor-pointer"
                    min={checkIn || new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
            </div>

            {bookingError && (
              <p className="text-red-500 text-xs mb-3">{bookingError}</p>
            )}

            <Button
              className="w-full py-3 text-base"
              onClick={handleReserve}
              isLoading={bookMutation.isPending}
            >
              {user ? "Reserve" : "Log in to reserve"}
            </Button>

            {nights > 0 && (
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>{formatPrice(property.basePrice)} × {nights} nights</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
