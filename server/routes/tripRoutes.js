const router = require('express').Router();
const auth   = require('../middleware/authMiddleware');
const Trip   = require('../models/Trip');

// GET all trips for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const trips = await Trip.find({
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ]
    }).populate('owner collaborators', 'name email');
    res.json(trips);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// GET single trip by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('owner collaborators', 'name email');
    if (!trip) return res.status(404).json({ msg: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// POST create new trip
router.post('/', auth, async (req, res) => {
  try {
    const trip = await Trip.create({
      ...req.body,
      owner: req.user.id
    });
    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// PUT update trip
router.put('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(trip);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// DELETE trip
router.delete('/:id', auth, async (req, res) => {
  try {
    await Trip.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Trip deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;