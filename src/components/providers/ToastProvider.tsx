"use client";

import {
  ToastProvider as RadixToastProvider,
  ToastViewport,
} from "@/components/ui/Toast";
import { Toast } from "@/components/ui/Toast";
import { useToast, ToastContextProvider } from "@/hooks/use-toast";

function ToastRenderer() {
  const { toasts, dismiss } = useToast();

  return (
    <>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          id={t.id}
          title={t.title}
          description={t.description}
          variant={t.variant}
          duration={t.duration}
          onDismiss={dismiss}
        />
      ))}
      <ToastViewport />
    </>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastContextProvider>
      <RadixToastProvider swipeDirection="right">
        {children}
        <ToastRenderer />
      </RadixToastProvider>
    </ToastContextProvider>
  );
}
