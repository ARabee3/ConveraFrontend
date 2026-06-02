"use client";

import { Sparkles } from "lucide-react";

export default function AiSearchTrigger() {
  const triggerSearch = () => {
    window.dispatchEvent(new CustomEvent("open-ai-search"));
  };

  return (
    <button
      type="button"
      onClick={triggerSearch}
      className="fixed bottom-6 right-6 z-40 bg-gradient-to-tr from-primary-600 to-violet-600 hover:from-primary-700 hover:to-violet-700 text-white rounded-full p-4 shadow-[0_8px_30px_rgb(79,70,229,0.35)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.5)] border border-white/20 transition-all hover:-translate-y-1 hover:scale-105 duration-200 group flex items-center gap-2"
      aria-label="Ask Convera AI"
      title="Ask Convera AI (Cmd+K)"
    >
      <Sparkles className="w-5 h-5 animate-pulse" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out font-bold text-sm tracking-wide">
        Ask AI
      </span>
    </button>
  );
}
