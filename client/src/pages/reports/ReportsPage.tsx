import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { IndianRupee, Wallet, AlertTriangle, DoorOpen } from 'lucide-react';
import { useRevenueReport, useOccupancyReport } from '../../hooks/useReports';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { StatTile } from '../../components/ui/StatTile';
import type { InvoiceStatus } from '../../types';

// Reference palette from the dataviz skill (references/palette.md), light mode.
// series-1 (blue) always marks the "expected/total" half of a pair, series-2
// (orange) the "actual/achieved" half — the same role in both charts below.
const SERIES_EXPECTED = '#2a78d6';
const SERIES_ACTUAL = '#eb6834';
const GRIDLINE = '#e1e0d9';
const AXIS_INK = '#898781';

// Fixed status palette — never reused for plain categorical series, always
// paired with a text label (the axis category label here).
const STATUS_COLORS: Record<InvoiceStatus, string> = {
  paid: '#0ca30c',
  partially_paid: '#fab219',
  unpaid: '#ec835a',
  overdue: '#d03b3b',
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  paid: 'Paid',
  partially_paid: 'Partially paid',
  unpaid: 'Unpaid',
  overdue: 'Overdue',
};

function formatCurrency(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

export function ReportsPage() {
  const { data: revenue, isLoading: revenueLoading } = useRevenueReport();
  const { data: occupancy, isLoading: occupancyLoading } = useOccupancyReport();

  const isLoading = revenueLoading || occupancyLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500">Revenue and occupancy at a glance, built from live billing and room data.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-10">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Total invoiced"
              value={formatCurrency(revenue?.totals.totalInvoiced ?? 0)}
              icon={IndianRupee}
              accentClassName="bg-blue-50 text-blue-600"
            />
            <StatTile
              label="Total collected"
              value={formatCurrency(revenue?.totals.totalCollected ?? 0)}
              icon={Wallet}
              accentClassName="bg-orange-50 text-orange-600"
            />
            <StatTile
              label="Outstanding"
              value={formatCurrency(revenue?.totals.totalOutstanding ?? 0)}
              icon={AlertTriangle}
              accentClassName="bg-red-50 text-red-600"
            />
            <StatTile
              label="Occupancy rate"
              value={`${occupancy?.occupancyRate ?? 0}%`}
              icon={DoorOpen}
              accentClassName="bg-green-50 text-green-600"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue by billing period</CardTitle>
              <CardDescription>Invoiced vs. collected amounts, grouped by month.</CardDescription>
            </CardHeader>
            <CardContent>
              {revenue && revenue.byPeriod.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenue.byPeriod} barGap={4}>
                    <CartesianGrid vertical={false} stroke={GRIDLINE} />
                    <XAxis dataKey="period" tick={{ fill: AXIS_INK, fontSize: 12 }} axisLine={{ stroke: GRIDLINE }} tickLine={false} />
                    <YAxis
                      tick={{ fill: AXIS_INK, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `₹${v}`}
                    />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend wrapperStyle={{ fontSize: 13 }} />
                    <Bar dataKey="invoiced" name="Invoiced" fill={SERIES_EXPECTED} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="collected" name="Collected" fill={SERIES_ACTUAL} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-10 text-center text-sm text-slate-400">No invoices yet — this fills in as billing periods are created.</p>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Invoices by status</CardTitle>
                <CardDescription>How many invoices sit in each payment state right now.</CardDescription>
              </CardHeader>
              <CardContent>
                {revenue && revenue.byStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                      data={revenue.byStatus.map((s) => ({ ...s, label: STATUS_LABELS[s.status] }))}
                      layout="vertical"
                      margin={{ left: 12 }}
                    >
                      <CartesianGrid horizontal={false} stroke={GRIDLINE} />
                      <XAxis type="number" allowDecimals={false} tick={{ fill: AXIS_INK, fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="label"
                        tick={{ fill: '#0b0b0b', fontSize: 13 }}
                        axisLine={false}
                        tickLine={false}
                        width={110}
                      />
                      <Tooltip formatter={(value) => [`${value} invoice(s)`, 'Count']} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {revenue.byStatus.map((s) => (
                          <Cell key={s.status} fill={STATUS_COLORS[s.status]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="py-10 text-center text-sm text-slate-400">No invoices yet.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Occupancy by room type</CardTitle>
                <CardDescription>Capacity vs. beds currently occupied, per room type.</CardDescription>
              </CardHeader>
              <CardContent>
                {occupancy && occupancy.byType.some((t) => t.capacity > 0) ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={occupancy.byType} barGap={4}>
                      <CartesianGrid vertical={false} stroke={GRIDLINE} />
                      <XAxis
                        dataKey="type"
                        tick={{ fill: AXIS_INK, fontSize: 12 }}
                        axisLine={{ stroke: GRIDLINE }}
                        tickLine={false}
                        tickFormatter={(v: string) => v.charAt(0).toUpperCase() + v.slice(1)}
                      />
                      <YAxis allowDecimals={false} tick={{ fill: AXIS_INK, fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 13 }} />
                      <Bar dataKey="capacity" name="Capacity" fill={SERIES_EXPECTED} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="occupied" name="Occupied" fill={SERIES_ACTUAL} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="py-10 text-center text-sm text-slate-400">No rooms yet — add rooms to see occupancy here.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Check-ins over time</CardTitle>
              <CardDescription>New allocations per month — a proxy for how occupancy has trended.</CardDescription>
            </CardHeader>
            <CardContent>
              {occupancy && occupancy.checkInsByMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={occupancy.checkInsByMonth}>
                    <CartesianGrid vertical={false} stroke={GRIDLINE} />
                    <XAxis dataKey="month" tick={{ fill: AXIS_INK, fontSize: 12 }} axisLine={{ stroke: GRIDLINE }} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: AXIS_INK, fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value) => [`${value} check-in(s)`, 'Check-ins']} />
                    <Line
                      type="monotone"
                      dataKey="checkIns"
                      name="Check-ins"
                      stroke={SERIES_EXPECTED}
                      strokeWidth={2}
                      dot={{ r: 4, fill: SERIES_EXPECTED }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-10 text-center text-sm text-slate-400">No allocations yet.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
