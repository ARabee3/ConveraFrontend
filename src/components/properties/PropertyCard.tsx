"use client";

import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { MapPin } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import StarRating from "@/components/ui/StarRating";
import type { Property } from "@/lib/types";

const PLACEHOLDER = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80";

interface PropertyCardProps {
  property: Property;
  className?: string;
}

export default function PropertyCard({ property, className }: PropertyCardProps) {
  const imgSrc = property.imageUrls?.[0] || PLACEHOLDER;

  return (
    <Link
      href={`/properties/${property.id}`}
      className={cn("block group", className)}
      aria-label={`${property.title}, ${property.address}`}
    >
      <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-neutral-100 mb-3">
        <SafeImage
          src={imgSrc}
          alt={property.title}
          containerClassName="h-full w-full"
          className="group-hover:scale-105 transition-transform duration-300 ease-out"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-white/95 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm text-neutral-700">
            {property.type === "APARTMENT" ? "Apartment" : "Hotel"}
          </span>
        </div>
        {!property.isActive && (
          <div className="absolute inset-0 bg-neutral-900/50 flex items-center justify-center backdrop-blur-[2px]">
            <span className="text-white font-semibold text-sm bg-neutral-900/70 px-3 py-1.5 rounded-full">
              Unavailable
            </span>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-xs text-neutral-500 mb-1">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{property.address}</span>
            </div>
            <h3 className="font-semibold text-neutral-900 text-sm truncate leading-snug">
              {property.title}
            </h3>
          </div>
          {property.avgRating !== undefined && property.avgRating > 0 && (
            <div className="shrink-0 pt-0.5">
              <StarRating rating={property.avgRating} size="sm" />
            </div>
          )}
        </div>
        <p className="mt-1.5 text-sm text-neutral-700">
          <span className="font-semibold text-neutral-900">{formatPrice(property.basePrice)}</span>
          <span className="text-neutral-500 font-normal"> / night</span>
        </p>
      </div>
    </Link>
  );
}
