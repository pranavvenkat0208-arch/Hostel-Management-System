import { api } from './axios';
import type { AppNotification } from '../types';

export async function fetchNotifications() {
  const res = await api.get<{ notifications: AppNotification[]; unreadCount: number }>('/notifications');
  return res.data;
}

export async function markNotificationRead(id: string) {
  const res = await api.patch<{ notification: AppNotification }>(`/notifications/${id}/read`);
  return res.data.notification;
}

export async function markAllNotificationsRead() {
  await api.patch('/notifications/read-all');
}
