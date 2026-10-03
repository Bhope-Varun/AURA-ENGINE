import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Loader2, Save } from 'lucide-react';
import { CATEGORIES } from '../../utils/formatters.js';

export const ProductModal = ({ isOpen, onClose, onSubmit, product = null, isSubmitting = false }) => {
  const isEditing = Boolean(product && product._id);

  const [formData, setFormData] = useState({
    productName: '',
    sku: '',
    category: CATEGORIES[0],
    price: '',
    cost: '',
    stockQuantity: '',
    reorderLevel: '15',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        productName: product.productName || '',
        sku: product.sku || '',
        category: product.category || CATEGORIES[0],
        price: product.price !== undefined ? String(product.price) : '',
        cost: product.cost !== undefined ? String(product.cost) : '',
        stockQuantity: product.stockQuantity !== undefined ? String(product.stockQuantity) : '',
        reorderLevel: product.reorderLevel !== undefined ? String(product.reorderLevel) : '15',
      });
    } else {
      setFormData({
        productName: '',
        sku: '',
        category: CATEGORIES[0],
        price: '',
        cost: '',
        stockQuantity: '50',
        reorderLevel: '15',
      });
    }
    setErrors({});
    setServerError('');
  }, [product, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    } else if (!/^[A-Za-z0-9-_]+$/.test(formData.sku.trim())) {
      newErrors.sku = 'SKU can only contain letters, numbers, hyphens, and underscores';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    const priceNum = parseFloat(formData.price);
    const costNum = parseFloat(formData.cost);
    const stockNum = parseInt(formData.stockQuantity, 10);
    const reorderNum = parseInt(formData.reorderLevel, 10);

    if (isNaN(priceNum)) {
      newErrors.price = 'Valid price is required';
    } else if (priceNum < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    if (isNaN(costNum)) {
      newErrors.cost = 'Valid cost is required';
    } else if (costNum < 0) {
      newErrors.cost = 'Cost cannot be negative';
    }

    if (!isNaN(priceNum) && !isNaN(costNum) && priceNum < costNum) {
      newErrors.price = 'Price cannot be lower than cost';
    }

    if (isNaN(stockNum)) {
      newErrors.stockQuantity = 'Stock quantity is required';
    } else if (stockNum < 0) {
      newErrors.stockQuantity = 'Stock quantity cannot be negative';
    }

    if (isNaN(reorderNum)) {
      newErrors.reorderLevel = 'Reorder level is required';
    } else if (reorderNum < 0) {
      newErrors.reorderLevel = 'Reorder level cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        productName: formData.productName.trim(),
        sku: formData.sku.trim().toUpperCase(),
        category: formData.category,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        stockQuantity: parseInt(formData.stockQuantity, 10),
        reorderLevel: parseInt(formData.reorderLevel, 10),
      };

      await onSubmit(payload);
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const fieldErrorMap = {};
        err.errors.forEach((e) => {
          fieldErrorMap[e.field] = e.message;
        });
        setErrors(fieldErrorMap);
      }
      setServerError(err.message || 'Operation failed. Please review the inputs.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-xs text-slate-500">
              {isEditing
                ? `Updating product SKU ${product?.sku || ''}`
                : 'Register a new SKU into the enterprise inventory registry'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {serverError && (
          <div className="mx-6 mt-4 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1 font-medium">{serverError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="e.g. Apex Studio Monitor X400"
              className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-2 ${
                errors.productName
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
              }`}
            />
            {errors.productName && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.productName}</p>
            )}
          </div>

          {/* SKU and Category Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                SKU <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g. AUD-001094"
                className={`w-full uppercase font-mono rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-2 ${
                  errors.sku
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
                }`}
              />
              {errors.sku && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.sku}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price and Cost Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Selling Price ($) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-2 ${
                  errors.price
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
                }`}
              />
              {errors.price && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Unit Cost ($) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                placeholder="0.00"
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-2 ${
                  errors.cost
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
                }`}
              />
              {errors.cost && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.cost}</p>
              )}
            </div>
          </div>

          {/* Stock Quantity and Reorder Level Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Stock Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="0"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                placeholder="0"
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-2 ${
                  errors.stockQuantity
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
                }`}
              />
              {errors.stockQuantity && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.stockQuantity}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Reorder Threshold <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="0"
                name="reorderLevel"
                value={formData.reorderLevel}
                onChange={handleChange}
                placeholder="10"
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-2 ${
                  errors.reorderLevel
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
                }`}
              />
              {errors.reorderLevel && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.reorderLevel}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{isEditing ? 'Save Changes' : 'Create Product'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
