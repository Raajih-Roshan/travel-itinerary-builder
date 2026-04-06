const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  inviteCollaborator
} = require('../controllers/tripController');

router.get('/',           auth, getAllTrips);
router.get('/:id',        auth, getTripById);
router.post('/',          auth, createTrip);
router.put('/:id',        auth, updateTrip);
router.delete('/:id',     auth, deleteTrip);
router.post('/:id/invite', auth, inviteCollaborator);

// GET trip summary with item counts
router.get('/:id/summary', auth, async (req, res) => {
  try {
    const Item = require('../models/Item');
    const flights    = await Item.countDocuments({ trip: req.params.id, type: 'flight' });
    const hotels     = await Item.countDocuments({ trip: req.params.id, type: 'hotel' });
    const activities = await Item.countDocuments({ trip: req.params.id, type: 'activity' });
    res.json({ flights, hotels, activities, total: flights + hotels + activities });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;