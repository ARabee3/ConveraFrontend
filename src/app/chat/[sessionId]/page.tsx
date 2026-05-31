"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Send, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useChat } from "@/components/providers/ChatProvider";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";

interface ChatMessagePayload {
  id: string;
  sessionId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export default function ChatThreadPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { messages: liveMessages, sendMessage, subscribe, isConnected, clearMessages } = useChat();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  // Fetch history
  const { data: historyData, isLoading } = useQuery({
    queryKey: ["chat-history", sessionId],
    queryFn: () => api.get<{ data: ChatMessagePayload[] }>(`/chat/${sessionId}/history`).then((r) => r.data),
    enabled: !!sessionId && !!user,
  });

  const historyMessages = historyData?.data || [];

  // Subscribe to room on mount
  useEffect(() => {
    if (sessionId && isConnected) {
      subscribe(sessionId);
      clearMessages();
    }
  }, [sessionId, isConnected, subscribe, clearMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [historyMessages, liveMessages]);

  const allMessages = [...historyMessages, ...liveMessages.filter(
    (m) => !historyMessages.some((h) => h.id === m.id)
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
    setInput("");
  };

  if (!user) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
        <Link href="/chat" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="w-10 h-10 bg-[#FF385C]/10 rounded-full flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-[#FF385C]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Chat</h1>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-xs text-gray-500">{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {isLoading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : allMessages.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation</p>
          </div>
        ) : (
          allMessages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                    isMe
                      ? "bg-[#FF385C] text-white rounded-br-md"
                      : "bg-gray-100 text-gray-900 rounded-bl-md"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? "text-white/70" : "text-gray-400"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="mt-4 pt-4 border-t border-gray-100">
        {error && (
          <p className="text-red-500 text-xs mb-2">{error}</p>
        )}
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-gray-900"
            disabled={!isConnected}
          />
          <Button
            type="submit"
            disabled={!input.trim() || !isConnected}
            className="rounded-full px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
