"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth";

interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  content: string;
  createdAt: string;
  isHostSender?: boolean;
}

interface ChatContextValue {
  socket: Socket | null;
  isConnected: boolean;
  messages: ChatMessage[];
  sendMessage: (sessionId: string, content: string) => void;
  subscribe: (sessionId: string) => void;
  markAsRead: (sessionId: string, lastMessageId: string) => void;
  clearMessages: () => void;
  lastError: string | null;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextValue>({
  socket: null,
  isConnected: false,
  messages: [],
  sendMessage: () => {},
  subscribe: () => {},
  markAsRead: () => {},
  clearMessages: () => {},
  lastError: null,
  clearError: () => {},
});

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);

  const accessToken = useAuthStore((s) => s.accessToken);

  const clearError = useCallback(() => setLastError(null), []);

  useEffect(() => {
    if (!accessToken) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const socket = io(`${baseUrl}/chat`, {
      transports: ["websocket"],
      auth: { token: accessToken },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("new_message", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("read_receipt", () => {
      // Could update read status here if needed
    });

    socket.on("policy_violation", (data: { sessionId: string; message: string }) => {
      setLastError(data.message);
    });

    socket.on("exception", (data: { status: string; message: string }) => {
      setLastError(data.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken]);

  const sendMessage = useCallback((sessionId: string, content: string) => {
    if (socketRef.current) {
      socketRef.current.emit("send_message", { sessionId, content });
    }
  }, []);

  const subscribe = useCallback((sessionId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("subscribe", { sessionId });
    }
  }, []);

  const markAsRead = useCallback((sessionId: string, lastMessageId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("mark_as_read", { sessionId, lastMessageId });
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        messages,
        sendMessage,
        subscribe,
        markAsRead,
        clearMessages,
        lastError,
        clearError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
