"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Home, Calendar } from "lucide-react";
import Link from "next/link";
import { bookingsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { formatDateRange } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ChatListPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings", "me"],
    queryFn: () => bookingsApi.listMe().then((r) => r.data),
    enabled: !!user,
  });

  // Derive chat sessions from confirmed bookings
  const sessions = bookings
    ?.filter((b) => b.status === "CONFIRMED")
    .map((b) => ({
      sessionId: b.id, // Use booking ID as session ID for MVP
      propertyTitle: b.property?.title || "Property",
      propertyAddress: b.property?.address || "",
      dates: formatDateRange(b.startDate, b.endDate),
    }));

  if (!user) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
      <p className="text-gray-500 mb-8">Chat with hosts about your bookings</p>

      {isLoading ? (
        <LoadingSpinner fullPage />
      ) : !sessions || sessions.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No conversations yet</h2>
          <p className="text-gray-500 text-sm mb-6">
            You can chat with hosts once you have a confirmed booking.
          </p>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 bg-[#FF385C] hover:bg-[#E31C5F] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            <Home className="w-4 h-4" /> Browse Properties
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <Link
              key={session.sessionId}
              href={`/chat/${session.sessionId}`}
              className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-card transition-shadow"
            >
              <div className="w-12 h-12 bg-[#FF385C]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-[#FF385C]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{session.propertyTitle}</h3>
                <p className="text-sm text-gray-500 truncate">{session.propertyAddress}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <Calendar className="w-3 h-3" />
                  {session.dates}
                </div>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
