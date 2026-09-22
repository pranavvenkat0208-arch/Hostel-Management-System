import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { cn } from '../../lib/utils';

interface StatTileProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accentClassName?: string;
}

/**
 * A small headline-number tile for report summaries. Kept text-first (per
 * the dataviz guidance a single stat is often better as a number than a
 * chart) — the icon is decorative, the value never relies on color alone.
 */
export function StatTile({ label, value, icon: Icon, accentClassName = 'bg-indigo-50 text-indigo-600' }: StatTileProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', accentClassName)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="text-xl font-semibold text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
