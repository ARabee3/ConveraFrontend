"use client";

import { useState, useCallback } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";

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

export default function LocationPicker({ lat, lng, address = "", onChange }: LocationPickerProps) {
  const [query, setQuery] = useState(address);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setShowResults(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await res.json();
      setResults(
        data.map((item: { lat: string; lon: string; display_name: string }) => ({
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          displayName: item.display_name,
        }))
      );
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const selectResult = (result: LocationResult) => {
    setQuery(result.displayName);
    setShowResults(false);
    onChange({
      lat: result.lat,
      lng: result.lng,
      address: result.displayName,
    });
  };

  const handleManualLat = (val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onChange({ lat: num, lng: lng || 0, address: query });
    }
  };

  const handleManualLng = (val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onChange({ lat: lat || 0, lng: num, address: query });
    }
  };

  return (
    <div className="space-y-3">
      {/* Address Search */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1.5">Address</label>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowResults(false); }}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), search())}
            placeholder="Search for an address..."
            className="w-full border border-gray-300 rounded-xl pl-10 pr-20 py-3 text-sm focus:outline-none focus:border-gray-900"
          />
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <button
            type="button"
            onClick={search}
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#FF385C] hover:bg-[#E31C5F] disabled:bg-gray-300 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
          </button>
        </div>

        {/* Search results */}
        {showResults && (
          <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10">
            {results.length === 0 && !loading ? (
              <p className="px-4 py-3 text-sm text-gray-500">No results found</p>
            ) : (
              results.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectResult(r)}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                >
                  {r.displayName}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Lat/Lng readout + manual override */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Latitude</label>
          <input
            type="number"
            step="any"
            value={lat ?? ""}
            onChange={(e) => handleManualLat(e.target.value)}
            placeholder="30.0444"
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Longitude</label>
          <input
            type="number"
            step="any"
            value={lng ?? ""}
            onChange={(e) => handleManualLng(e.target.value)}
            placeholder="31.2357"
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
          />
        </div>
      </div>

      {/* Map preview */}
      {lat !== undefined && lng !== undefined && (
        <div className="rounded-xl overflow-hidden border border-gray-200 aspect-[16/9] bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=14&size=600x300&markers=${lat},${lng},ol-marker`}
            alt="Location preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
