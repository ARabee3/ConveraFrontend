"use client";

import Link from "next/link";
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

  return (
    <Link href={`/events/${event.id}`} className={cn("block group", className)}>
      <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-gray-100 mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
        />
        {/* Date badge */}
        <div className="absolute top-3 left-3 bg-white rounded-xl px-2 py-1 text-center shadow-sm min-w-[44px]">
          <p className="text-[10px] font-bold text-[#FF385C] uppercase leading-none">
            {new Date(event.date).toLocaleString("en", { month: "short" })}
          </p>
          <p className="text-lg font-bold text-gray-900 leading-tight">
            {new Date(event.date).getDate()}
          </p>
        </div>
        {/* Sold out */}
        {event.isSoldOut && (
          <div className="absolute top-3 right-3 bg-gray-900 text-white text-xs font-semibold px-2 py-1 rounded-full">
            Sold Out
          </div>
        )}
        {/* Status */}
        {event.status === "CANCELLED" && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold bg-red-600 px-3 py-1 rounded-full">Cancelled</span>
          </div>
        )}
      </div>

      <div>
        <div className="mb-0.5">
          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {event.category?.name || "Event"}
          </span>
        </div>
        <h3 className="font-semibold text-gray-900 text-sm truncate mt-1">{event.title}</h3>
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{event.address}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
          <Calendar className="w-3 h-3 flex-shrink-0" />
          <span>{formatDate(event.date)}</span>
        </div>
        <p className="mt-1 text-sm">
          <span className="font-semibold text-gray-900">{formatPrice(event.price)}</span>
          <span className="text-gray-500"> / ticket</span>
        </p>
      </div>
    </Link>
  );
}
