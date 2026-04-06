const router = require('express').Router();
const auth = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getItems,
  createItem,
  updateItem,
  deleteItem
} = require('../controllers/itemController');

const itemRouter = require('express').Router();

itemRouter.get('/:tripId',  authMiddleware, getItems);
itemRouter.post('/',        authMiddleware, createItem);
itemRouter.put('/:id',      authMiddleware, updateItem);
itemRouter.delete('/:id',   authMiddleware, deleteItem);

module.exports = itemRouter;