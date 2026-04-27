const Trip = require('../models/Trip');
const User = require('../models/User');
const { sendInviteEmail } = require('../config/mailer');

exports.getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find({
      $or: [{ owner: req.user.id }, { collaborators: req.user.id }]
    }).populate('owner collaborators', 'name email');
    res.json(trips);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('owner collaborators', 'name email');
    if (!trip) return res.status(404).json({ msg: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.createTrip = async (req, res) => {
  try {
    if (!req.body.title)
      return res.status(400).json({ msg: 'Trip title is required' });
    const trip = await Trip.create({ ...req.body, owner: req.user.id });
    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );

    // Emit to all users in the trip room
    const io = req.app.get('io');
    io.to(req.params.id).emit('trip_updated', trip);

    res.json(trip);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    await Trip.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Trip deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.inviteCollaborator = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: 'Email is required' });

    const userToInvite = await User.findOne({ email });
    if (!userToInvite)
      return res.status(404).json({ msg: 'No user found with that email' });

    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ msg: 'Trip not found' });

    if (trip.owner.toString() === userToInvite._id.toString())
      return res.status(400).json({ msg: 'User is already the trip owner' });

    if (trip.collaborators.includes(userToInvite._id))
      return res.status(400).json({ msg: 'User is already a collaborator' });

    trip.collaborators.push(userToInvite._id);
    await trip.save();

    const inviter = await User.findById(req.user.id);
    sendInviteEmail(email, inviter.name, trip.title, trip._id);

    const updatedTrip = await Trip.findById(req.params.id)
      .populate('owner collaborators', 'name email');

    // Emit to all users in the trip room
    const io = req.app.get('io');
    io.to(req.params.id).emit('collaborator_added', updatedTrip);

    res.json(updatedTrip);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};