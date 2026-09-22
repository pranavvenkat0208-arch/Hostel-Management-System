const dns = require('node:dns');
const mongoose = require('mongoose');
const { env } = require('./env');

async function connectDB() {
  // Node's resolver fails SRV lookups on some Windows networks, so use public DNS for +srv URIs.
  if (env.MONGODB_URI.startsWith('mongodb+srv://')) {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  }

  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
}

module.exports = { connectDB };
