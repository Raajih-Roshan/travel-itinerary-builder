const router              = require('express').Router();
const auth                = require('../middleware/authMiddleware');
const Memory              = require('../models/Memory');
const { cloudinary, upload } = require('../config/cloudinary');

// GET all memories for a trip
router.get('/:tripId', auth, async (req, res) => {
  try {
    const memories = await Memory.find({ trip: req.params.tripId })
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(memories);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// POST upload a memory to Cloudinary
router.post('/:tripId', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const fileType = req.file.mimetype.startsWith('video') ? 'video' : 'image';

    const memory = await Memory.create({
      trip:         req.params.tripId,
      cloudinaryId: req.file.filename,
      url:          req.file.path,
      fileType,
      caption:      req.body.caption || '',
      uploadedBy:   req.user.id
    });

    const populated = await Memory.findById(memory._id)
      .populate('uploadedBy', 'name');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// DELETE a memory from Cloudinary and DB
router.delete('/:id', auth, async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) return res.status(404).json({ msg: 'Memory not found' });

    // Delete from Cloudinary
    const resourceType = memory.fileType === 'video' ? 'video' : 'image';
    await cloudinary.uploader.destroy(memory.cloudinaryId, {
      resource_type: resourceType
    });

    await Memory.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Memory deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;