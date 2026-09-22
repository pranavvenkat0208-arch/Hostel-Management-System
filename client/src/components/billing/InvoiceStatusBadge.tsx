import { Badge } from '../ui/Badge';
import type { BadgeProps } from '../ui/Badge';
import type { InvoiceStatus } from '../../types';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

const variant: Record<InvoiceStatus, BadgeVariant> = {
  unpaid: 'default',
  partially_paid: 'warning',
  paid: 'success',
  overdue: 'danger',
};

const label: Record<InvoiceStatus, string> = {
  unpaid: 'Unpaid',
  partially_paid: 'Partially paid',
  paid: 'Paid',
  overdue: 'Overdue',
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <Badge variant={variant[status]}>{label[status]}</Badge>;
}
