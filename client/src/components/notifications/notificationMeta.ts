import { DoorOpen, Wrench, Receipt, Bell, Building2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { NotificationType } from '../../types';

// Icons/colors per notification type, used by the bell and the notifications page.
export const notificationIcon: Record<NotificationType, LucideIcon> = {
  allocation: DoorOpen,
  maintenance: Wrench,
  invoice: Receipt,
  system: Bell,
  room: Building2,
};

export const notificationAccent: Record<NotificationType, string> = {
  allocation: 'bg-blue-50 text-blue-600',
  maintenance: 'bg-amber-50 text-amber-600',
  invoice: 'bg-emerald-50 text-emerald-600',
  system: 'bg-slate-100 text-slate-600',
  room: 'bg-cyan-50 text-cyan-600',
};

export function timeAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString();
}
