import { api } from './axios';
import type { Expense, ExpenseCategory } from '../types';

export interface CreateExpenseInput {
  category: ExpenseCategory;
  amount: number;
  date?: string;
  description?: string;
}

export async function fetchExpenses(params?: { category?: ExpenseCategory }) {
  const res = await api.get<{ expenses: Expense[] }>('/expenses', { params });
  return res.data.expenses;
}

export async function createExpense(input: CreateExpenseInput) {
  const res = await api.post<{ expense: Expense }>('/expenses', input);
  return res.data.expense;
}

export async function deleteExpense(id: string) {
  await api.delete(`/expenses/${id}`);
}
