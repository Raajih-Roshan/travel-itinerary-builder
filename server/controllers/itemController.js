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
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};