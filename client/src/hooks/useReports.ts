import { useQuery } from '@tanstack/react-query';
import * as reportsApi from '../api/reports';

export function useRevenueReport() {
  return useQuery({
    queryKey: ['reports', 'revenue'],
    queryFn: reportsApi.fetchRevenueReport,
  });
}

export function useOccupancyReport() {
  return useQuery({
    queryKey: ['reports', 'occupancy'],
    queryFn: reportsApi.fetchOccupancyReport,
  });
}

export function useExpenseReport() {
  return useQuery({
    queryKey: ['reports', 'expenses'],
    queryFn: reportsApi.fetchExpenseReport,
  });
}
