import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import axios from 'axios';

// Merge conditional Tailwind classes without duplicate/conflicting utilities.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Pulls a readable message out of an API error (axios or otherwise) instead
// of every call site doing its own `(error as any)?.response?.data?...`.
export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
