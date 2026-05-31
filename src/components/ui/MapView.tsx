"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import type { Map as LeafletMap, Marker } from "leaflet";

interface MapViewProps {
  lat: number;
  lng: number;
  address?: string;
  zoom?: number;
  height?: string;
}

export default function MapView({ lat, lng, address, zoom = 14, height = "h-80" }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || typeof window === "undefined") return;

    let map: LeafletMap | null = null;
    let marker: Marker | null = null;
    let cancelled = false;

    const init = async () => {
      const linkId = "leaflet-css-detail";
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const L = await import("leaflet");
      if (cancelled) return;

      map = L.map(mapContainerRef.current!).setView([lat, lng], zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      marker = L.marker([lat, lng], { icon }).addTo(map);
      if (address) {
        marker.bindPopup(address).openPopup();
      }

      mapRef.current = map;
      markerRef.current = marker;
      setMapReady(true);
    };

    init();

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [lat, lng, zoom, address]);

  return (
    <div className="space-y-2">
      <div className={`relative ${height} w-full rounded-2xl border border-gray-200 bg-gray-100 overflow-hidden`}>
        <div ref={mapContainerRef} className="w-full h-full" />
        {!mapReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin mb-2" />
            <span className="text-sm text-gray-500">Loading map...</span>
          </div>
        )}
      </div>
      {address && (
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <MapPin className="w-4 h-4 text-[#FF385C]" />
          <span>{address}</span>
        </div>
      )}
    </div>
  );
}
