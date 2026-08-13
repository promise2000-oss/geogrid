import { notifications, notificationPreferences } from "@/lib/mock/db";
import { latency } from "@/lib/mock/latency";
import type { AppNotification, NotificationCategory, NotificationPreference } from "@/lib/types";

export async function listNotifications(userId: string, filter?: NotificationCategory | "all"): Promise<AppNotification[]> {
  await latency();
  return notifications
    .filter((n) => n.userId === userId && (filter === undefined || filter === "all" || n.type === filter))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function unreadCount(userId: string): Promise<number> {
  await latency(40);
  return notifications.filter((n) => n.userId === userId && !n.readAt).length;
}

export async function markRead(userId: string, id: string): Promise<void> {
  await latency(60);
  const n = notifications.find((x) => x.id === id && x.userId === userId);
  if (n && !n.readAt) n.readAt = new Date().toISOString();
}

export async function markAllRead(userId: string): Promise<void> {
  await latency(120);
  notifications.forEach((n) => {
    if (n.userId === userId && !n.readAt) n.readAt = new Date().toISOString();
  });
}

export async function getPreferences(userId: string): Promise<NotificationPreference[]> {
  await latency();
  return notificationPreferences.filter((p) => p.userId === userId);
}

export async function updatePreference(
  userId: string,
  category: NotificationCategory,
  channel: "inApp" | "email" | "whatsapp",
  enabled: boolean,
): Promise<NotificationPreference[]> {
  await latency(150);
  let pref = notificationPreferences.find((p) => p.userId === userId && p.category === category);
  if (!pref) {
    pref = { userId, category, inApp: true, email: true, whatsapp: true };
    notificationPreferences.push(pref);
  }
  pref[channel] = enabled;
  return notificationPreferences.filter((p) => p.userId === userId);
}