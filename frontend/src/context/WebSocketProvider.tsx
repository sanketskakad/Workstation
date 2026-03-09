"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { connectWebSocket } from "@/lib/websocket";

interface WebSocketContextValue {
  events: Array<{ type: string; payload: unknown }>;
  readyState: number;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  events: [],
  readyState: 0,
});

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [events, setEvents] = useState<WebSocketContextValue["events"]>([]);
  const [readyState, setReadyState] = useState<number>(0);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("workstation-token")
        : null;
    const socket = connectWebSocket(token ?? undefined);

    socket.addEventListener("open", () => setReadyState(socket.readyState));
    socket.addEventListener("close", () => setReadyState(socket.readyState));
    socket.addEventListener("message", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        setEvents((current) => [data, ...current].slice(0, 20));
      } catch {
        // ignore invalid websocket payloads
      }
    });

    return () => {
      socket.close();
    };
  }, []);

  const value = useMemo(
    () => ({
      events,
      readyState,
    }),
    [events, readyState],
  );

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}
