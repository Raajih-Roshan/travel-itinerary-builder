const router         = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getItems,
  createItem,
  updateItem,
  deleteItem
} = require('../controllers/itemController');

router.get('/:tripId',  authMiddleware, getItems);
router.post('/',        authMiddleware, createItem);
router.put('/:id',      authMiddleware, updateItem);
router.delete('/:id',   authMiddleware, deleteItem);

module.exports = router;