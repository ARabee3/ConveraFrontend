"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { MapPin, Search, Loader2, Crosshair, X, Navigation, AlertCircle } from "lucide-react";
import type { Map as LeafletMap, Marker } from "leaflet";

interface LocationResult {
  lat: number;
  lng: number;
  displayName: string;
}

interface LocationPickerProps {
  lat?: number;
  lng?: number;
  address?: string;
  onChange: (location: { lat: number; lng: number; address: string }) => void;
}

export default function LocationPicker({
  lat,
  lng,
  address = "",
  onChange,
}: LocationPickerProps) {
  const [query, setQuery] = useState(address);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [geoError, setGeoError] = useState("");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  /* ── helpers ── */
  const reverseGeocode = useCallback(async (latitude: number, longitude: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      return data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    } catch {
      return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    }
  }, []);

  const reverseGeocodeRef = useRef(reverseGeocode);
  reverseGeocodeRef.current = reverseGeocode;

  const searchNominatim = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    // Cancel previous request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setShowResults(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=6&addressdetails=1`,
        {
          headers: { "Accept-Language": "en" },
          signal: abortRef.current.signal,
        }
      );
      const data = await res.json();
      setResults(
        data.map((item: { lat: string; lon: string; display_name: string }) => ({
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          displayName: item.display_name,
        }))
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── debounced autocomplete ── */
  const handleQueryChange = (value: string) => {
    setGeoError("");
    setQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (value.trim().length === 0) {
      setResults([]);
      setShowResults(false);
      return;
    }

    if (value.trim().length < 2) {
      setResults([]);
      setShowResults(true); // show "Type at least 2 characters"
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchNominatim(value);
    }, 250);
  };

  /* ── initialise map (client-only) ── */
  useEffect(() => {
    if (!mapContainerRef.current || typeof window === "undefined") return;

    let map: LeafletMap | null = null;
    let marker: Marker | null = null;
    let cancelled = false;

    const init = async () => {
      const L = await import("leaflet");
      if (cancelled || !mapContainerRef.current) return;

      const defaultLat = lat ?? 30.0444;
      const defaultLng = lng ?? 31.2357;

      // Clean up any stale Leaflet state on the container (e.g. from Strict Mode unmount)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const container = mapContainerRef.current as any;
      if (container._leaflet_id) {
        delete container._leaflet_id;
      }

      map = L.map(mapContainerRef.current).setView([defaultLat, defaultLng], 13);

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

      marker = L.marker([defaultLat, defaultLng], { icon, draggable: true }).addTo(map);

      marker.on("dragend", async (e) => {
        const pos = e.target.getLatLng();
        const addr = await reverseGeocodeRef.current(pos.lat, pos.lng);
        setQuery(addr);
        onChangeRef.current({ lat: pos.lat, lng: pos.lng, address: addr });
      });

      map.on("click", async (e) => {
        const pos = e.latlng;
        marker!.setLatLng(pos);
        const addr = await reverseGeocodeRef.current(pos.lat, pos.lng);
        setQuery(addr);
        onChangeRef.current({ lat: pos.lat, lng: pos.lng, address: addr });
      });

      mapRef.current = map;
      markerRef.current = marker;
      setMapReady(true);

      const resizeObserver = new ResizeObserver(() => {
        if (!cancelled && map) {
          map.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current!);

      return () => {
        cancelled = true;
        resizeObserver.disconnect();
        map?.remove();
        mapRef.current = null;
        markerRef.current = null;
      };
    };

    const cleanup = init();

    return () => {
      cleanup.then(cleanupFn => cleanupFn && cleanupFn());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── sync marker when props change externally ── */
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || lat === undefined || lng === undefined) return;
    const current = markerRef.current.getLatLng();
    const threshold = 0.00005;
    if (Math.abs(current.lat - lat) > threshold || Math.abs(current.lng - lng) > threshold) {
      markerRef.current.setLatLng([lat, lng]);
      mapRef.current.setView([lat, lng], mapRef.current.getZoom());
    }
  }, [lat, lng]);

  /* ── actions ── */
  const selectResult = async (result: LocationResult) => {
    setQuery(result.displayName);
    setShowResults(false);
    setResults([]);

    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([result.lat, result.lng]);
      mapRef.current.setView([result.lat, result.lng], 15);
    }
    onChangeRef.current({
      lat: result.lat,
      lng: result.lng,
      address: result.displayName,
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    setGeoError("");
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const addr = await reverseGeocodeRef.current(latitude, longitude);
        setQuery(addr);
        setShowResults(false);
        if (mapRef.current && markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
          mapRef.current.setView([latitude, longitude], 16);
        }
        onChangeRef.current({ lat: latitude, lng: longitude, address: addr });
        // Warn only if accuracy is very poor (>5km), otherwise accept it silently
        if (accuracy > 5000) {
          setGeoError(`GPS accuracy is low (~${Math.round(accuracy / 1000)}km). You can drag the pin for more precision.`);
        }
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        if (err.code === 1) {
          setGeoError("Location permission denied. Please enable location access in your browser settings.");
        } else if (err.code === 2) {
          setGeoError("Unable to retrieve your location. Please try again or enter manually.");
        } else if (err.code === 3) {
          setGeoError("Location request timed out. Please try again.");
        } else {
          setGeoError("An error occurred while fetching your location.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    setGeoError("");
  };

  /* ── click outside to close dropdown ── */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".location-search-container")) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-3">
      {/* ── Search bar ── */}
      <div className="location-search-container relative">
        <label className="block text-sm font-medium text-gray-800 mb-1.5">Address</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => {
              if (query.trim().length >= 2) setShowResults(true);
            }}
            placeholder="Search for an address, city, or landmark..."
            className="w-full border border-gray-300 rounded-xl pl-10 pr-24 py-3 text-sm focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-opacity-10 transition-shadow"
          />

          {/* Inline actions */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={loading}
              className="p-1.5 text-neutral-500 hover:text-primary-600 rounded-md hover:bg-primary-50 transition-colors"
              title="Use my current location"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ── Autocomplete dropdown ── */}
        {showResults && (
          <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 max-h-72 overflow-y-auto">
            {query.trim().length < 2 ? (
              <div className="px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Type at least 2 characters to search
              </div>
            ) : loading ? (
              <div className="px-4 py-4 text-sm text-gray-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-4 text-sm text-gray-500 flex items-center gap-2">
                <Search className="w-4 h-4" />
                No results found for &quot;{query}&quot;
              </div>
            ) : (
              results.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectResult(r)}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 last:border-0 flex items-start gap-2 transition-colors"
                >
                  <Navigation className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{r.displayName}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Geo error ── */}
      {geoError && (
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{geoError}</span>
        </div>
      )}

      {/* ── Map ── */}
      <div className="relative">
        <div
          ref={mapContainerRef}
          className="h-72 w-full rounded-xl border border-neutral-200 bg-neutral-100 relative isolate z-0"
        />
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-xl">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        )}
        <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Click anywhere on the map or drag the pin to adjust the location
        </p>
      </div>

      {/* ── Coordinates readout ── */}
      {lat !== undefined && lng !== undefined && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Latitude</span>
            <p className="text-sm font-mono text-gray-900">{lat.toFixed(6)}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Longitude</span>
            <p className="text-sm font-mono text-gray-900">{lng.toFixed(6)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
