"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, CalendarDays } from "lucide-react";
import Link from "next/link";
import { chatApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

export default function ChatListPage() {
  const { user, hydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.push("/login");
  }, [user, hydrated, router]);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["chat-sessions"],
    queryFn: () => chatApi.listSessions().then((r) => r.data),
    enabled: !!user,
  });

  if (!hydrated || !user) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <Breadcrumb items={[{ label: "Messages" }]} className="mb-6" />

      <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-1">
        Messages
      </h1>
      <p className="text-neutral-500 mb-8">
        Chat with hosts about your bookings
      </p>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-5 animate-pulse h-20" />
          ))}
        </div>
      ) : !sessions || sessions.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-6 w-6" />}
          title="No conversations yet"
          description="Message a host from any property listing to start a conversation."
          action={{ label: "Browse Properties", onClick: () => router.push("/properties") }}
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <Link
              key={session.sessionId}
              href={`/chat/${session.sessionId}`}
              className="flex items-center gap-4 bg-white/60 backdrop-blur-xl border border-neutral-200/60 rounded-[1.5rem] p-5 hover:shadow-lg transition-all duration-300"
            >
              <div className="shrink-0">
                <Avatar name={session.propertyTitle} size="lg" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-900 truncate">
                  {session.propertyTitle}
                </h3>
                <p className="text-sm text-neutral-500 truncate">
                  {session.propertyAddress}
                </p>
                <div className="flex items-center gap-1 text-xs text-neutral-400 mt-1">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  {session.lastMessage || "No messages yet"}
                </div>
              </div>
              <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                session.hasUnread
                  ? "bg-error-500 ring-2 ring-error-100"
                  : "bg-neutral-200"
              }`} aria-hidden="true" aria-label={session.hasUnread ? "Unread messages" : "No new messages"} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
