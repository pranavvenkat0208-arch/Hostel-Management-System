import { api } from './axios';
import type { Room, RoomType } from '../types';

export interface RoomInput {
  roomNumber: string;
  type: RoomType;
  floor?: number;
  capacity: number;
  monthlyRent: number;
  amenities?: string[];
  notes?: string;
}

export interface RoomUpdateInput extends Partial<RoomInput> {
  underMaintenance?: boolean;
}

export interface OccupancySummary {
  totalRooms: number;
  totalCapacity: number;
  totalOccupied: number;
  occupancyRate: number;
  underMaintenance: number;
  byType: { type: string; rooms: number; capacity: number; occupied: number }[];
}

export async function fetchRooms(params?: { type?: string; availability?: string; search?: string }) {
  const res = await api.get<{ rooms: Room[] }>('/rooms', { params });
  return res.data.rooms;
}

export async function fetchOccupancySummary() {
  const res = await api.get<{ summary: OccupancySummary }>('/rooms/occupancy-summary');
  return res.data.summary;
}

export async function createRoom(input: RoomInput) {
  const res = await api.post<{ room: Room }>('/rooms', input);
  return res.data.room;
}

export async function updateRoom(id: string, input: RoomUpdateInput) {
  const res = await api.patch<{ room: Room }>(`/rooms/${id}`, input);
  return res.data.room;
}

export async function deleteRoom(id: string) {
  await api.delete(`/rooms/${id}`);
}
