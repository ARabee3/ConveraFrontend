"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MapPin, Calendar, Users, Clock } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import useEmblaCarousel from "embla-carousel-react";
import { eventsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { formatPrice, formatDate } from "@/lib/utils";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import MapView from "@/components/ui/MapView";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useToast } from "@/hooks/use-toast";

const PLACEHOLDER = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [bookingError, setBookingError] = useState("");
  const [emblaRef] = useEmblaCarousel({ loop: true });

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => eventsApi.get(id).then((r) => r.data),
    enabled: !!id,
  });

  const ticketMutation = useMutation({
    mutationFn: () => {
      if (!event) throw new Error("No event");
      return eventsApi.register(id);
    },
    onSuccess: () => {
      toast({
        title: "Ticket Purchased Successfully!",
        description: "You have registered for this event.",
        variant: "success",
      });
      router.push("/events");
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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-6 w-40 mb-6" />
        <Skeleton className="aspect-[21/9] rounded-2xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <SkeletonText lines={4} />
            <Skeleton className="aspect-video rounded-2xl" />
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={<MapPin className="h-6 w-6" />}
          title="Event not found"
          description="The event you are looking for does not exist or has been removed."
          action={{ label: "Browse events", onClick: () => router.push("/events") }}
        />
      </div>
    );
  }

  const capacityPct = Math.round(
    ((event.maxCapacity - event.remainingSpots) / event.maxCapacity) * 100
  );

  const galleryImages = event.galleryImages
    ? [...event.galleryImages].sort((a, b) => a.displayOrder - b.displayOrder)
    : [];

  return (
    <div>
      {/* Cover image with gradient overlay */}
      <div className="relative w-full h-[45vh] md:h-[50vh] bg-neutral-200">
        <SafeImage
          src={event.coverImage || PLACEHOLDER}
          alt={event.title}
          containerClassName="h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-neutral-950/20 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8">
            <Breadcrumb
              items={[
                { label: "Events", href: "/events" },
                { label: event.title },
              ]}
              className="mb-4 text-white/70 [&_a]:text-white/80 [&_a]:hover:text-white [&_span]:text-white"
            />
            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 inline-block">
              {event.category?.name}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                {formatDate(event.date)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {event.address}
              </span>
              {event.status === "CANCELLED" && (
                <span className="bg-error-600 text-white px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  Cancelled
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-neutral-900 mb-3">
                About this event
              </h2>
              <p className="text-neutral-600 leading-relaxed text-base">
                {event.description}
              </p>
            </div>

            {/* Location Map */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-neutral-900 mb-4">
                Location
              </h2>
              <div className="rounded-2xl overflow-hidden border border-neutral-200">
                <MapView
                  lat={event.locationLat}
                  lng={event.locationLng}
                  address={event.address}
                />
              </div>
            </div>

            {/* Capacity */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-neutral-900 mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                Capacity
              </h2>
              <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
                <div className="flex justify-between text-sm text-neutral-600 mb-2">
                  <span>{event.maxCapacity - event.remainingSpots} attending</span>
                  <span>{event.remainingSpots} spots left</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${capacityPct}%` }}
                  />
                </div>
                <p className="text-xs text-neutral-400 mt-1.5">
                  {capacityPct}% filled · {event.maxCapacity} total capacity
                </p>
              </div>
            </div>

            {/* Eligibility */}
            {event.eligibility && (
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-neutral-900 mb-3">
                  Eligibility
                </h2>
                <div className="bg-neutral-50 rounded-2xl p-5 space-y-3 border border-neutral-100">
                  {event.eligibility.minAge && (
                    <div className="flex items-center gap-2 text-sm text-neutral-700">
                      <span className="font-medium">Minimum age:</span>{" "}
                      {event.eligibility.minAge}+
                    </div>
                  )}
                  {event.eligibility.ticketTypes?.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-neutral-700">
                        Ticket types:
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {event.eligibility.ticketTypes.map((t) => (
                          <span
                            key={t}
                            className="bg-white border border-neutral-200 text-xs px-2.5 py-1 rounded-full text-neutral-600"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {event.eligibility.specialRequirements && (
                    <div className="flex items-start gap-2 text-sm text-neutral-700">
                      <span className="font-medium">Requirements:</span>
                      <span>{event.eligibility.specialRequirements}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Gallery */}
            {galleryImages.length > 0 && (
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-neutral-900 mb-4">
                  Gallery
                </h2>
                {isMobile ? (
                  <div className="overflow-hidden -mx-4" ref={emblaRef}>
                    <div className="flex">
                      {galleryImages.map((img) => (
                        <div
                          key={img.id}
                          className="min-w-[80%] pl-4 relative aspect-square"
                        >
                          <SafeImage
                            src={img.imageUrl}
                            alt={`${event.title} gallery image`}
                            containerClassName="h-full w-full rounded-2xl"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {galleryImages.map((img) => (
                      <div
                        key={img.id}
                        className="rounded-xl overflow-hidden aspect-square bg-neutral-100 relative"
                      >
                        <SafeImage
                          src={img.imageUrl}
                          alt={`${event.title} gallery image`}
                          containerClassName="h-full w-full"
                          className="hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Ticket widget */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white border border-neutral-200 rounded-2xl shadow-md p-6">
              <div className="flex items-end gap-1 mb-1">
                <span className="text-2xl font-bold text-neutral-900">
                  {formatPrice(event.price)}
                </span>
                <span className="text-neutral-500 text-sm mb-0.5">/ ticket</span>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-neutral-500 mb-6">
                <Clock className="h-4 w-4" aria-hidden="true" />
                {formatDate(event.date)}
              </div>

              {event.isSoldOut ? (
                <div className="bg-neutral-100 text-neutral-500 text-center py-3 rounded-xl font-semibold">
                  Sold Out
                </div>
              ) : event.status === "CANCELLED" ? (
                <div className="bg-error-50 text-error-700 text-center py-3 rounded-xl font-semibold border border-error-100">
                  Event Cancelled
                </div>
              ) : (
                <>
                  {bookingError && (
                    <p className="text-error-600 text-sm mb-3">{bookingError}</p>
                  )}
                  <Button
                    className="w-full py-3 text-base"
                    onClick={handleBuyTicket}
                    isLoading={ticketMutation.isPending}
                  >
                    {user ? "Get Ticket" : "Log in to get ticket"}
                  </Button>
                  <p className="text-xs text-neutral-400 text-center mt-3">
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
