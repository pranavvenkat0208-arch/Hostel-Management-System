import { useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useExpenses, useCreateExpense, useDeleteExpense } from '../../hooks/useExpenses';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { getErrorMessage } from '../../lib/utils';
import { EXPENSE_CATEGORIES } from '../../types';
import type { ExpenseCategory } from '../../types';

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  electricity: 'Electricity',
  water: 'Water',
  staff_salaries: 'Staff salaries',
  repairs_maintenance: 'Repairs & maintenance',
  supplies: 'Supplies',
  other: 'Other',
};

export function ExpensesPage() {
  const { data: expenses, isLoading } = useExpenses();
  const createExpense = useCreateExpense();
  const deleteExpense = useDeleteExpense();
  const role = useAuthStore((s) => s.user?.role);

  const [category, setCategory] = useState<ExpenseCategory>('electricity');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createExpense.mutate(
      { category, amount: Number(amount), date: date || undefined, description },
      {
        onSuccess: () => {
          setAmount('');
          setDate('');
          setDescription('');
        },
      }
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Expenses</h1>
        <p className="text-sm text-slate-500">Log hostel operating costs. These feed the net revenue figure on Reports.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log an expense</CardTitle>
          <CardDescription>Electricity, water, salaries, repairs, supplies, or anything else.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select id="category" value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input id="amount" type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Note</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="sm:col-span-4">
              {createExpense.isError && (
                <p className="mb-2 text-sm text-red-600">{getErrorMessage(createExpense.error)}</p>
              )}
              <Button type="submit" variant="primary" disabled={createExpense.isPending}>
                <Plus className="h-4 w-4" /> {createExpense.isPending ? 'Adding…' : 'Add expense'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-10">
              <Spinner />
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Note</th>
                  <th className="px-5 py-3">Recorded by</th>
                  {role === 'admin' && <th className="px-5 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {expenses?.map((exp) => {
                  const recordedBy = typeof exp.recordedBy === 'object' ? exp.recordedBy : null;
                  return (
                    <tr key={exp._id} className="border-b border-slate-50 last:border-0">
                      <td className="px-5 py-3 text-slate-600">{new Date(exp.date).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-slate-600">{CATEGORY_LABELS[exp.category]}</td>
                      <td className="px-5 py-3 font-medium text-slate-900">₹{exp.amount}</td>
                      <td className="px-5 py-3 text-slate-600">{exp.description ?? '—'}</td>
                      <td className="px-5 py-3 text-slate-600">{recordedBy?.name ?? '—'}</td>
                      {role === 'admin' && (
                        <td className="px-5 py-3 text-right">
                          <Button variant="ghost" size="icon" onClick={() => deleteExpense.mutate(exp._id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {expenses?.length === 0 && (
                  <tr>
                    <td colSpan={role === 'admin' ? 6 : 5} className="px-5 py-10 text-center text-slate-400">
                      No expenses logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
