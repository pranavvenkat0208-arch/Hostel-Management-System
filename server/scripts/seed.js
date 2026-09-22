// npm run seed
//
// Wipes the database and loads demo data covering April to September 2026.
// Refuses to run with NODE_ENV=production unless --force is passed.
// Run `npm run backup` first if you need the current data.
const crypto = require('crypto');
const mongoose = require('mongoose');
const { env } = require('../src/config/env');
const { User } = require('../src/models/User');
const { Resident } = require('../src/models/Resident');
const { Room } = require('../src/models/Room');
const { Allocation } = require('../src/models/Allocation');
const { Invoice } = require('../src/models/Invoice');
const { MaintenanceRequest } = require('../src/models/MaintenanceRequest');
const { Expense } = require('../src/models/Expense');
const { Notification } = require('../src/models/Notification');
const { recalculateInvoiceStatus } = require('../src/utils/invoiceStatus');

const SEED_PASSWORD = 'Password123';
const MESS_CHARGES = 2500;

// All dates are IST.
const at = (iso) => new Date(`${iso}+05:30`);

// Save with our own createdAt/updatedAt instead of the current time.
async function saveAt(Model, data, createdAt, updatedAt = createdAt) {
  const doc = new Model({ ...data, createdAt, updatedAt });
  await doc.save({ timestamps: false });
  return doc;
}

// Older notifications are marked as read.
const READ_BEFORE = at('2026-09-19T00:00:00');
async function notify(recipients, { type, title, message, link }, when) {
  for (const recipient of [].concat(recipients)) {
    await saveAt(Notification, { recipient, type, title, message, link, read: when < READ_BEFORE }, when);
  }
}

const fakePaymentId = () => `pay_${crypto.randomBytes(7).toString('hex')}`;
const inr = (n) => `₹${n}`;

async function wipeDatabase() {
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const { name } of collections) {
    if (name.startsWith('system.')) continue;
    const { deletedCount } = await mongoose.connection.db.collection(name).deleteMany({});
    console.log(`Cleared ${String(deletedCount).padStart(4)} document(s) from ${name}`);
  }
}

async function seedUsers() {
  const make = (name, email, phone, role, createdAt) =>
    saveAt(User, { name, email, phone, role, password: SEED_PASSWORD }, at(createdAt));

  const indira = await make('Indira', 'indira@hostel.test', '9840011001', 'admin', '2026-03-20T10:00:00');
  const sriBalaji = await make('Sri Balaji', 'sribalaji@hostel.test', '9840011002', 'staff', '2026-03-22T11:00:00');
  const sneha = await make('Sneha', 'sneha@hostel.test', '9840011003', 'staff', '2026-03-22T11:30:00');
  const sanjaiUser = await make('Sanjai', 'sanjai@hostel.test', '9840011004', 'resident', '2026-04-02T18:20:00');
  const muthuUser = await make('Muthukumar', 'muthukumar@hostel.test', '9840011005', 'resident', '2026-04-05T20:45:00');

  return { indira, sriBalaji, sneha, sanjaiUser, muthuUser };
}

async function seedRooms() {
  const created = at('2026-03-25T09:00:00');
  const specs = [
    { roomNumber: '101', type: 'single', floor: 1, capacity: 1, monthlyRent: 6500, amenities: ['Wi-Fi', 'Attached bathroom', 'AC'] },
    { roomNumber: '102', type: 'double', floor: 1, capacity: 2, monthlyRent: 4500, amenities: ['Wi-Fi', 'Attached bathroom'] },
    { roomNumber: '103', type: 'double', floor: 1, capacity: 2, monthlyRent: 4500, amenities: ['Wi-Fi'] },
    { roomNumber: '201', type: 'triple', floor: 2, capacity: 3, monthlyRent: 3500, amenities: ['Wi-Fi', 'Balcony'] },
    { roomNumber: '202', type: 'single', floor: 2, capacity: 1, monthlyRent: 6000, amenities: ['Wi-Fi', 'Attached bathroom'] },
    {
      roomNumber: '203',
      type: 'double',
      floor: 2,
      capacity: 2,
      monthlyRent: 4800,
      amenities: ['Wi-Fi', 'Attached bathroom'],
      underMaintenance: true,
      notes: 'Bathroom re-tiling, expected back in service early October',
    },
    { roomNumber: '301', type: 'dormitory', floor: 3, capacity: 6, monthlyRent: 2500, amenities: ['Wi-Fi', 'Lockers'] },
    { roomNumber: '302', type: 'triple', floor: 3, capacity: 3, monthlyRent: 3500, amenities: ['Wi-Fi'] },
  ];

  const rooms = {};
  for (const spec of specs) {
    rooms[spec.roomNumber] = await saveAt(Room, spec, created);
  }
  return rooms;
}

async function seedResidents({ sanjaiUser, muthuUser }) {
  const sanjai = await saveAt(
    Resident,
    {
      user: sanjaiUser._id,
      name: sanjaiUser.name,
      email: sanjaiUser.email,
      phone: sanjaiUser.phone,
      emergencyContact: { name: 'Ravi Kumar', relation: 'Father', phone: '9443012345' },
      preferredRoomType: 'double',
    },
    sanjaiUser.createdAt
  );

  const muthu = await saveAt(
    Resident,
    {
      user: muthuUser._id,
      name: muthuUser.name,
      email: muthuUser.email,
      phone: muthuUser.phone,
      emergencyContact: { name: 'Lakshmi', relation: 'Mother', phone: '9443067890' },
      preferredRoomType: 'single',
    },
    muthuUser.createdAt
  );

  return { sanjai, muthu };
}

// Sanjai in 102. Muthukumar in 201, then moved to 101 on 1 July.
async function seedAllocations({ rooms, residents, users }) {
  const { sanjai, muthu } = residents;
  const { indira, sriBalaji, sneha } = users;
  const staffAndAdmin = [indira._id, sriBalaji._id, sneha._id];

  await saveAt(
    Allocation,
    {
      resident: sanjai._id,
      room: rooms['102']._id,
      checkInDate: at('2026-04-03T11:00:00'),
      allocatedBy: sriBalaji._id,
      notes: 'Prefers a lower floor',
    },
    at('2026-04-03T11:00:00')
  );
  await notify(
    sanjai.user,
    { type: 'allocation', title: 'Room assigned', message: 'You have been checked into Room 102.', link: '/my-room' },
    at('2026-04-03T11:00:00')
  );

  await saveAt(
    Allocation,
    {
      resident: muthu._id,
      room: rooms['201']._id,
      checkInDate: at('2026-04-06T10:30:00'),
      checkOutDate: at('2026-07-01T10:00:00'),
      status: 'checked_out',
      allocatedBy: sneha._id,
    },
    at('2026-04-06T10:30:00'),
    at('2026-07-01T10:00:00')
  );
  await notify(
    muthu.user,
    { type: 'allocation', title: 'Room assigned', message: 'You have been checked into Room 201.', link: '/my-room' },
    at('2026-04-06T10:30:00')
  );

  await saveAt(
    Allocation,
    {
      resident: muthu._id,
      room: rooms['101']._id,
      checkInDate: at('2026-07-01T10:05:00'),
      allocatedBy: indira._id,
      notes: 'Room change, requested a single room',
    },
    at('2026-07-01T10:05:00')
  );
  await notify(
    muthu.user,
    { type: 'allocation', title: 'Room assigned', message: 'You have been checked into Room 101.', link: '/my-room' },
    at('2026-07-01T10:05:00')
  );

  // 201 was never full, so no "room available" alert. 203 went into maintenance.
  await notify(
    staffAndAdmin,
    {
      type: 'room',
      title: 'Room under maintenance',
      message: 'Room 203 has been placed under maintenance.',
      link: '/rooms',
    },
    at('2026-09-15T12:00:00')
  );

  rooms['102'].occupied = 1;
  rooms['101'].occupied = 1;
  await rooms['102'].save({ timestamps: false });
  await rooms['101'].save({ timestamps: false });

  sanjai.currentRoom = rooms['102']._id;
  muthu.currentRoom = rooms['101']._id;
  await sanjai.save({ timestamps: false });
  await muthu.save({ timestamps: false });
}

// Creates an invoice and replays its payments in order. Events without an
// amount are status notes (e.g. marked overdue).
async function seedInvoice({ resident, room, period, electricity, discount = 0, lateFee = 0, dueDate, createdBy, events = [], installments = [], lastReminderAt = null }) {
  const createdAt = at(`${period}-01T09:00:00`);
  const invoice = new Invoice({
    resident: resident._id,
    room: room._id,
    billingPeriod: period,
    lineItems: [
      { description: 'Room fee', amount: room.monthlyRent },
      { description: 'Mess charges', amount: MESS_CHARGES },
      { description: 'Electricity (sub-meter)', amount: electricity },
    ],
    discount,
    lateFee,
    dueDate: at(dueDate),
    createdBy,
    installments,
    lastReminderAt,
    createdAt,
    updatedAt: createdAt,
  });
  // First save runs the pre-save hook, which sets totalAmount.
  await invoice.save({ timestamps: false });

  await notify(
    resident.user,
    {
      type: 'invoice',
      title: 'New invoice',
      message: `A new invoice of ${inr(invoice.totalAmount)} for ${period} is due ${invoice.dueDate.toLocaleDateString('en-IN')}.`,
      link: '/billing',
    },
    createdAt
  );

  for (const event of events) {
    const when = at(event.at);
    if (event.amount) invoice.amountPaid += event.amount;

    if (event.amount) {
      invoice.status = invoice.amountPaid >= invoice.totalAmount ? 'paid' : when > invoice.dueDate ? 'overdue' : 'partially_paid';
    } else {
      invoice.status = event.status;
    }

    invoice.paymentHistory.push({
      status: invoice.status,
      amount: event.amount,
      method: event.method,
      note: event.method === 'razorpay' ? `Razorpay payment ${fakePaymentId()}` : event.note,
      recordedBy: event.by,
      recordedAt: when,
    });
    invoice.updatedAt = when;

    if (event.amount) {
      await notify(
        resident.user,
        event.method === 'razorpay'
          ? { type: 'invoice', title: 'Payment received', message: `${inr(event.amount)} received for ${period}. Thank you!`, link: '/billing' }
          : {
              type: 'invoice',
              title: 'Invoice payment status updated',
              message: `Your invoice for ${period} is now marked ${invoice.status.replace('_', ' ')}.`,
              link: '/billing',
            },
        when
      );
    } else if (event.status === 'overdue') {
      await notify(
        resident.user,
        {
          type: 'invoice',
          title: 'Invoice overdue',
          message: `Your invoice for ${period} was due ${invoice.dueDate.toLocaleDateString('en-IN')} and is now overdue.`,
          link: '/billing',
        },
        when
      );
    }
  }

  recalculateInvoiceStatus(invoice);
  await invoice.save({ timestamps: false });
  return invoice;
}

async function seedInvoices({ rooms, residents, users }) {
  const { sanjai, muthu } = residents;
  const { indira, sriBalaji, sneha } = users;
  const self = (resident) => resident.user;

  // Sanjai (room 102): pays every month, July was late
  await seedInvoice({
    resident: sanjai, room: rooms['102'], period: '2026-04', electricity: 380, discount: 500,
    dueDate: '2026-04-10T23:59:00', createdBy: sriBalaji._id,
    events: [{ at: '2026-04-08T19:10:00', amount: 6880, method: 'upi', note: 'GPay ref 4102 8873', by: sriBalaji._id }],
  });
  await seedInvoice({
    resident: sanjai, room: rooms['102'], period: '2026-05', electricity: 520,
    dueDate: '2026-05-10T23:59:00', createdBy: sriBalaji._id,
    events: [{ at: '2026-05-09T10:30:00', amount: 7520, method: 'cash', note: 'Paid at the office', by: sneha._id }],
  });
  await seedInvoice({
    resident: sanjai, room: rooms['102'], period: '2026-06', electricity: 610,
    dueDate: '2026-06-10T23:59:00', createdBy: sriBalaji._id,
    events: [{ at: '2026-06-07T21:05:00', amount: 7610, method: 'razorpay', by: self(sanjai) }],
  });
  await seedInvoice({
    resident: sanjai, room: rooms['102'], period: '2026-07', electricity: 560, lateFee: 200,
    dueDate: '2026-07-10T23:59:00', createdBy: sriBalaji._id,
    events: [
      { at: '2026-07-11T09:15:00', status: 'overdue', note: 'Past due, ₹200 late fee added', by: sneha._id },
      { at: '2026-07-14T18:40:00', amount: 7760, method: 'upi', note: 'PhonePe ref 7730 1195', by: sneha._id },
    ],
  });
  await seedInvoice({
    resident: sanjai, room: rooms['102'], period: '2026-08', electricity: 490,
    dueDate: '2026-08-10T23:59:00', createdBy: sneha._id,
    events: [
      { at: '2026-08-09T20:00:00', amount: 3000, method: 'upi', note: 'Part payment, balance next week', by: sneha._id },
      { at: '2026-08-18T11:20:00', amount: 4490, method: 'cash', note: 'Balance settled', by: sriBalaji._id },
    ],
  });
  await seedInvoice({
    resident: sanjai, room: rooms['102'], period: '2026-09', electricity: 540,
    dueDate: '2026-09-10T23:59:00', createdBy: sneha._id,
    events: [{ at: '2026-09-09T22:30:00', amount: 7540, method: 'razorpay', by: self(sanjai) }],
  });

  // Muthukumar (201 until June, then 101)
  await seedInvoice({
    resident: muthu, room: rooms['201'], period: '2026-04', electricity: 290,
    dueDate: '2026-04-10T23:59:00', createdBy: sneha._id,
    events: [{ at: '2026-04-09T15:00:00', amount: 6290, method: 'bank_transfer', note: 'NEFT from parent', by: sneha._id }],
  });
  await seedInvoice({
    resident: muthu, room: rooms['201'], period: '2026-05', electricity: 330,
    dueDate: '2026-05-10T23:59:00', createdBy: sneha._id,
    events: [{ at: '2026-05-06T12:45:00', amount: 6330, method: 'upi', note: 'GPay ref 5519 2084', by: sneha._id }],
  });
  await seedInvoice({
    resident: muthu, room: rooms['201'], period: '2026-06', electricity: 410,
    dueDate: '2026-06-10T23:59:00', createdBy: sneha._id,
    events: [{ at: '2026-06-10T17:25:00', amount: 6410, method: 'upi', note: 'Paid on due date', by: sriBalaji._id }],
  });

  // July: split into two installments after the move
  await seedInvoice({
    resident: muthu, room: rooms['101'], period: '2026-07', electricity: 720,
    dueDate: '2026-07-25T23:59:00', createdBy: indira._id,
    installments: [
      { amount: 4860, dueDate: at('2026-07-10T23:59:00'), status: 'paid', method: 'upi', note: 'Installment 1', paidAt: at('2026-07-09T19:00:00') },
      { amount: 4860, dueDate: at('2026-07-25T23:59:00'), status: 'paid', method: 'razorpay', note: 'Installment 2 online', paidAt: at('2026-07-24T21:15:00') },
    ],
    events: [
      { at: '2026-07-09T19:00:00', amount: 4860, method: 'upi', note: 'Installment 1 payment', by: sriBalaji._id },
      { at: '2026-07-24T21:15:00', amount: 4860, method: 'razorpay', by: self(muthu) },
    ],
  });

  // August: part paid, still overdue
  await seedInvoice({
    resident: muthu, room: rooms['101'], period: '2026-08', electricity: 850,
    dueDate: '2026-08-10T23:59:00', createdBy: sneha._id,
    lastReminderAt: at('2026-09-22T09:00:00'),
    events: [
      { at: '2026-08-11T09:00:00', status: 'overdue', note: 'Reminder sent, payment pending', by: sneha._id },
      { at: '2026-08-12T16:30:00', amount: 5000, method: 'cash', note: 'Part payment at the office', by: sneha._id },
    ],
  });

  // September: two installments, first one paid online
  await seedInvoice({
    resident: muthu, room: rooms['101'], period: '2026-09', electricity: 780,
    dueDate: '2026-09-30T23:59:00', createdBy: sriBalaji._id,
    installments: [
      { amount: 4890, dueDate: at('2026-09-15T23:59:00'), status: 'paid', method: 'razorpay', note: 'Installment 1 online', paidAt: at('2026-09-14T20:10:00') },
      { amount: 4890, dueDate: at('2026-09-30T23:59:00'), status: 'pending' },
    ],
    events: [{ at: '2026-09-14T20:10:00', amount: 4890, method: 'razorpay', by: self(muthu) }],
  });
}

// Creates a ticket with its status timeline and the matching notifications.
async function seedTicket({ resident, room, title, description, category, priority, openedAt, assignTo, steps, staffAndAdmin }) {
  const statusHistory = [{ status: 'open', changedBy: resident.user, changedAt: at(openedAt) }];
  let status = 'open';
  let updatedAt = at(openedAt);

  await notify(
    staffAndAdmin,
    {
      type: 'maintenance',
      title: 'New maintenance request',
      message: `${resident.name} submitted "${title}" (${priority} priority).`,
      link: '/maintenance',
    },
    at(openedAt)
  );

  for (const step of steps) {
    status = step.status;
    updatedAt = at(step.at);
    statusHistory.push({ status: step.status, note: step.note, changedBy: step.by, changedAt: updatedAt });

    if (step.assigned) {
      await notify(
        assignTo,
        { type: 'maintenance', title: 'Maintenance request assigned to you', message: `You've been assigned: "${title}".`, link: '/maintenance' },
        updatedAt
      );
    }
    await notify(
      resident.user,
      {
        type: 'maintenance',
        title: 'Maintenance request updated',
        message: `Your request "${title}" is now ${step.status.replace('_', ' ')}.`,
        link: '/maintenance',
      },
      updatedAt
    );
  }

  await saveAt(
    MaintenanceRequest,
    {
      resident: resident._id,
      room: room._id,
      title,
      description,
      category,
      priority,
      status,
      assignedTo: assignTo ?? null,
      statusHistory,
    },
    at(openedAt),
    updatedAt
  );
}

async function seedMaintenance({ rooms, residents, users }) {
  const { sanjai, muthu } = residents;
  const { indira, sriBalaji, sneha } = users;
  const staffAndAdmin = [indira._id, sriBalaji._id, sneha._id];
  const common = { staffAndAdmin };

  await seedTicket({
    ...common, resident: sanjai, room: rooms['102'], title: 'Ceiling fan making a rattling noise',
    description: 'The fan rattles loudly on speed 3 and above, especially at night.',
    category: 'electrical', priority: 'medium', openedAt: '2026-04-20T22:10:00', assignTo: sriBalaji._id,
    steps: [
      { at: '2026-04-21T09:30:00', status: 'in_progress', note: 'Assigned to staff', by: sneha._id, assigned: true },
      { at: '2026-04-22T16:00:00', status: 'resolved', note: 'Replaced the fan capacitor and tightened the canopy.', by: sriBalaji._id },
      { at: '2026-04-25T10:00:00', status: 'closed', note: 'Resident confirmed it is quiet now.', by: sneha._id },
    ],
  });

  await seedTicket({
    ...common, resident: muthu, room: rooms['201'], title: 'Bathroom tap leaking',
    description: 'The wash basin tap keeps dripping even when fully closed. Water is pooling on the floor.',
    category: 'plumbing', priority: 'high', openedAt: '2026-05-12T07:45:00', assignTo: sneha._id,
    steps: [
      { at: '2026-05-12T09:00:00', status: 'in_progress', note: 'Assigned to staff', by: indira._id, assigned: true },
      { at: '2026-05-13T12:30:00', status: 'resolved', note: 'Washer and spindle replaced.', by: sneha._id },
      { at: '2026-05-15T18:00:00', status: 'closed', by: sneha._id },
    ],
  });

  await seedTicket({
    ...common, resident: muthu, room: rooms['201'], title: 'Wi-Fi keeps disconnecting',
    description: 'Connection drops every 10–15 minutes in the evening. Hard to attend online classes.',
    category: 'internet', priority: 'medium', openedAt: '2026-06-18T20:30:00', assignTo: sriBalaji._id,
    steps: [
      { at: '2026-06-19T10:00:00', status: 'in_progress', note: 'Assigned to staff', by: sneha._id, assigned: true },
      { at: '2026-06-20T15:45:00', status: 'resolved', note: 'Router firmware updated and access point moved to the 2nd floor corridor.', by: sriBalaji._id },
      { at: '2026-06-23T11:00:00', status: 'closed', by: sriBalaji._id },
    ],
  });

  await seedTicket({
    ...common, resident: sanjai, room: rooms['102'], title: 'Study table drawer broken',
    description: 'The drawer runner came off and the drawer does not close.',
    category: 'furniture', priority: 'low', openedAt: '2026-08-05T17:15:00', assignTo: sneha._id,
    steps: [
      { at: '2026-08-06T10:00:00', status: 'in_progress', note: 'Assigned to staff', by: sriBalaji._id, assigned: true },
      { at: '2026-08-09T14:20:00', status: 'resolved', note: 'New drawer runners fitted.', by: sneha._id },
    ],
  });

  await seedTicket({
    ...common, resident: muthu, room: rooms['101'], title: 'AC not cooling',
    description: 'AC runs but only blows warm air since yesterday. Room gets very hot in the afternoon.',
    category: 'electrical', priority: 'urgent', openedAt: '2026-09-19T14:05:00', assignTo: sriBalaji._id,
    steps: [
      { at: '2026-09-19T15:00:00', status: 'in_progress', note: 'Assigned to staff. Technician visit booked for 24 Sep.', by: indira._id, assigned: true },
    ],
  });

  await seedTicket({
    ...common, resident: sanjai, room: rooms['102'], title: 'Room cleaning missed this week',
    description: 'Room was not cleaned on Monday or Wednesday this week.',
    category: 'cleanliness', priority: 'low', openedAt: '2026-09-22T19:40:00',
    steps: [],
  });
}

async function seedExpenses({ users }) {
  const { indira, sriBalaji, sneha } = users;
  const rows = [];
  const add = (category, amount, date, description, by) => rows.push({ category, amount, date: at(date), description, recordedBy: by });

  // Monthly running costs
  const months = [
    ['2026-04', 4200, 950, 1250],
    ['2026-05', 5400, 1100, 1400],
    ['2026-06', 4900, 1050, 1180],
    ['2026-07', 3800, 980, 1320],
    ['2026-08', 3600, 900, 1100],
    ['2026-09', 3900, 1020, 1450],
  ];
  for (const [month, electricity, water, supplies] of months) {
    add('electricity', electricity, `${month}-05T11:00:00`, 'TNEB bill, common areas and corridors', indira._id);
    add('water', water, `${month}-07T11:00:00`, 'Metro water + drinking water cans', sneha._id);
    add('supplies', supplies, `${month}-12T16:00:00`, 'Cleaning supplies and toiletries for common bathrooms', sriBalaji._id);
    add('staff_salaries', 5000, `${month}-28T18:00:00`, 'Part-time housekeeping wages', indira._id);
  }

  // Repairs from the maintenance tickets
  add('repairs_maintenance', 450, '2026-04-22T16:30:00', 'Fan capacitor, room 102', sriBalaji._id);
  add('repairs_maintenance', 320, '2026-05-13T13:00:00', 'Tap washer and spindle, room 201', sneha._id);
  add('repairs_maintenance', 2800, '2026-06-20T16:00:00', 'Wi-Fi access point for 2nd floor', sriBalaji._id);
  add('repairs_maintenance', 600, '2026-08-09T15:00:00', 'Drawer runners, room 102', sneha._id);
  add('repairs_maintenance', 6500, '2026-09-16T12:00:00', 'Room 203 bathroom re-tiling (advance to contractor)', indira._id);
  add('other', 1800, '2026-08-15T10:00:00', 'Independence Day celebration, snacks and decorations', indira._id);

  for (const row of rows) {
    await saveAt(Expense, row, row.date);
  }
  return rows.length;
}

async function main() {
  if (env.NODE_ENV === 'production' && !process.argv.includes('--force')) {
    console.error('Refusing to wipe a production database. Re-run with --force if you really mean it.');
    process.exit(1);
  }

  await mongoose.connect(env.MONGODB_URI);
  console.log(`Connected to ${mongoose.connection.name}, resetting all data...\n`);

  await wipeDatabase();

  const users = await seedUsers();
  const rooms = await seedRooms();
  const residents = await seedResidents(users);
  await seedAllocations({ rooms, residents, users });
  await seedInvoices({ rooms, residents, users });
  await seedMaintenance({ rooms, residents, users });
  const expenseCount = await seedExpenses({ users });

  console.log('\nSeeded:');
  console.log(`  users           ${await User.countDocuments()}`);
  console.log(`  rooms           ${await Room.countDocuments()}`);
  console.log(`  allocations     ${await Allocation.countDocuments()}`);
  console.log(`  invoices        ${await Invoice.countDocuments()}`);
  console.log(`  maintenance     ${await MaintenanceRequest.countDocuments()}`);
  console.log(`  expenses        ${expenseCount}`);
  console.log(`  notifications   ${await Notification.countDocuments()}`);
  console.log(`\nAll accounts use the password: ${SEED_PASSWORD}`);

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('Seeding failed:', error);
  await mongoose.disconnect();
  process.exit(1);
});
