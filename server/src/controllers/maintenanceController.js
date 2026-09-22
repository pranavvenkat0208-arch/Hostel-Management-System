const { MaintenanceRequest } = require('../models/MaintenanceRequest');
const { Resident } = require('../models/Resident');
const { ApiError } = require('../utils/ApiError');
const { notifyUser, notifyRole } = require('../services/notificationService');
const { sendEmail } = require('../services/emailService');

async function createRequest(req, res) {
  const resident = await Resident.findOne({ user: req.user.id });
  if (!resident) throw new ApiError(404, 'Resident profile not found');
  if (!resident.currentRoom) {
    throw new ApiError(400, 'You need a room assignment before submitting a maintenance request');
  }

  const { title, description, category, priority } = req.body;

  const request = await MaintenanceRequest.create({
    resident: resident._id,
    room: resident.currentRoom,
    title,
    description,
    category,
    priority,
    status: 'open',
    statusHistory: [{ status: 'open', changedAt: new Date() }],
  });

  notifyRole(['admin', 'staff'], {
    type: 'maintenance',
    title: 'New maintenance request',
    message: `${resident.name} submitted "${title}" (${priority} priority).`,
    link: '/maintenance',
  });

  res.status(201).json({ success: true, request });
}

async function getMyRequests(req, res) {
  const resident = await Resident.findOne({ user: req.user.id });
  if (!resident) throw new ApiError(404, 'Resident profile not found');

  const requests = await MaintenanceRequest.find({ resident: resident._id })
    .populate('room', 'roomNumber')
    .populate('assignedTo', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: requests.length, requests });
}

async function getAllRequests(req, res) {
  const { status, priority, assignedTo } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;

  const requests = await MaintenanceRequest.find(filter)
    .populate('resident', 'name email phone')
    .populate('room', 'roomNumber')
    .populate('assignedTo', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: requests.length, requests });
}

async function getRequest(req, res) {
  const base = await MaintenanceRequest.findById(req.params.id);
  if (!base) throw new ApiError(404, 'Maintenance request not found');

  if (req.user.role === 'resident') {
    const resident = await Resident.findOne({ user: req.user.id });
    if (!resident || !base.resident.equals(resident._id)) {
      throw new ApiError(403, 'You do not have permission to view this request');
    }
  }

  const request = await MaintenanceRequest.findById(req.params.id)
    .populate('resident', 'name email phone')
    .populate('room', 'roomNumber')
    .populate('assignedTo', 'name');

  res.json({ success: true, request });
}

async function assignRequest(req, res) {
  const request = await MaintenanceRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, 'Maintenance request not found');

  request.assignedTo = req.body.assignedTo;

  if (request.status === 'open') {
    request.status = 'in_progress';
    request.statusHistory.push({
      status: 'in_progress',
      note: 'Assigned to staff',
      changedBy: req.user.id,
      changedAt: new Date(),
    });
  }

  await request.save();

  notifyUser({
    recipient: request.assignedTo,
    type: 'maintenance',
    title: 'Maintenance request assigned to you',
    message: `You've been assigned: "${request.title}".`,
    link: '/maintenance',
  });

  res.json({ success: true, request });
}

async function updateStatus(req, res) {
  const request = await MaintenanceRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, 'Maintenance request not found');

  const { status, note } = req.body;
  request.status = status;
  request.statusHistory.push({
    status,
    note,
    changedBy: req.user.id,
    changedAt: new Date(),
  });

  await request.save();

  const resident = await Resident.findById(request.resident);
  if (resident) {
    const readableStatus = status.replace('_', ' ');

    notifyUser({
      recipient: resident.user,
      type: 'maintenance',
      title: 'Maintenance request updated',
      message: `Your request "${request.title}" is now ${readableStatus}.`,
      link: '/maintenance',
    });

    sendEmail({
      to: resident.email,
      subject: `Maintenance Update: ${request.title}`,
      html: `<p>Hi ${resident.name},</p><p>Your maintenance request "<b>${request.title}</b>" is now <b>${readableStatus}</b>.</p>${note ? `<p>Note: ${note}</p>` : ''}`,
    });
  }

  res.json({ success: true, request });
}

module.exports = { createRequest, getMyRequests, getAllRequests, getRequest, assignRequest, updateStatus };
