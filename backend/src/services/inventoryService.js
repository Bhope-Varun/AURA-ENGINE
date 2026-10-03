import Product from '../models/Product.js';

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const getInventoryItems = async ({
  page = 1,
  limit = 50,
  search = '',
  category = '',
  sort = '-lastUpdated',
}) => {
  const sanitizedPage = Math.max(1, parseInt(page, 10) || 1);
  const sanitizedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (sanitizedPage - 1) * sanitizedLimit;

  const query = {};

  if (category && category !== 'All' && category !== 'all') {
    query.category = category;
  }

  if (search && search.trim()) {
    const trimmed = search.trim();
    const regex = new RegExp(escapeRegex(trimmed), 'i');
    query.$or = [{ productName: regex }, { sku: regex }];
  }

  // Determine sort parameters
  let sortOption = { lastUpdated: -1 };
  if (sort) {
    if (typeof sort === 'string') {
      const isDesc = sort.startsWith('-');
      const field = isDesc ? sort.substring(1) : sort;
      const validSortFields = [
        'productName',
        'sku',
        'category',
        'price',
        'cost',
        'stockQuantity',
        'reorderLevel',
        'lastUpdated',
      ];
      if (validSortFields.includes(field)) {
        sortOption = { [field]: isDesc ? -1 : 1 };
      }
    }
  }

  // Execute count and query concurrently with .lean() for performance
  const [totalRecords, data] = await Promise.all([
    Product.countDocuments(query),
    Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(sanitizedLimit)
      .lean(),
  ]);

  const totalPages = Math.ceil(totalRecords / sanitizedLimit) || 1;
  const hasNextPage = sanitizedPage < totalPages;

  return {
    data,
    pagination: {
      totalRecords,
      totalPages,
      currentPage: sanitizedPage,
      hasNextPage,
    },
  };
};

export const getInventoryItemById = async (id) => {
  const product = await Product.findById(id).lean();
  return product;
};

export const createInventoryItem = async (productData) => {
  const normalizedSku = productData.sku.trim().toUpperCase();

  const existingProduct = await Product.findOne({ sku: normalizedSku }).lean();
  if (existingProduct) {
    const error = new Error(`A product with SKU "${normalizedSku}" already exists`);
    error.code = 11000;
    error.keyPattern = { sku: 1 };
    throw error;
  }

  const product = new Product({
    ...productData,
    sku: normalizedSku,
    lastUpdated: new Date(),
  });

  await product.save();
  return product.toObject();
};

export const updateInventoryItem = async (id, updateData) => {
  const normalizedSku = updateData.sku.trim().toUpperCase();

  const existingWithSku = await Product.findOne({
    sku: normalizedSku,
    _id: { $ne: id },
  }).lean();

  if (existingWithSku) {
    const error = new Error(`A product with SKU "${normalizedSku}" already exists`);
    error.code = 11000;
    error.keyPattern = { sku: 1 };
    throw error;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    {
      ...updateData,
      sku: normalizedSku,
      lastUpdated: new Date(),
    },
    { new: true, runValidators: true }
  ).lean();

  return updatedProduct;
};

export const deleteInventoryItem = async (id) => {
  const deleted = await Product.findByIdAndDelete(id).lean();
  return deleted;
};
