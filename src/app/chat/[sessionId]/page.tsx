"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Send, MessageSquare, X } from "lucide-react";
import Link from "next/link";
import { useChat } from "@/components/providers/ChatProvider";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";

interface ChatMessagePayload {
  id: string;
  sessionId: string;
  senderId: string;
  content: string;
  createdAt: string;
  isHostSender?: boolean;
}

export default function ChatThreadPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { messages: liveMessages, sendMessage, subscribe, isConnected, clearMessages, lastError, clearError } = useChat();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const hasSentMessageRef = useRef(false);

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  // Fetch history
  const { data: historyData, isLoading } = useQuery({
    queryKey: ["chat-history", sessionId],
    queryFn: () => api.get<{ data: ChatMessagePayload[] }>(`/chat/${sessionId}/history`).then((r) => r.data),
    enabled: !!sessionId && !!user,
  });

  const historyMessages = useMemo(() => historyData?.data || [], [historyData?.data]);

  // Subscribe to room on mount
  useEffect(() => {
    if (sessionId && isConnected) {
      subscribe(sessionId);
      clearMessages();
    }
  }, [sessionId, isConnected, subscribe, clearMessages]);

  // Auto-scroll to bottom only when user is near bottom or just sent a message
  useEffect(() => {
    if (!bottomRef.current) return;
    if (isNearBottomRef.current || hasSentMessageRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
      hasSentMessageRef.current = false;
    }
  }, [historyMessages, liveMessages]);

  // Track scroll position
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    isNearBottomRef.current = distanceFromBottom < 150;
  }, []);

  const allMessages = [...historyMessages, ...liveMessages.filter(
    (m) => m.sessionId === sessionId && !historyMessages.some((h) => h.id === m.id)
  )];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!isConnected) {
      setError("Not connected to chat server.");
      return;
    }
    setError("");
    sendMessage(sessionId, input.trim());
    hasSentMessageRef.current = true;
    setInput("");
  };

  if (!user) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-100">
        <Link
          href="/chat"
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          aria-label="Back to messages"
        >
          <ChevronLeft className="h-5 w-5 text-neutral-600" />
        </Link>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <MessageSquare className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">Chat</h1>
          <div className="flex items-center gap-1.5">
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-success-500" : "bg-error-500"
              }`}
              aria-hidden="true"
            />
            <span className="text-xs text-neutral-500">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto space-y-4 pr-2">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : allMessages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-neutral-300" aria-hidden="true" />
            <p className="text-neutral-500 font-medium">No messages yet</p>
            <p className="text-sm text-neutral-400">Start the conversation</p>
          </div>
        ) : (
          allMessages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div className="flex items-end gap-2 max-w-[80%]">
                  {!isMe && (
                    <Avatar
                      name={msg.isHostSender ? "Host" : "Guest"}
                      size="sm"
                      className="mb-1"
                    />
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      isMe
                        ? "bg-primary-600 text-white rounded-br-md"
                        : "bg-neutral-100 text-neutral-900 rounded-bl-md"
                    }`}
                  >
                    <p className="leading-relaxed">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isMe ? "text-white/70" : "text-neutral-400"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="mt-4 pt-4 border-t border-neutral-100">
        {lastError && (
          <div className="flex items-center gap-2 bg-error-50 border border-error-200 text-error-700 text-sm px-3 py-2 rounded-lg mb-2">
            <span className="flex-1">{lastError}</span>
            <button
              onClick={clearError}
              className="p-0.5 hover:bg-error-100 rounded transition-colors"
              aria-label="Dismiss error"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {error && (
          <p className="text-error-600 text-xs mb-2">{error}</p>
        )}
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-neutral-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all bg-white"
            disabled={!isConnected}
            aria-label="Message input"
          />
          <Button
            type="submit"
            disabled={!input.trim() || !isConnected}
            className="rounded-full px-4"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
