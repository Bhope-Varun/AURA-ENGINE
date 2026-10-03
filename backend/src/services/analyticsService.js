import Product from '../models/Product.js';

export const getInventoryAnalytics = async () => {
  const [analyticsResult] = await Product.aggregate([
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalProducts: { $sum: 1 },
              totalStock: { $sum: '$stockQuantity' },
              totalInventoryValue: {
                $sum: { $multiply: ['$price', '$stockQuantity'] },
              },
              totalCostValue: {
                $sum: { $multiply: ['$cost', '$stockQuantity'] },
              },
              lowStockCount: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $gt: ['$stockQuantity', 0] },
                        { $lte: ['$stockQuantity', '$reorderLevel'] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              outOfStockCount: {
                $sum: {
                  $cond: [{ $eq: ['$stockQuantity', 0] }, 1, 0],
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              totalProducts: 1,
              totalStock: 1,
              totalInventoryValue: { $round: ['$totalInventoryValue', 2] },
              totalCostValue: { $round: ['$totalCostValue', 2] },
              lowStockCount: 1,
              outOfStockCount: 1,
            },
          },
        ],
        categoryBreakdown: [
          {
            $group: {
              _id: '$category',
              productCount: { $sum: 1 },
              totalStock: { $sum: '$stockQuantity' },
              inventoryValue: {
                $sum: { $multiply: ['$price', '$stockQuantity'] },
              },
              costValue: {
                $sum: { $multiply: ['$cost', '$stockQuantity'] },
              },
              avgPrice: { $avg: '$price' },
              avgCost: { $avg: '$cost' },
            },
          },
          {
            $project: {
              _id: 0,
              category: '$_id',
              productCount: 1,
              totalStock: 1,
              inventoryValue: { $round: ['$inventoryValue', 2] },
              costValue: { $round: ['$costValue', 2] },
              avgPrice: { $round: ['$avgPrice', 2] },
              avgCost: { $round: ['$avgCost', 2] },
            },
          },
          {
            $sort: { inventoryValue: -1 },
          },
        ],
        criticalAlerts: [
          {
            $match: {
              $expr: { $lte: ['$stockQuantity', '$reorderLevel'] },
            },
          },
          {
            $sort: { stockQuantity: 1 },
          },
          {
            $limit: 10,
          },
          {
            $project: {
              _id: 1,
              productName: 1,
              sku: 1,
              category: 1,
              price: 1,
              stockQuantity: 1,
              reorderLevel: 1,
              lastUpdated: 1,
            },
          },
        ],
      },
    },
  ]);

  const summary = analyticsResult?.summary?.[0] || {
    totalProducts: 0,
    totalStock: 0,
    totalInventoryValue: 0,
    totalCostValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  };

  const categoryBreakdown = analyticsResult?.categoryBreakdown || [];
  const criticalAlerts = analyticsResult?.criticalAlerts || [];

  return {
    summary: {
      ...summary,
      potentialProfit: Math.max(0, Number((summary.totalInventoryValue - summary.totalCostValue).toFixed(2))),
    },
    categoryBreakdown,
    criticalAlerts,
  };
};
