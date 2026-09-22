import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';
import type { ToastVariant } from '../../store/toastStore';
import { cn } from '../../lib/utils';

const ICONS: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const STYLES: Record<ToastVariant, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
};

// Mounted once in App.tsx.
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.variant];
        return (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm shadow-lg',
              STYLES[toast.variant]
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="ml-1 text-slate-400 hover:text-slate-600"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
