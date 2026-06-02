"use client";

import { useEffect, useRef, useState } from "react";

import {
  Sparkles,
  Search,
  Loader2,
  X,
  ArrowRight,
  Clock,
  MapPin
} from "lucide-react";
import { aiApi } from "@/lib/api";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatPrice } from "@/lib/utils";
import type { Property, ConveraEvent } from "@/lib/types";

const SUGGESTIONS = [
  "Cozy apartment in Cairo with Wifi and AC",
  "Luxury hotel in Cairo with a pool under $120",
  "Any music events happening in Cairo?",
  "A quiet place under $70 per night"
];

const PROPERTY_PLACEHOLDER = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80";
const EVENT_PLACEHOLDER = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80";

export default function AiSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<{
    message: string;
    properties: Property[];
    events: ConveraEvent[];
  } | null>(null);


  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Listen to open CustomEvent
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-ai-search", handleOpen);
    return () => window.removeEventListener("open-ai-search", handleOpen);
  }, []);

  // Listen to keyboard shortcut (Cmd+K / Ctrl+K and ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleReset = () => {
    setQuery("");
    setResponse(null);
    setError("");
  };

  // Handle focus when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await aiApi.search(searchQuery);
      setResponse(res.data);
    } catch (err: unknown) {
      console.error(err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message ||
        "Failed to receive recommendations from Convera AI. Please ensure the backend is running and the Gemini API key is configured."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    executeSearch(suggestion);
  };

  // Convert simple markdown elements (bold, links) to safe HTML with styling
  const renderMarkdown = (text: string) => {
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-neutral-900">$1</strong>');
    html = html.replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-800 font-semibold underline decoration-2 decoration-primary-500/20 transition-colors">$1</a>'
    );
    html = html
      .split("\n\n")
      .map((p) => `<p class="mb-3.5 last:mb-0 text-neutral-600 leading-relaxed text-sm md:text-base">${p.replace(/\n/g, "<br/>")}</p>`)
      .join("");

    return { __html: html };
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-md flex items-start justify-center pt-[12vh] px-4">
      <div
        ref={modalRef}
        className="bg-white/90 backdrop-blur-2xl border border-neutral-200/50 rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.18)] w-full max-w-2xl overflow-hidden flex flex-col focus:outline-none transition-all scale-100 max-h-[75vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Search header */}
        <form onSubmit={handleSubmit} className="relative border-b border-neutral-100">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Convera AI..."
            className="w-full bg-transparent border-0 pl-14 pr-24 py-5 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-0 text-base"
            disabled={loading}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {query && !loading && (
              <button
                type="button"
                onClick={handleReset}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded-md hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-medium text-neutral-400 bg-neutral-100 border border-neutral-200/60 rounded px-1.5 py-0.5 select-none pointer-events-none">
              ESC
            </kbd>
          </div>
        </form>

        {/* Modal Content body */}
        <div className="overflow-y-auto p-6 max-h-[60vh] space-y-6 scrollbar-thin">
          {/* Default initial landing state */}
          {!loading && !response && !error && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-neutral-500 font-semibold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-primary-500 animate-pulse" />
                <span>Try asking Convera AI</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    className="text-left bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/40 rounded-2xl p-4 text-sm text-neutral-700 hover:text-neutral-900 font-medium transition-all group duration-200 flex items-start justify-between"
                  >
                    <span>{s}</span>
                    <ArrowRight className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Processing / Loading state */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-100 rounded-full animate-ping opacity-45" />
                <div className="relative bg-primary-50 p-4 rounded-full border border-primary-100">
                  <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
                </div>
              </div>
              <p className="text-sm font-semibold text-neutral-700 animate-pulse">
                Consulting Convera AI Concierge...
              </p>
              <p className="text-xs text-neutral-400">
                Searching real-time listings database with Gemini
              </p>
            </div>
          )}

          {/* AI Response Display */}
          {response && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="bg-primary-50 p-2 rounded-xl border border-primary-100 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                </div>
                <div
                  className="flex-1 min-w-0"
                  dangerouslySetInnerHTML={renderMarkdown(response.message)}
                />
              </div>

              {/* Recommended properties & events carousel */}
              {(response.properties?.length > 0 || response.events?.length > 0) && (
                <div className="space-y-3 pt-3 border-t border-neutral-100">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Recommended listings
                  </h4>
                  <div className="flex gap-4 overflow-x-auto pb-3 -mx-6 px-6 scrollbar-thin">
                    {/* Render Recommended Properties */}
                    {response.properties.map((p) => (
                      <a
                        key={p.id}
                        href={`/properties/${p.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-56 shrink-0 text-left bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200/50 hover:border-neutral-300 rounded-2xl overflow-hidden transition-all group flex flex-col"
                      >
                        <div className="relative aspect-[4/3] w-full bg-neutral-100">
                          <SafeImage
                            src={p.imageUrls?.[0] || PROPERTY_PLACEHOLDER}
                            alt={p.title}
                            containerClassName="w-full h-full"
                          />
                          <div className="absolute top-2 left-2">
                            <span className="bg-white/80 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 text-neutral-700 shadow-sm">
                              Property
                            </span>
                          </div>
                        </div>
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div>
                            <h5 className="font-semibold text-neutral-900 text-xs truncate group-hover:text-primary-600 transition-colors">
                              {p.title}
                            </h5>
                            <p className="text-[10px] text-neutral-500 truncate flex items-center gap-0.5 mt-0.5">
                              <MapPin className="w-2.5 h-2.5" />
                              <span>{p.address}</span>
                            </p>
                          </div>
                          <p className="text-xs font-bold text-neutral-900 mt-2">
                            {formatPrice(p.basePrice)} <span className="text-[10px] font-normal text-neutral-400">/ night</span>
                          </p>
                        </div>
                      </a>
                    ))}

                    {/* Render Recommended Events */}
                    {response.events.map((e) => (
                      <a
                        key={e.id}
                        href={`/events/${e.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-56 shrink-0 text-left bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200/50 hover:border-neutral-300 rounded-2xl overflow-hidden transition-all group flex flex-col"
                      >
                        <div className="relative aspect-[4/3] w-full bg-neutral-100">
                          <SafeImage
                            src={e.coverImage || EVENT_PLACEHOLDER}
                            alt={e.title}
                            containerClassName="w-full h-full"
                          />
                          <div className="absolute top-2 left-2">
                            <span className="bg-white/80 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 text-neutral-700 shadow-sm">
                              Event
                            </span>
                          </div>
                        </div>
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div>
                            <h5 className="font-semibold text-neutral-900 text-xs truncate group-hover:text-primary-600 transition-colors">
                              {e.title}
                            </h5>
                            <p className="text-[10px] text-neutral-500 truncate flex items-center gap-0.5 mt-0.5">
                              <MapPin className="w-2.5 h-2.5" />
                              <span>{e.address}</span>
                            </p>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-900">{formatPrice(e.price)}</span>
                            <span className="text-[9px] font-medium text-neutral-400 flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {new Date(e.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                            </span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Alert Display */}
          {error && (
            <div className="bg-error-50 border border-error-100 rounded-2xl p-4 flex gap-3 text-error-700 text-sm animate-fade-in">
              <div className="shrink-0 mt-0.5">
                <X className="w-4 h-4 text-error-600 bg-error-100 rounded-full p-0.5" />
              </div>
              <p className="leading-relaxed">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
