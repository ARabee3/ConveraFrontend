"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Wifi, Star, Send } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import useEmblaCarousel from "embla-carousel-react";
import { propertiesApi, bookingsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { formatPrice, formatDate, diffDays } from "@/lib/utils";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import StarRating from "@/components/ui/StarRating";
import Button from "@/components/ui/Button";
import MapView from "@/components/ui/MapView";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { useMediaQuery } from "@/hooks/use-media-query";

const PLACEHOLDER = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80";

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: () => propertiesApi.get(id).then((r) => r.data),
    enabled: !!id,
  });

  const { data: myBookings } = useQuery({
    queryKey: ["bookings", "me"],
    queryFn: () => bookingsApi.listMe().then((r) => r.data),
    enabled: !!user,
  });

  const confirmedBooking = myBookings?.find(
    (b) => b.propertyId === id && b.status === "CONFIRMED"
  );

  const hasReviewed = property?.reviews?.some((r) => r.userId === user?.id);
  const canReview = user && confirmedBooking && !hasReviewed;

  const reviewMutation = useMutation({
    mutationFn: () =>
      propertiesApi.createReview(id, {
        bookingId: confirmedBooking!.id,
        rating: reviewRating,
        comment: reviewComment || undefined,
      }),
    onSuccess: () => {
      setReviewSuccess(true);
      setReviewRating(0);
      setReviewComment("");
      setReviewError("");
      queryClient.invalidateQueries({ queryKey: ["property", id] });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      setReviewError(error?.response?.data?.message || "Failed to submit review.");
    },
  });

  const handleSubmitReview = () => {
    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError("Please select a rating.");
      return;
    }
    setReviewError("");
    reviewMutation.mutate();
  };

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

  useEffect(() => {
    if (!checkIn || !checkOut) {
      setBookingError("");
      return;
    }
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (end <= start) {
      setBookingError("Check-out must be after check-in.");
      return;
    }

    // Check blocked overrides
    const isBlocked = property?.availabilityOverrides?.some((ao) => {
      if (ao.status !== "BLOCKED") return false;
      const aoStart = new Date(ao.startDate);
      const aoEnd = new Date(ao.endDate);
      return aoStart < end && aoEnd > start;
    });

    if (isBlocked) {
      setBookingError("This property is blocked by the host for some of the selected dates.");
      return;
    }

    // Check overlapping bookings
    const isBooked = property?.bookings?.some((b) => {
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      return bStart < end && bEnd > start;
    });

    if (isBooked) {
      setBookingError("Some of the selected dates are already booked.");
      return;
    }

    setBookingError("");
  }, [checkIn, checkOut, property]);

  const handleReserve = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.id === property?.hostId) {
      setBookingError("You cannot book your own property.");
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
    
    // Final validation check to prevent mutate if error is active
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const isBlocked = property?.availabilityOverrides?.some((ao) => {
      if (ao.status !== "BLOCKED") return false;
      const aoStart = new Date(ao.startDate);
      const aoEnd = new Date(ao.endDate);
      return aoStart < end && aoEnd > start;
    });
    if (isBlocked) {
      setBookingError("This property is blocked by the host for some of the selected dates.");
      return;
    }

    const isBooked = property?.bookings?.some((b) => {
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      return bStart < end && bEnd > start;
    });
    if (isBooked) {
      setBookingError("Some of the selected dates are already booked.");
      return;
    }

    setBookingError("");
    bookMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-6 w-32 mb-6" />
        <SkeletonText lines={2} className="max-w-md mb-6" />
        <Skeleton className="aspect-video rounded-2xl mb-10" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <SkeletonText lines={4} />
            <Skeleton className="aspect-video rounded-2xl" />
          </div>
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={<MapPin className="h-6 w-6" />}
          title="Property not found"
          description="The property you are looking for does not exist or has been removed."
          action={{ label: "Browse properties", onClick: () => router.push("/properties") }}
        />
      </div>
    );
  }

  const images = property.imageUrls?.length
    ? property.imageUrls
    : [PLACEHOLDER];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <Breadcrumb
        items={[
          { label: "Properties", href: "/properties" },
          { label: property.title },
        ]}
        className="mb-6"
      />

      <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2 leading-tight">
        {property.title}
      </h1>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-500 mb-6 md:mb-8">
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          {property.address}
        </div>
        {property.avgRating !== undefined && property.avgRating > 0 && (
          <StarRating rating={property.avgRating} size="sm" />
        )}
        <span className="bg-neutral-100 px-2.5 py-0.5 rounded-full text-xs font-medium text-neutral-700">
          {property.type === "APARTMENT" ? "Apartment" : "Hotel"}
        </span>
      </div>

      {/* Image Gallery */}
      {isMobile ? (
        <div className="mb-8 md:mb-10 -mx-4">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {images.slice(0, 5).map((src, idx) => (
                <div key={idx} className="min-w-full relative aspect-[4/3]">
                  <SafeImage
                    src={src}
                    alt={`${property.title} image ${idx + 1}`}
                    containerClassName="h-full w-full"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center gap-1.5 mt-3">
            {images.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  idx === selectedIndex ? "w-6 bg-primary-600" : "w-1.5 bg-neutral-300"
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[420px] mb-10">
          <div className="col-span-2 row-span-2 relative bg-neutral-100">
            <SafeImage
              src={images[0]}
              alt={property.title}
              containerClassName="h-full w-full"
            />
          </div>
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="relative overflow-hidden bg-neutral-100">
              <SafeImage
                src={images[idx] || PLACEHOLDER}
                alt={`${property.title} view ${idx}`}
                containerClassName="h-full w-full"
                className="hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-10">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 mb-3">
              About this place
            </h2>
            <p className="text-neutral-600 leading-relaxed text-base">
              {property.description}
            </p>
          </div>

          {/* Location Map */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 mb-4">
              Where you&apos;ll be
            </h2>
            <div className="rounded-2xl overflow-hidden border border-neutral-200">
              <MapView
                lat={property.latitude}
                lng={property.longitude}
                address={property.address}
              />
            </div>
          </div>

          {property.amenities?.length > 0 && (
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-neutral-900 mb-4">
                What this place offers
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((a) => (
                  <div
                    key={a}
                    className="flex items-center gap-2.5 text-neutral-700 bg-neutral-50 rounded-xl px-3 py-2.5"
                  >
                    <Wifi className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                    <span className="text-sm">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {canReview && (
            <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">
                Write a review
              </h2>
              {reviewSuccess ? (
                <div className="bg-success-50 border border-success-200 text-success-700 text-sm px-4 py-3 rounded-xl">
                  Thank you for your review!
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-700 mb-2">
                      Your rating
                    </p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 rounded-sm p-0.5"
                          aria-label={`Rate ${star} stars`}
                        >
                          <Star
                            className={`w-7 h-7 transition-colors duration-150 ${
                              star <= reviewRating
                                ? "fill-primary-500 text-primary-500"
                                : "text-neutral-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Your experience (optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Share details of your stay..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 resize-none transition-all"
                    />
                  </div>
                  {reviewError && (
                    <p className="text-error-600 text-sm">{reviewError}</p>
                  )}
                  <Button
                    onClick={handleSubmitReview}
                    isLoading={reviewMutation.isPending}
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    Submit Review
                  </Button>
                </div>
              )}
            </div>
          )}

          {property.reviews && property.reviews.length > 0 && (
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-neutral-900 mb-5 flex items-center gap-2">
                <Star className="w-5 h-5 fill-primary-500 text-primary-500" aria-hidden="true" />
                {property.avgRating?.toFixed(1)} · {property.reviews.length} reviews
              </h2>
              <div className="space-y-5">
                {property.reviews.map((r) => (
                  <div
                    key={r.id}
                    className="border-b border-neutral-100 pb-5 last:border-0"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar name={r.userId ? `User ${r.userId.slice(0, 4)}` : "Guest"} size="md" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          {formatDate(r.createdAt)}
                        </p>
                        <StarRating rating={r.rating} size="sm" showValue={false} />
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-sm text-neutral-600 leading-relaxed">{r.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Booking widget */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-white border border-neutral-200 rounded-2xl shadow-md p-6">
            {!property.isActive ? (
              <div className="text-center py-4">
                <p className="text-sm font-semibold text-error-600 mb-2">
                  This property is currently unavailable
                </p>
                <p className="text-xs text-neutral-500">
                  Check back later or browse other properties.
                </p>
              </div>
            ) : user && user.id === property.hostId ? (
              <div className="text-center py-4">
                <p className="text-sm font-semibold text-neutral-700 mb-2">
                  This is your property
                </p>
                <p className="text-xs text-neutral-500">
                  You cannot book your own listing.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-2xl font-bold text-neutral-900">
                    {formatPrice(property.basePrice)}
                  </span>
                  <span className="text-neutral-500 text-sm mb-0.5">/ night</span>
                </div>

                <div className="border border-neutral-200 rounded-xl overflow-hidden mb-3">
                  <div className="grid grid-cols-2 divide-x divide-neutral-200">
                    <div className="p-3">
                      <label className="block text-xs font-bold uppercase text-neutral-800 mb-1 tracking-wider">
                        Check-in
                      </label>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="text-sm w-full outline-none cursor-pointer text-neutral-700 bg-transparent"
                        min={new Date().toLocaleDateString('en-CA')}
                      />
                    </div>
                    <div className="p-3">
                      <label className="block text-xs font-bold uppercase text-neutral-800 mb-1 tracking-wider">
                        Check-out
                      </label>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="text-sm w-full outline-none cursor-pointer text-neutral-700 bg-transparent"
                        min={checkIn || new Date().toLocaleDateString('en-CA')}
                      />
                    </div>
                  </div>
                </div>

                {bookingError && (
                  <p className="text-error-600 text-sm mb-3">{bookingError}</p>
                )}

                <Button
                  className="w-full py-3 text-base"
                  onClick={handleReserve}
                  isLoading={bookMutation.isPending}
                >
                  {user ? "Reserve" : "Log in to reserve"}
                </Button>

                {nights > 0 && (
                  <div className="mt-5 space-y-2 text-sm text-neutral-600">
                    <div className="flex justify-between">
                      <span>
                        {formatPrice(property.basePrice)} × {nights} nights
                      </span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="border-t border-neutral-200 pt-2 flex justify-between font-semibold text-neutral-900">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Message Host — pre-booking chat */}
            {user && user.id !== property.hostId && (
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <button
                  onClick={async () => {
                    try {
                      const { chatApi } = await import("@/lib/api");
                      const res = await chatApi.createSession(property.id);
                      router.push(`/chat/${res.data.sessionId}`);
                    } catch {
                      router.push("/chat");
                    }
                  }}
                  className="w-full text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl py-3 transition-colors"
                >
                  Message Host
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
