"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { getNotifications, markNotificationRead, deleteNotification } from "@/lib/api";

export type Notification = {
  _id: string;
  title: string;
  description: string;
  type: "info" | "success" | "message" | "warning";
  createdAt: string;
  unread: boolean;
};

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismiss: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const token = typeof window !== "undefined" ? localStorage.getItem("workstation-token") : null;

  useEffect(() => {
    if (token) {
      getNotifications(token)
        .then(data => setNotifications(data))
        .catch(err => console.error("Failed to fetch notifications", err));
    }
  }, [token]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, unread: false } : n));
    if (token) {
      await markNotificationRead(id, token).catch(console.error);
    }
  };

  const markAllAsRead = async () => {
    const unreadOnes = notifications.filter(n => n.unread);
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    if (token) {
      await Promise.all(unreadOnes.map(n => markNotificationRead(n._id, token))).catch(console.error);
    }
  };

  const dismiss = async (id: string) => {
    setNotifications(prev => prev.filter(n => n._id !== id));
    if (token) {
      await deleteNotification(id, token).catch(console.error);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, dismiss }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
}
