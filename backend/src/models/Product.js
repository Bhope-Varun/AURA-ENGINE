import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    cost: {
      type: Number,
      required: [true, 'Cost is required'],
      min: [0, 'Cost cannot be negative'],
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock quantity cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Stock quantity must be an integer',
      },
    },
    reorderLevel: {
      type: Number,
      required: [true, 'Reorder level is required'],
      min: [0, 'Reorder level cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Reorder level must be an integer',
      },
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Compound and auxiliary indexes for high-throughput pagination, filtering, and sorting
productSchema.index({ category: 1, stockQuantity: 1 });
productSchema.index({ lastUpdated: -1 });
productSchema.index({ price: 1 });

// Ensure lastUpdated is refreshed before saving updates
productSchema.pre('save', function () {
  this.lastUpdated = new Date();
  if (this.sku) {
    this.sku = this.sku.toUpperCase();
  }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
