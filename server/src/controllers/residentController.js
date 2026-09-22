const { Resident } = require('../models/Resident');
const { User } = require('../models/User');
const { ApiError } = require('../utils/ApiError');
const { escapeRegex } = require('../utils/escapeRegex');

async function getResidents(req, res) {
  const { status, search } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (search) filter.name = { $regex: escapeRegex(search), $options: 'i' };

  // monthlyRent is used to prefill the room fee on new invoices.
  const residents = await Resident.find(filter).populate('currentRoom', 'roomNumber type monthlyRent').sort({ name: 1 });
  res.json({ success: true, count: residents.length, residents });
}

async function getResident(req, res) {
  const resident = await Resident.findById(req.params.id).populate('currentRoom', 'roomNumber type monthlyRent');
  if (!resident) throw new ApiError(404, 'Resident not found');
  res.json({ success: true, resident });
}

async function updateResident(req, res) {
  const resident = await Resident.findById(req.params.id);
  if (!resident) throw new ApiError(404, 'Resident not found');

  Object.assign(resident, req.body);
  await resident.save();

  res.json({ success: true, resident });
}

// Deletes the resident and their login. They must be checked out first so
// room occupancy stays correct.
async function deleteResident(req, res) {
  const resident = await Resident.findById(req.params.id);
  if (!resident) throw new ApiError(404, 'Resident not found');

  if (resident.currentRoom) {
    throw new ApiError(400, 'Check this resident out of their room before deleting their account');
  }

  await resident.deleteOne();
  await User.deleteOne({ _id: resident.user });

  res.json({ success: true, message: 'Resident deleted' });
}

async function getMyProfile(req, res) {
  const resident = await Resident.findOne({ user: req.user.id }).populate(
    'currentRoom',
    'roomNumber type monthlyRent floor amenities'
  );
  if (!resident) throw new ApiError(404, 'Resident profile not found');
  res.json({ success: true, resident });
}

async function updateMyProfile(req, res) {
  const resident = await Resident.findOne({ user: req.user.id });
  if (!resident) throw new ApiError(404, 'Resident profile not found');

  const { phone, emergencyContact, preferredRoomType } = req.body;
  if (phone !== undefined) resident.phone = phone;
  if (emergencyContact !== undefined) resident.emergencyContact = emergencyContact;
  if (preferredRoomType !== undefined) resident.preferredRoomType = preferredRoomType;
  await resident.save();

  res.json({ success: true, resident });
}

module.exports = { getResidents, getResident, updateResident, deleteResident, getMyProfile, updateMyProfile };
