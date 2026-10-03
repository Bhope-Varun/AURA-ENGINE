import { Router } from 'express';
import {
  getInventoryHandler,
  getInventoryItemHandler,
  createInventoryHandler,
  updateInventoryHandler,
  deleteInventoryHandler,
  seedInventoryHandler,
} from '../controllers/inventoryController.js';
import { validateProduct, validateObjectId } from '../middleware/validate.js';

const router = Router();

// Retrieve paginated, sorted, filtered inventory items
router.get('/', getInventoryHandler);

// Seed database with realistic product records
router.post('/seed', seedInventoryHandler);

// Create new inventory item
router.post('/', validateProduct, createInventoryHandler);

// Retrieve single inventory item
router.get('/:id', validateObjectId, getInventoryItemHandler);

// Update inventory item
router.put('/:id', validateObjectId, validateProduct, updateInventoryHandler);

// Delete inventory item
router.delete('/:id', validateObjectId, deleteInventoryHandler);

export default router;
