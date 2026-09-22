import { Badge } from '../ui/Badge';
import type { BadgeProps } from '../ui/Badge';
import type { MaintenancePriority, MaintenanceStatus } from '../../types';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

const priorityVariant: Record<MaintenancePriority, BadgeVariant> = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  urgent: 'danger',
};

const statusVariant: Record<MaintenanceStatus, BadgeVariant> = {
  open: 'warning',
  in_progress: 'info',
  resolved: 'success',
  closed: 'default',
};

const statusLabel: Record<MaintenanceStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export function PriorityBadge({ priority }: { priority: MaintenancePriority }) {
  return (
    <Badge variant={priorityVariant[priority]} className="capitalize">
      {priority}
    </Badge>
  );
}

export function MaintenanceStatusBadge({ status }: { status: MaintenanceStatus }) {
  return <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>;
}
