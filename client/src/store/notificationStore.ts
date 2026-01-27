import { create } from "zustand";

type NotificationType = "success" | "error" | "info" | null;

interface NotificationState {
  message: string;
  type: NotificationType;
  setNotification: (type: NotificationType, message: string) => void;
  clearNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  message: "",
  type: null,
  setNotification: (type, message) => set({ type, message }),
  clearNotification: () => set({ type: null, message: "" }),
}));
