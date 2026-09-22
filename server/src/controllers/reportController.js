const { Invoice } = require('../models/Invoice');
const { Room, ROOM_TYPES } = require('../models/Room');
const { Allocation } = require('../models/Allocation');
const { Expense } = require('../models/Expense');

async function getRevenueReport(_req, res) {
  const byPeriod = await Invoice.aggregate([
    {
      $group: {
        _id: '$billingPeriod',
        invoiced: { $sum: '$totalAmount' },
        collected: { $sum: '$amountPaid' },
        invoiceCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const byStatus = await Invoice.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$totalAmount' } } },
  ]);

  const totalsAgg = await Invoice.aggregate([
    {
      $group: {
        _id: null,
        totalInvoiced: { $sum: '$totalAmount' },
        totalCollected: { $sum: '$amountPaid' },
      },
    },
  ]);

  const totals = totalsAgg[0] ?? { totalInvoiced: 0, totalCollected: 0 };

  res.json({
    success: true,
    report: {
      byPeriod: byPeriod.map((p) => ({
        period: p._id,
        invoiced: p.invoiced,
        collected: p.collected,
        invoiceCount: p.invoiceCount,
      })),
      byStatus: byStatus.map((s) => ({ status: s._id, count: s.count, amount: s.amount })),
      totals: {
        totalInvoiced: totals.totalInvoiced,
        totalCollected: totals.totalCollected,
        totalOutstanding: totals.totalInvoiced - totals.totalCollected,
      },
    },
  });
}

async function getOccupancyReport(_req, res) {
  const rooms = await Room.find();

  const totalRooms = rooms.length;
  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
  const totalOccupied = rooms.reduce((sum, r) => sum + r.occupied, 0);
  const occupancyRate = totalCapacity > 0 ? Number(((totalOccupied / totalCapacity) * 100).toFixed(1)) : 0;

  const byType = ROOM_TYPES.map((type) => {
    const roomsOfType = rooms.filter((r) => r.type === type);
    const capacity = roomsOfType.reduce((sum, r) => sum + r.capacity, 0);
    const occupied = roomsOfType.reduce((sum, r) => sum + r.occupied, 0);
    return {
      type,
      capacity,
      occupied,
      occupancyRate: capacity > 0 ? Number(((occupied / capacity) * 100).toFixed(1)) : 0,
    };
  });

  // Check-ins per month, used as the occupancy trend (we don't store snapshots).
  const checkInsByMonth = await Allocation.aggregate([
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$checkInDate' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    report: {
      totalRooms,
      totalCapacity,
      totalOccupied,
      occupancyRate,
      byType,
      checkInsByMonth: checkInsByMonth.map((c) => ({ month: c._id, checkIns: c.count })),
    },
  });
}

async function getExpenseReport(_req, res) {
  const byCategory = await Expense.aggregate([
    { $group: { _id: '$category', amount: { $sum: '$amount' } } },
    { $sort: { amount: -1 } },
  ]);

  const byMonth = await Expense.aggregate([
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } }, amount: { $sum: '$amount' } } },
    { $sort: { _id: 1 } },
  ]);

  const totalAgg = await Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
  const totalExpenses = totalAgg[0]?.total ?? 0;

  // Net revenue = collected - expenses
  const collectedAgg = await Invoice.aggregate([{ $group: { _id: null, collected: { $sum: '$amountPaid' } } }]);
  const totalCollected = collectedAgg[0]?.collected ?? 0;

  res.json({
    success: true,
    report: {
      totalExpenses,
      byCategory: byCategory.map((c) => ({ category: c._id, amount: c.amount })),
      byMonth: byMonth.map((m) => ({ month: m._id, amount: m.amount })),
      netRevenue: totalCollected - totalExpenses,
    },
  });
}

module.exports = { getRevenueReport, getOccupancyReport, getExpenseReport };
