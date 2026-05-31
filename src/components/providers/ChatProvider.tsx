"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface ChatContextValue {
  socket: Socket | null;
  isConnected: boolean;
  messages: ChatMessage[];
  sendMessage: (sessionId: string, content: string) => void;
  subscribe: (sessionId: string) => void;
  markAsRead: (sessionId: string, lastMessageId: string) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextValue>({
  socket: null,
  isConnected: false,
  messages: [],
  sendMessage: () => {},
  subscribe: () => {},
  markAsRead: () => {},
  clearMessages: () => {},
});

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("convera_access_token");
    if (!token) return;

    const socket = io("http://localhost:3000/chat", {
      transports: ["websocket"],
      auth: { token },
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

    socket.on("read_receipt", (data: { sessionId: string; lastReadMessageId: string; readerId: string }) => {
      // Could update read status here if needed
    });

    socket.on("policy_violation", (data: { sessionId: string; message: string }) => {
      console.warn("Policy violation:", data.message);
    });

    socket.on("exception", (data: { status: string; message: string }) => {
      console.error("Socket error:", data.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
