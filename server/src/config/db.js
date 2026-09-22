const dns = require('node:dns');
const mongoose = require('mongoose');
const { env } = require('./env');

// Atlas connection strings are "mongodb+srv://", which requires resolving a
// DNS SRV record before Mongoose can even open a socket. On some Windows
// setups, Node's bundled resolver fails that specific lookup (ECONNREFUSED)
// against the router's default DNS relay even though the OS's own resolver
// (e.g. `nslookup`) handles it fine. Pointing Node at public DNS servers
// directly sidesteps that — harmless on networks where it already worked.
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function connectDB() {
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
