"use client";

import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { MapPin, Calendar } from "lucide-react";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import type { ConveraEvent } from "@/lib/types";

const PLACEHOLDER = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80";

interface EventCardProps {
  event: ConveraEvent;
  className?: string;
}

export default function EventCard({ event, className }: EventCardProps) {
  const imgSrc = event.coverImage || PLACEHOLDER;
  const eventDate = new Date(event.date);

  return (
    <Link
      href={`/events/${event.id}`}
      className={cn("block group", className)}
      aria-label={`${event.title} on ${formatDate(event.date)}`}
    >
      <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-neutral-100 mb-3">
        <SafeImage
          src={imgSrc}
          alt={event.title}
          containerClassName="h-full w-full"
          className="group-hover:scale-105 transition-transform duration-300 ease-out"
        />
        {/* Date badge */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl px-2.5 py-1.5 text-center shadow-sm min-w-[48px]">
          <p className="text-xs font-bold text-primary-600 uppercase leading-none">
            {eventDate.toLocaleString("en", { month: "short" })}
          </p>
          <p className="text-lg font-bold text-neutral-900 leading-tight mt-0.5">
            {eventDate.getDate()}
          </p>
        </div>
        {/* Sold out */}
        {event.isSoldOut && (
          <div className="absolute top-3 right-3 bg-neutral-900 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Sold Out
          </div>
        )}
        {/* Status */}
        {event.status === "CANCELLED" && (
          <div className="absolute inset-0 bg-neutral-900/50 flex items-center justify-center backdrop-blur-[2px]">
            <span className="text-white font-semibold bg-error-600 px-3 py-1.5 rounded-full">
              Cancelled
            </span>
          </div>
        )}
      </div>

      <div>
        <div className="mb-1">
          <span className="text-xs font-medium bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
            {event.category?.name || "Event"}
          </span>
        </div>
        <h3 className="font-semibold text-neutral-900 text-sm truncate mt-1.5 leading-snug">
          {event.title}
        </h3>
        <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="truncate">{event.address}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
          <Calendar className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>{formatDate(event.date)}</span>
        </div>
        <p className="mt-1.5 text-sm text-neutral-700">
          <span className="font-semibold text-neutral-900">{formatPrice(event.price)}</span>
          <span className="text-neutral-500"> / ticket</span>
        </p>
      </div>
    </Link>
  );
}
