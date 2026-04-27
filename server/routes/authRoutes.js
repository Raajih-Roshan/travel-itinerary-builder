const router   = require('express').Router();
const auth     = require('../middleware/authMiddleware');
const multer   = require('multer');
const { cloudinary } = require('../config/cloudinary');
const { sendGoodbyeEmail } = require('../config/mailer');
const {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/authController');

const avatarStorage = multer.memoryStorage();
const avatarUpload  = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed for avatar'), false);
    }
  }
});

router.post('/register',           register);
router.post('/login',              login);
router.post('/logout',        auth, logout);
router.get('/profile',        auth, getProfile);
router.put('/profile',        auth, updateProfile);
router.put('/change-password', auth, changePassword);

// POST upload avatar
router.post('/avatar', auth, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No image uploaded' });
    const User = require('../models/User');
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'travel-itinerary-builder/avatars',
          transformation: [
            { width: 200, height: 200, crop: 'fill', gravity: 'face' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: result.secure_url },
      { new: true }
    ).select('-password');
    res.json({ avatar: user.avatar, user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// DELETE account
router.delete('/account', auth, async (req, res) => {
  try {
    const User   = require('../models/User');
    const Trip   = require('../models/Trip');
    const Item   = require('../models/Item');
    const Memory = require('../models/Memory');

    const userId = req.user.id;
    const user   = await User.findById(userId);
    const userName  = user.name;
    const userEmail = user.email;

    const trips = await Trip.find({ owner: userId });
    for (const trip of trips) {
      await Item.deleteMany({ trip: trip._id });
      const memories = await Memory.find({ trip: trip._id });
      for (const memory of memories) {
        try {
          await cloudinary.uploader.destroy(memory.cloudinaryId, {
            resource_type: memory.fileType === 'video' ? 'video' : 'image'
          });
        } catch (e) {
          console.log('Cloudinary delete skipped:', e.message);
        }
      }
      await Memory.deleteMany({ trip: trip._id });
    }

    await Trip.deleteMany({ owner: userId });
    await Trip.updateMany(
      { collaborators: userId },
      { $pull: { collaborators: userId } }
    );
    await User.findByIdAndDelete(userId);

    sendGoodbyeEmail(userEmail, userName);

    // Clear cookie on account deletion
    res.clearCookie('token');
    res.json({ msg: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;