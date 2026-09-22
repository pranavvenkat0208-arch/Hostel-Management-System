import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as expensesApi from '../api/expenses';
import type { CreateExpenseInput } from '../api/expenses';
import type { ExpenseCategory } from '../types';

export function useExpenses(params?: { category?: ExpenseCategory }) {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => expensesApi.fetchExpenses(params),
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExpenseInput) => expensesApi.createExpense(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesApi.deleteExpense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
