const router = require('express').Router();
const auth   = require('../middleware/authMiddleware');
const Item   = require('../models/Item');

// GET all items for a trip
router.get('/:tripId', auth, async (req, res) => {
  try {
    const items = await Item.find({ trip: req.params.tripId })
      .populate('addedBy', 'name email')
      .sort({ date: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// POST add new item to a trip
router.post('/', auth, async (req, res) => {
  try {
    const item = await Item.create({
      ...req.body,
      addedBy: req.user.id
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// PUT update an item
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(item);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// DELETE an item
router.delete('/:id', auth, async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;