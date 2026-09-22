import { DoorOpen, Wrench, Receipt } from 'lucide-react';
import { useMyProfile } from '../../hooks/useResidents';
import { useMyMaintenanceRequests } from '../../hooks/useMaintenance';
import { useMyInvoices } from '../../hooks/useInvoices';
import { StatTile } from '../../components/ui/StatTile';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';

function formatCurrency(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

// The resident landing view — their room, how many maintenance requests are
// still open, and what they currently owe, all from data already fetched
// elsewhere in the app (My Room, Maintenance, Billing).
export function ResidentOverview() {
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: requests, isLoading: requestsLoading } = useMyMaintenanceRequests();
  const { data: invoices, isLoading: invoicesLoading } = useMyInvoices();

  const isLoading = profileLoading || requestsLoading || invoicesLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Spinner />
      </div>
    );
  }

  const openRequests = (requests ?? []).filter((r) => r.status === 'open' || r.status === 'in_progress');
  const outstanding = (invoices ?? [])
    .filter((inv) => inv.status !== 'paid')
    .reduce((sum, inv) => sum + (inv.totalAmount - inv.amountPaid), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          label="My room"
          value={profile?.currentRoom ? profile.currentRoom.roomNumber : 'Not assigned'}
          icon={DoorOpen}
          accentClassName="bg-blue-50 text-blue-600"
        />
        <StatTile
          label="Open requests"
          value={String(openRequests.length)}
          icon={Wrench}
          accentClassName="bg-amber-50 text-amber-600"
        />
        <StatTile
          label="Amount due"
          value={formatCurrency(outstanding)}
          icon={Receipt}
          accentClassName="bg-red-50 text-red-600"
        />
      </div>

      {!profile?.currentRoom && (
        <Card>
          <CardHeader>
            <CardTitle>No room assigned yet</CardTitle>
            <CardDescription>Once staff allocates you a room, it'll show up here and on the My Room page.</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
