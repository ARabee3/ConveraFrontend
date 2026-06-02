"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  // Start undefined to avoid hydration mismatch — server and client both get undefined
  // After mount, the real value is computed
  const [matches, setMatches] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  // Return false during SSR and first render (both server and client agree)
  // After mount, the correct value is returned
  return matches ?? false;
}
