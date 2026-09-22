import { DoorOpen, Users2, Wrench, Receipt } from 'lucide-react';
import { useOccupancySummary } from '../../hooks/useRooms';
import { useAllMaintenanceRequests } from '../../hooks/useMaintenance';
import { useInvoices } from '../../hooks/useInvoices';
import { StatTile } from '../../components/ui/StatTile';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { PriorityBadge, MaintenanceStatusBadge } from '../../components/maintenance/StatusBadges';
import { Spinner } from '../../components/ui/Spinner';
import type { PopulatedRef } from '../../types';

function formatCurrency(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

function asRef(value: PopulatedRef | string | null | undefined): PopulatedRef | null {
  return value && typeof value === 'object' ? value : null;
}

export function AdminStaffOverview() {
  const { data: occupancy, isLoading: occupancyLoading } = useOccupancySummary();
  const { data: requests, isLoading: requestsLoading } = useAllMaintenanceRequests();
  const { data: invoices, isLoading: invoicesLoading } = useInvoices();

  const isLoading = occupancyLoading || requestsLoading || invoicesLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Spinner />
      </div>
    );
  }

  const pendingRequests = (requests ?? []).filter((r) => r.status === 'open' || r.status === 'in_progress');
  const outstanding = (invoices ?? [])
    .filter((inv) => inv.status !== 'paid')
    .reduce((sum, inv) => sum + (inv.totalAmount - inv.amountPaid), 0);

  const attentionQueue = [...pendingRequests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Occupancy rate"
          value={`${occupancy?.occupancyRate ?? 0}%`}
          icon={DoorOpen}
          accentClassName="bg-blue-50 text-blue-600"
        />
        <StatTile
          label="Beds occupied"
          value={`${occupancy?.totalOccupied ?? 0} / ${occupancy?.totalCapacity ?? 0}`}
          icon={Users2}
          accentClassName="bg-indigo-50 text-indigo-600"
        />
        <StatTile
          label="Pending maintenance"
          value={String(pendingRequests.length)}
          icon={Wrench}
          accentClassName="bg-amber-50 text-amber-600"
        />
        <StatTile
          label="Outstanding billing"
          value={formatCurrency(outstanding)}
          icon={Receipt}
          accentClassName="bg-red-50 text-red-600"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Needs attention</CardTitle>
          <CardDescription>Open and in-progress maintenance requests, most recent first.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {attentionQueue.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">Nothing pending. The maintenance queue is clear.</p>
          ) : (
            <ul>
              {attentionQueue.map((request) => {
                const room = asRef(request.room);
                return (
                  <li
                    key={request._id}
                    className="flex items-center justify-between border-b border-slate-50 px-5 py-3 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{request.title}</p>
                      <p className="text-xs text-slate-500">{room?.roomNumber ?? 'Unknown room'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={request.priority} />
                      <MaintenanceStatusBadge status={request.status} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
