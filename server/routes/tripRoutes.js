const router = require('express').Router();
const auth   = require('../middleware/authMiddleware');
const Trip   = require('../models/Trip');
const Item   = require('../models/Item');
const {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  inviteCollaborator
} = require('../controllers/tripController');

router.get('/',            auth, getAllTrips);
router.get('/:id',         auth, getTripById);
router.post('/',           auth, createTrip);
router.put('/:id',         auth, updateTrip);
router.delete('/:id',      auth, deleteTrip);
router.post('/:id/invite', auth, inviteCollaborator);

// GET item counts summary
router.get('/:id/summary', auth, async (req, res) => {
  try {
    const flights    = await Item.countDocuments({ trip: req.params.id, type: 'flight' });
    const hotels     = await Item.countDocuments({ trip: req.params.id, type: 'hotel' });
    const activities = await Item.countDocuments({ trip: req.params.id, type: 'activity' });
    res.json({ flights, hotels, activities, total: flights + hotels + activities });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// GET budget summary
router.get('/:id/budget', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).lean();
    if (!trip) return res.status(404).json({ msg: 'Trip not found' });

    const items = await Item.find({ trip: req.params.id }).lean();

    const getCost = (item) => {
      const n = Number(item.cost);
      return isNaN(n) ? 0 : n;
    };

    const spent   = items.reduce((s, i) => s + getCost(i), 0);
    const budget  = Number(trip.budget) || 0;

    res.json({
      budget,
      spent,
      remaining:  budget - spent,
      percentage: budget > 0 ? Math.round((spent / budget) * 100) : 0,
      breakdown: {
        flights:    items.filter(i => i.type === 'flight')
                         .reduce((s, i) => s + getCost(i), 0),
        hotels:     items.filter(i => i.type === 'hotel')
                         .reduce((s, i) => s + getCost(i), 0),
        activities: items.filter(i => i.type === 'activity')
                         .reduce((s, i) => s + getCost(i), 0),
      }
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// PUT set/update budget
router.put('/:id/budget', auth, async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { budget: Number(req.body.budget) || 0 },
      { new: true }
    );
    res.json(trip);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;