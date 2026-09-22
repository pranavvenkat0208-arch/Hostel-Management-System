const { Allocation } = require('../models/Allocation');
const { Room } = require('../models/Room');
const { Resident } = require('../models/Resident');
const { ApiError } = require('../utils/ApiError');
const { notifyUser } = require('../services/notificationService');
const { sendEmail } = require('../services/emailService');

// Shared by check-in and room-change — both end with the resident newly
// settled into a room, so both should tell them the same way.
function announceRoomAssignment(resident, room, checkInDate) {
  notifyUser({
    recipient: resident.user,
    type: 'allocation',
    title: 'Room assigned',
    message: `You have been checked into Room ${room.roomNumber}.`,
    link: '/my-room',
  });

  sendEmail({
    to: resident.email,
    subject: 'Room Assignment Confirmation',
    html: `<p>Hi ${resident.name},</p><p>You have been checked into <b>Room ${room.roomNumber}</b> (${room.type}), effective ${checkInDate.toLocaleDateString()}.</p><p>Monthly rent: ₹${room.monthlyRent}.</p>`,
  });
}

async function allocateRoom(req, res) {
  const { residentId, roomId, checkInDate, notes } = req.body;

  const resident = await Resident.findById(residentId);
  if (!resident) throw new ApiError(404, 'Resident not found');
  if (resident.currentRoom) throw new ApiError(400, 'Resident already has an active room allocation');

  const room = await Room.findById(roomId);
  if (!room) throw new ApiError(404, 'Room not found');
  if (room.underMaintenance) throw new ApiError(400, 'This room is under maintenance');
  if (room.occupied >= room.capacity) throw new ApiError(400, 'This room is already full');

  const allocation = await Allocation.create({
    resident: resident._id,
    room: room._id,
    checkInDate: checkInDate ?? new Date(),
    allocatedBy: req.user.id,
    notes,
  });

  room.occupied += 1;
  await room.save();

  resident.currentRoom = room._id;
  resident.status = 'active';
  await resident.save();

  announceRoomAssignment(resident, room, allocation.checkInDate);

  res.status(201).json({ success: true, allocation });
}

async function checkOut(req, res) {
  const { residentId, notes } = req.body;

  const resident = await Resident.findById(residentId);
  if (!resident) throw new ApiError(404, 'Resident not found');
  if (!resident.currentRoom) throw new ApiError(400, 'Resident does not currently have a room');

  const allocation = await Allocation.findOne({ resident: resident._id, status: 'active' });
  if (allocation) {
    allocation.status = 'checked_out';
    allocation.checkOutDate = new Date();
    if (notes) allocation.notes = notes;
    await allocation.save();
  }

  const room = await Room.findById(resident.currentRoom);
  if (room) {
    room.occupied = Math.max(0, room.occupied - 1);
    await room.save();
  }

  resident.currentRoom = null;
  resident.status = 'checked_out';
  await resident.save();

  notifyUser({
    recipient: resident.user,
    type: 'allocation',
    title: 'Checked out',
    message: room ? `You have been checked out of Room ${room.roomNumber}.` : 'You have been checked out.',
    link: '/my-room',
  });

  res.json({ success: true, message: 'Resident checked out', allocation });
}

async function changeRoom(req, res) {
  const { residentId, newRoomId, notes } = req.body;

  const resident = await Resident.findById(residentId);
  if (!resident) throw new ApiError(404, 'Resident not found');
  if (!resident.currentRoom) throw new ApiError(400, 'Resident does not currently have a room to change from');

  const newRoom = await Room.findById(newRoomId);
  if (!newRoom) throw new ApiError(404, 'New room not found');
  if (newRoom.underMaintenance) throw new ApiError(400, 'This room is under maintenance');
  if (newRoom.occupied >= newRoom.capacity) throw new ApiError(400, 'This room is already full');
  if (newRoom._id.equals(resident.currentRoom)) throw new ApiError(400, 'Resident is already in this room');

  // Close out the old allocation and free up the old room.
  const oldAllocation = await Allocation.findOne({ resident: resident._id, status: 'active' });
  if (oldAllocation) {
    oldAllocation.status = 'checked_out';
    oldAllocation.checkOutDate = new Date();
    await oldAllocation.save();

    const oldRoom = await Room.findById(oldAllocation.room);
    if (oldRoom) {
      oldRoom.occupied = Math.max(0, oldRoom.occupied - 1);
      await oldRoom.save();
    }
  }

  const allocation = await Allocation.create({
    resident: resident._id,
    room: newRoom._id,
    checkInDate: new Date(),
    allocatedBy: req.user.id,
    notes,
  });

  newRoom.occupied += 1;
  await newRoom.save();

  resident.currentRoom = newRoom._id;
  await resident.save();

  announceRoomAssignment(resident, newRoom, allocation.checkInDate);

  res.json({ success: true, allocation });
}

async function getAllocationHistory(req, res) {
  const { residentId, roomId } = req.query;

  const filter = {};
  if (residentId) filter.resident = residentId;
  if (roomId) filter.room = roomId;

  const allocations = await Allocation.find(filter)
    .populate('resident', 'name email')
    .populate('room', 'roomNumber type')
    .populate('allocatedBy', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: allocations.length, allocations });
}

module.exports = { allocateRoom, checkOut, changeRoom, getAllocationHistory };
