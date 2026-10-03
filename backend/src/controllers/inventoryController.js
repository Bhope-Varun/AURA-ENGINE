import {
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '../services/inventoryService.js';
import Product from '../models/Product.js';
import { generateProductsBatch } from '../../scripts/seedGenerator.js';

export const getInventoryHandler = async (req, res, next) => {
  try {
    const { page, limit, search, category, sort } = req.query;
    const result = await getInventoryItems({
      page,
      limit,
      search,
      category,
      sort,
    });
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getInventoryItemHandler = async (req, res, next) => {
  try {
    const product = await getInventoryItemById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json({ data: product });
  } catch (error) {
    next(error);
  }
};

export const createInventoryHandler = async (req, res, next) => {
  try {
    const newProduct = await createInventoryItem(req.validatedBody || req.body);
    return res.status(201).json({
      message: 'Product created successfully',
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInventoryHandler = async (req, res, next) => {
  try {
    const updated = await updateInventoryItem(req.params.id, req.validatedBody || req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json({
      message: 'Product updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteInventoryHandler = async (req, res, next) => {
  try {
    const deleted = await deleteInventoryItem(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json({
      message: 'Product deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

export const seedInventoryHandler = async (req, res, next) => {
  try {
    const count = parseInt(req.body.count || 50000, 10);
    const clearExisting = req.body.clearExisting !== false;

    if (clearExisting) {
      await Product.deleteMany({});
    }

    const batchSize = 5000;
    const batches = Math.ceil(count / batchSize);
    let totalInserted = 0;

    for (let b = 0; b < batches; b++) {
      const currentBatchCount = Math.min(batchSize, count - totalInserted);
      const batch = generateProductsBatch(currentBatchCount, totalInserted);
      await Product.insertMany(batch, { ordered: false });
      totalInserted += currentBatchCount;
    }

    return res.status(200).json({
      message: `Successfully seeded ${totalInserted.toLocaleString()} products`,
      totalRecords: totalInserted,
    });
  } catch (error) {
    next(error);
  }
};
