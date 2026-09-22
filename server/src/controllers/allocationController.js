const { Allocation } = require('../models/Allocation');
const { Room } = require('../models/Room');
const { Resident } = require('../models/Resident');
const { ApiError } = require('../utils/ApiError');
const { notifyUser, notifyRole } = require('../services/notificationService');
const { sendEmail } = require('../services/emailService');
const { html } = require('../utils/html');

// Used by both check-in and room change.
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
    html: html`<p>Hi ${resident.name},</p><p>You have been checked into <b>Room ${room.roomNumber}</b> (${room.type}), effective ${checkInDate.toLocaleDateString()}.</p><p>Monthly rent: ₹${room.monthlyRent}.</p>`,
  });
}

// When a full room frees up a bed, tell admin/staff and any roomless resident
// who prefers that room type.
async function notifyIfRoomFreedUp(room, wasFull) {
  // Nobody can move into a room under maintenance, so don't announce it.
  if (room.underMaintenance) return;
  if (!wasFull || room.occupied >= room.capacity) return;

  notifyRole(['admin', 'staff'], {
    type: 'room',
    title: 'Room now available',
    message: `Room ${room.roomNumber} (${room.type}) has a free bed.`,
    link: '/rooms',
  });

  const waitingResidents = await Resident.find({
    currentRoom: null,
    status: 'active',
    preferredRoomType: room.type,
  });
  waitingResidents.forEach((resident) => {
    notifyUser({
      recipient: resident.user,
      type: 'room',
      title: 'A room matching your preference opened up',
      message: `Room ${room.roomNumber} (${room.type}) now has a free bed.`,
      link: '/my-room',
    });
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
    const wasFull = room.occupied >= room.capacity;
    room.occupied = Math.max(0, room.occupied - 1);
    await room.save();
    await notifyIfRoomFreedUp(room, wasFull);
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
      const wasFull = oldRoom.occupied >= oldRoom.capacity;
      oldRoom.occupied = Math.max(0, oldRoom.occupied - 1);
      await oldRoom.save();
      await notifyIfRoomFreedUp(oldRoom, wasFull);
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
