"use client";

import Link from "next/link";
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
    <Link href={`/properties/${property.id}`} className={cn("block group", className)}>
      <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-gray-100 mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
        />
        <div className="absolute top-3 left-3">
          <span className="bg-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm text-gray-700">
            {property.type === "APARTMENT" ? "Apartment" : "Hotel"}
          </span>
        </div>
        {!property.isActive && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">Unavailable</span>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-0.5">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{property.address}</span>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm truncate">{property.title}</h3>
          </div>
          {property.avgRating !== undefined && property.avgRating > 0 && (
            <div className="flex-shrink-0">
              <StarRating rating={property.avgRating} size="sm" />
            </div>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-900">
          <span className="font-semibold">{formatPrice(property.basePrice)}</span>
          <span className="text-gray-500 font-normal"> / night</span>
        </p>
      </div>
    </Link>
  );
}
