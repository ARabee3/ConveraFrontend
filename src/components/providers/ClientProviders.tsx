"use client";

import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { ChatProvider } from "./ChatProvider";
import { ToastProvider } from "./ToastProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const initFromStorage = useAuthStore((s) => s.initFromStorage);

  useEffect(() => {
    // Re-read in case another tab changed storage while this tab was inactive
    initFromStorage();
  }, [initFromStorage]);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ChatProvider>
          {children}
        </ChatProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
