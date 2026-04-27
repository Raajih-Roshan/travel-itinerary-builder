const Item = require('../models/Item');

exports.getItems = async (req, res) => {
  try {
    const items = await Item.find({ trip: req.params.tripId })
      .populate('addedBy', 'name email')
      .sort({ date: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.createItem = async (req, res) => {
  try {
    if (!req.body.title)
      return res.status(400).json({ msg: 'Item title is required' });

    const item = await Item.create({ ...req.body, addedBy: req.user.id });
    const populated = await Item.findById(item._id)
      .populate('addedBy', 'name email');

    // Emit to all users in the trip room
    const io = req.app.get('io');
    io.to(req.body.trip).emit('item_added', populated);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    ).populate('addedBy', 'name email');

    // Emit to all users in the trip room
    const io = req.app.get('io');
    io.to(item.trip.toString()).emit('item_updated', item);

    res.json(item);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item not found' });

    const tripId = item.trip.toString();
    await Item.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    io.to(tripId).emit('item_deleted', {
      itemId:    req.params.id,
      deletedBy: req.user.id.toString()
    });

    res.json({ msg: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};