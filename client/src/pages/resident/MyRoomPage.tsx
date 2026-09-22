import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useMyProfile, useUpdateMyProfile } from '../../hooks/useResidents';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Spinner } from '../../components/ui/Spinner';
import { getErrorMessage } from '../../lib/utils';

export function MyRoomPage() {
  const { data: resident, isLoading } = useMyProfile();
  const updateProfile = useUpdateMyProfile();

  const [phone, setPhone] = useState('');
  const [ecName, setEcName] = useState('');
  const [ecRelation, setEcRelation] = useState('');
  const [ecPhone, setEcPhone] = useState('');

  useEffect(() => {
    if (resident) {
      setPhone(resident.phone ?? '');
      setEcName(resident.emergencyContact?.name ?? '');
      setEcRelation(resident.emergencyContact?.relation ?? '');
      setEcPhone(resident.emergencyContact?.phone ?? '');
    }
  }, [resident]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    updateProfile.mutate({
      phone,
      emergencyContact: { name: ecName, relation: ecRelation, phone: ecPhone },
    });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My room</h1>
        <p className="text-sm text-slate-500">Your current room assignment and contact details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room assignment</CardTitle>
        </CardHeader>
        <CardContent>
          {resident?.currentRoom ? (
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs uppercase text-slate-500">Room</p>
                <p className="mt-1 font-medium text-slate-900">{resident.currentRoom.roomNumber}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Type</p>
                <p className="mt-1 font-medium capitalize text-slate-900">{resident.currentRoom.type}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Floor</p>
                <p className="mt-1 font-medium text-slate-900">{resident.currentRoom.floor ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Monthly rent</p>
                <p className="mt-1 font-medium text-slate-900">₹{resident.currentRoom.monthlyRent}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Badge variant="warning">Unassigned</Badge>
              <p className="text-sm text-slate-500">
                You haven&apos;t been allocated a room yet — contact the hostel office.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact details</CardTitle>
          <CardDescription>Keep your phone and emergency contact up to date.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div />
            <div className="space-y-1.5">
              <Label htmlFor="ecName">Emergency contact name</Label>
              <Input id="ecName" value={ecName} onChange={(e) => setEcName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ecRelation">Relation</Label>
              <Input id="ecRelation" value={ecRelation} onChange={(e) => setEcRelation(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ecPhone">Emergency contact phone</Label>
              <Input id="ecPhone" value={ecPhone} onChange={(e) => setEcPhone(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="primary" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
            {updateProfile.isError && (
              <p className="text-sm text-red-600 sm:col-span-2">{getErrorMessage(updateProfile.error)}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
