const { Room } = require('../models/Room');
const { ApiError } = require('../utils/ApiError');

async function createRoom(req, res) {
  const { roomNumber } = req.body;

  const existing = await Room.findOne({ roomNumber });
  if (existing) throw new ApiError(409, `Room ${roomNumber} already exists`);

  const room = await Room.create(req.body);
  res.status(201).json({ success: true, room });
}

async function getRooms(req, res) {
  const { type, availability, search } = req.query;

  const filter = {};
  if (type) filter.type = type;
  if (search) filter.roomNumber = { $regex: search, $options: 'i' };

  let rooms = await Room.find(filter).sort({ roomNumber: 1 });

  if (availability === 'available') {
    rooms = rooms.filter((r) => !r.underMaintenance && r.occupied < r.capacity);
  } else if (availability === 'full') {
    rooms = rooms.filter((r) => r.occupied >= r.capacity);
  } else if (availability === 'maintenance') {
    rooms = rooms.filter((r) => r.underMaintenance);
  }

  res.json({ success: true, count: rooms.length, rooms });
}

async function getRoom(req, res) {
  const room = await Room.findById(req.params.id);
  if (!room) throw new ApiError(404, 'Room not found');
  res.json({ success: true, room });
}

async function updateRoom(req, res) {
  const room = await Room.findById(req.params.id);
  if (!room) throw new ApiError(404, 'Room not found');

  const { capacity } = req.body;
  if (capacity !== undefined && capacity < room.occupied) {
    throw new ApiError(400, `Cannot set capacity below current occupancy (${room.occupied})`);
  }

  Object.assign(room, req.body);
  await room.save();

  res.json({ success: true, room });
}

async function deleteRoom(req, res) {
  const room = await Room.findById(req.params.id);
  if (!room) throw new ApiError(404, 'Room not found');
  if (room.occupied > 0) throw new ApiError(400, 'Cannot delete a room that currently has residents');

  await room.deleteOne();
  res.json({ success: true, message: 'Room deleted' });
}

async function getOccupancySummary(_req, res) {
  const rooms = await Room.find();

  const totalRooms = rooms.length;
  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
  const totalOccupied = rooms.reduce((sum, r) => sum + r.occupied, 0);
  const underMaintenance = rooms.filter((r) => r.underMaintenance).length;
  const occupancyRate = totalCapacity > 0 ? Number(((totalOccupied / totalCapacity) * 100).toFixed(1)) : 0;

  const byType = ['single', 'double', 'triple', 'dormitory'].map((type) => {
    const roomsOfType = rooms.filter((r) => r.type === type);
    const capacity = roomsOfType.reduce((sum, r) => sum + r.capacity, 0);
    const occupied = roomsOfType.reduce((sum, r) => sum + r.occupied, 0);
    return { type, rooms: roomsOfType.length, capacity, occupied };
  });

  res.json({
    success: true,
    summary: { totalRooms, totalCapacity, totalOccupied, occupancyRate, underMaintenance, byType },
  });
}

module.exports = { createRoom, getRooms, getRoom, updateRoom, deleteRoom, getOccupancySummary };
