const { Room, ROOM_TYPES } = require('../models/Room');
const { Resident } = require('../models/Resident');
const { ApiError } = require('../utils/ApiError');
const { escapeRegex } = require('../utils/escapeRegex');
const { notifyRole, notifyUser } = require('../services/notificationService');

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
  if (search) filter.roomNumber = { $regex: escapeRegex(search), $options: 'i' };

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

  // Only notify when the maintenance flag actually changes.
  const maintenanceChanging =
    req.body.underMaintenance !== undefined && req.body.underMaintenance !== room.underMaintenance;

  Object.assign(room, req.body);
  await room.save();

  if (maintenanceChanging) {
    await notifyMaintenanceToggle(room);
  }

  res.json({ success: true, room });
}

// Tell admin/staff and the room's current residents.
async function notifyMaintenanceToggle(room) {
  const readableStatus = room.underMaintenance ? 'placed under maintenance' : 'brought back into service';

  notifyRole(['admin', 'staff'], {
    type: 'room',
    title: room.underMaintenance ? 'Room under maintenance' : 'Room back in service',
    message: `Room ${room.roomNumber} has been ${readableStatus}.`,
    link: '/rooms',
  });

  const residents = await Resident.find({ currentRoom: room._id, status: 'active' });
  residents.forEach((resident) => {
    notifyUser({
      recipient: resident.user,
      type: 'room',
      title: room.underMaintenance ? 'Your room is under maintenance' : 'Your room is back in service',
      message: `Room ${room.roomNumber} has been ${readableStatus}.`,
      link: '/my-room',
    });
  });
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

  const byType = ROOM_TYPES.map((type) => {
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
