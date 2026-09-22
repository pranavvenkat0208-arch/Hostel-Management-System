const mongoose = require('mongoose');
const { env } = require('../config/env');
const { User } = require('../models/User');
const { Resident } = require('../models/Resident');

const SEED_PASSWORD = 'Password123';

const adminSeeds = [
  { name: 'Indira Rao', email: 'indira@hostel.test', phone: '9800000005' },
];

const staffSeeds = [
  { name: 'Bruce Wayne', email: 'bruce.wayne@hostel.test', phone: '9800000001' },
  { name: 'Clark Kent', email: 'clark.kent@hostel.test', phone: '9800000002' },
];

const residentSeeds = [
  { name: 'Balaji', email: 'balaji@hostel.test', phone: '9800000003' },
  { name: 'Prithvi', email: 'prithvi@hostel.test', phone: '9800000004' },
];

async function seed() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB — seeding demo accounts...\n');

  for (const admin of adminSeeds) {
    const existing = await User.findOne({ email: admin.email });
    if (existing) {
      console.log(`Skipped (already exists): ${admin.email}`);
      continue;
    }
    await User.create({ ...admin, password: SEED_PASSWORD, role: 'admin' });
    console.log(`Created admin:    ${admin.email}`);
  }

  for (const staff of staffSeeds) {
    const existing = await User.findOne({ email: staff.email });
    if (existing) {
      console.log(`Skipped (already exists): ${staff.email}`);
      continue;
    }
    await User.create({ ...staff, password: SEED_PASSWORD, role: 'staff' });
    console.log(`Created staff:    ${staff.email}`);
  }

  for (const resident of residentSeeds) {
    const existing = await User.findOne({ email: resident.email });
    if (existing) {
      console.log(`Skipped (already exists): ${resident.email}`);
      continue;
    }
    const user = await User.create({ ...resident, password: SEED_PASSWORD, role: 'resident' });
    await Resident.create({ user: user._id, name: user.name, email: user.email, phone: user.phone });
    console.log(`Created resident: ${resident.email}`);
  }

  console.log(`\nAll seeded accounts use the password: ${SEED_PASSWORD}`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
