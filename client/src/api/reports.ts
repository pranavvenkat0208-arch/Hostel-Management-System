import { api } from './axios';
import type { RevenueReport, OccupancyReport } from '../types';

export async function fetchRevenueReport() {
  const res = await api.get<{ report: RevenueReport }>('/reports/revenue');
  return res.data.report;
}

export async function fetchOccupancyReport() {
  const res = await api.get<{ report: OccupancyReport }>('/reports/occupancy');
  return res.data.report;
}
