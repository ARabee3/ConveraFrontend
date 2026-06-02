"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import type { Map as LeafletMap } from "leaflet";

interface MapViewProps {
  lat: number;
  lng: number;
  address?: string;
  zoom?: number;
  height?: string;
}

export default function MapView({ lat, lng, address, zoom = 14, height = "h-80" }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || typeof window === "undefined") return;

    let cancelled = false;
    let map: LeafletMap | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const init = async () => {
      // Ensure Leaflet CSS is loaded (fallback if @import in globals.css is stripped)
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
        // Wait a tick for the stylesheet to load
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const L = await import("leaflet");
      if (cancelled || !mapContainerRef.current) return;

      // Reset the container completely to avoid "Map container is being reused"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const container = mapContainerRef.current as any;
      if (container._leaflet_id) {
        delete container._leaflet_id;
        container.innerHTML = "";
      }

      map = L.map(mapContainerRef.current).setView([lat, lng], zoom);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
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

      const marker = L.marker([lat, lng], { icon }).addTo(map);
      if (address) {
        marker.bindPopup(address).openPopup();
      }

      // Check again after all synchronous work — if cleanup was called during
      // our await, destroy immediately and don't update state
      if (cancelled) {
        map.remove();
        map = null;
        return;
      }

      setMapReady(true);

      // Force a tile refresh after layout settles — fixes partial tile rendering
      setTimeout(() => {
        if (!cancelled && map) {
          map.invalidateSize();
        }
      }, 200);

      resizeObserver = new ResizeObserver(() => {
        if (!cancelled && map) {
          map.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current!);
    };

    const containerEl = mapContainerRef.current;

    setMapReady(false);
    init();

    // SYNCHRONOUS cleanup — sets cancelled flag immediately so async init() can bail out
    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      if (map) {
        map.remove();
        map = null;
      }
      // Also clear container in case map was never assigned (init still pending)
      if (containerEl) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const container = containerEl as any;
        if (container._leaflet_id) {
          delete container._leaflet_id;
          container.innerHTML = "";
        }
      }
    };
  }, [lat, lng, zoom, address]);

  return (
    <div className="space-y-2">
      <div className={`relative ${height} w-full rounded-2xl border border-neutral-200 bg-neutral-100 overflow-hidden isolate z-0`}>
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
          <MapPin className="w-4 h-4 text-primary-600" />
          <span>{address}</span>
        </div>
      )}
    </div>
  );
}
