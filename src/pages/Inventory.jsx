import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  X,
  PackageSearch,
  FileSpreadsheet,
} from 'lucide-react';
import inventoryApi from '../services/api.js';
import {
  formatCurrency,
  formatNumber,
  formatDate,
  CATEGORIES,
} from '../utils/formatters.js';
import StatusBadge from '../components/common/StatusBadge.jsx';
import ProductModal from '../components/inventory/ProductModal.jsx';
import DeleteModal from '../components/inventory/DeleteModal.jsx';
import { useToast } from '../context/ToastContext.jsx';

export const Inventory = () => {
  const { refreshTrigger, setRefreshTrigger, setTotalRecords } = useOutletContext();
  const { addToast } = useToast();

  // Query & Pagination State
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    totalRecords: 0,
    totalPages: 1,
    currentPage: 1,
    hasNextPage: false,
  });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortField, setSortField] = useState('lastUpdated');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Jump to page input
  const [jumpPageInput, setJumpPageInput] = useState('');

  // Debounce search input by 350ms to keep queries fast and avoid server hammering
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on new search query
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch paginated inventory
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sortParam = `${sortDirection === 'desc' ? '-' : ''}${sortField}`;
      const response = await inventoryApi.getInventory({
        page,
        limit,
        search: debouncedSearch,
        category: category === 'All' ? '' : category,
        sort: sortParam,
      });

      setProducts(response.data || []);
      setPagination(
        response.pagination || {
          totalRecords: 0,
          totalPages: 1,
          currentPage: page,
          hasNextPage: false,
        }
      );

      if (response.pagination?.totalRecords !== undefined) {
        setTotalRecords(response.pagination.totalRecords);
      }
    } catch (err) {
      console.error('Failed to load inventory products:', err);
      setError(err.message || 'Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, category, sortField, sortDirection, setTotalRecords]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, refreshTrigger]);

  // Handle Sort column click
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(1);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-60 ml-1" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 text-indigo-600 ml-1" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-indigo-600 ml-1" />
    );
  };

  // Create Product handler
  const handleCreateProduct = async (productData) => {
    setIsSubmitting(true);
    try {
      const response = await inventoryApi.createProduct(productData);
      addToast({
        type: 'success',
        title: 'Product Created',
        message: `${response.data.productName} (${response.data.sku}) added successfully.`,
      });
      setIsAddModalOpen(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Product handler
  const handleUpdateProduct = async (productData) => {
    if (!editingProduct) return;
    setIsSubmitting(true);
    try {
      const response = await inventoryApi.updateProduct(editingProduct._id, productData);
      addToast({
        type: 'success',
        title: 'Product Updated',
        message: `${response.data.productName} (${response.data.sku}) updated successfully.`,
      });
      setEditingProduct(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Product handler
  const handleDeleteProduct = async (productId) => {
    setIsDeleting(true);
    try {
      await inventoryApi.deleteProduct(productId);
      addToast({
        type: 'success',
        title: 'Product Deleted',
        message: 'Product removed permanently from database.',
      });
      setDeletingProduct(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Deletion Failed',
        message: err.message || 'Could not delete product.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Pagination navigation
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const targetPage = parseInt(jumpPageInput, 10);
    if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= pagination.totalPages) {
      setPage(targetPage);
      setJumpPageInput('');
    }
  };

  // Export current view as CSV
  const exportToCSV = () => {
    if (!products.length) return;
    const headers = ['Product Name', 'SKU', 'Category', 'Price', 'Cost', 'Stock', 'Reorder Level', 'Status', 'Last Updated'];
    const rows = products.map((p) => [
      `"${p.productName.replace(/"/g, '""')}"`,
      p.sku,
      p.category,
      p.price,
      p.cost,
      p.stockQuantity,
      p.reorderLevel,
      p.stockQuantity === 0 ? 'Out of Stock' : p.stockQuantity <= p.reorderLevel ? 'Low Stock' : 'In Stock',
      new Date(p.lastUpdated).toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_export_page_${page}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Inventory Management
          </h1>
          <p className="text-xs text-slate-500 sm:text-sm">
            High-throughput server-side catalog containing{' '}
            <span className="font-semibold text-slate-800">
              {pagination.totalRecords.toLocaleString()}
            </span>{' '}
            products.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            disabled={products.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50 transition-colors"
            title="Export currently displayed page to CSV"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span className="hidden sm:inline">Export Page</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          {/* Search Input */}
          <div className="relative md:col-span-6 lg:col-span-5">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name or SKU (e.g. ELEC-0001)..."
              className="w-full rounded-xl border border-slate-300 pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3 lg:col-span-4">
            <div className="relative">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="All">All Categories ({CATEGORIES.length})</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Page-Size Selector */}
          <div className="flex items-center gap-2 md:col-span-3 lg:col-span-3 justify-end">
            <span className="text-xs text-slate-500">Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>

            <button
              onClick={fetchProducts}
              disabled={loading}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              title="Refresh table"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Active filter badges */}
        {(debouncedSearch || category !== 'All') && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Active filters:</span>
            {debouncedSearch && (
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                Search: "{debouncedSearch}"
                <button onClick={() => setSearch('')}>
                  <X className="h-3 w-3 hover:text-indigo-900" />
                </button>
              </span>
            )}
            {category !== 'All' && (
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                Category: {category}
                <button onClick={() => setCategory('All')}>
                  <X className="h-3 w-3 hover:text-indigo-900" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearch('');
                setCategory('All');
              }}
              className="text-xs text-slate-400 hover:text-slate-600 underline ml-auto"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Main Data Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 font-semibold text-slate-600 uppercase tracking-wider text-[11px] select-none">
              <tr>
                <th
                  onClick={() => handleSort('productName')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center">
                    <span>Product</span>
                    {getSortIcon('productName')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('sku')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center">
                    <span>SKU</span>
                    {getSortIcon('sku')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('category')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center">
                    <span>Category</span>
                    {getSortIcon('category')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('price')}
                  className="px-4 py-3.5 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end">
                    <span>Price</span>
                    {getSortIcon('price')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cost')}
                  className="px-4 py-3.5 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end">
                    <span>Cost</span>
                    {getSortIcon('cost')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('stockQuantity')}
                  className="px-4 py-3.5 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end">
                    <span>Stock</span>
                    {getSortIcon('stockQuantity')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('reorderLevel')}
                  className="px-4 py-3.5 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end">
                    <span>Reorder</span>
                    {getSortIcon('reorderLevel')}
                  </div>
                </th>
                <th className="px-4 py-3.5">Status</th>
                <th
                  onClick={() => handleSort('lastUpdated')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center">
                    <span>Last Updated</span>
                    {getSortIcon('lastUpdated')}
                  </div>
                </th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="h-4 w-44 bg-slate-200 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-20 bg-slate-200 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-24 bg-slate-200 rounded" />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="h-4 w-14 bg-slate-200 rounded ml-auto" />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="h-4 w-14 bg-slate-200 rounded ml-auto" />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="h-4 w-12 bg-slate-200 rounded ml-auto" />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="h-4 w-10 bg-slate-200 rounded ml-auto" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-20 bg-slate-200 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-24 bg-slate-200 rounded" />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="h-6 w-14 bg-slate-200 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center">
                    <PackageSearch className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No products found</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {search || category !== 'All'
                        ? 'Try clearing or modifying your filter parameters'
                        : 'Database appears to be empty. Use the seeder to populate records.'}
                    </p>
                    {search || category !== 'All' ? (
                      <button
                        onClick={() => {
                          setSearch('');
                          setCategory('All');
                        }}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Reset Filters
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add First Product</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                products.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Name */}
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-xs truncate">
                      <span title={item.productName}>{item.productName}</span>
                    </td>

                    {/* SKU */}
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {item.sku}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 text-slate-600">
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {item.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {formatCurrency(item.price)}
                    </td>

                    {/* Cost */}
                    <td className="px-4 py-3 text-right text-slate-500 font-mono text-xs">
                      {formatCurrency(item.cost)}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatNumber(item.stockQuantity)}
                    </td>

                    {/* Reorder */}
                    <td className="px-4 py-3 text-right text-slate-500 font-mono text-xs">
                      {formatNumber(item.reorderLevel)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge
                        stockQuantity={item.stockQuantity}
                        reorderLevel={item.reorderLevel}
                      />
                    </td>

                    {/* Last Updated */}
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {formatDate(item.lastUpdated)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingProduct(item)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(item)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500">
            Showing{' '}
            <span className="font-semibold text-slate-900">
              {pagination.totalRecords === 0
                ? 0
                : ((pagination.currentPage - 1) * limit + 1).toLocaleString()}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-900">
              {Math.min(pagination.currentPage * limit, pagination.totalRecords).toLocaleString()}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-900">
              {pagination.totalRecords.toLocaleString()}
            </span>{' '}
            products
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick jump to page */}
            <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5 mr-2">
              <span className="text-xs text-slate-500">Page:</span>
              <input
                type="number"
                min="1"
                max={pagination.totalPages}
                value={jumpPageInput}
                onChange={(e) => setJumpPageInput(e.target.value)}
                placeholder={String(pagination.currentPage)}
                className="w-14 rounded-md border border-slate-300 bg-white px-2 py-1 text-center text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-400">/ {pagination.totalPages}</span>
            </form>

            {/* Prev Button */}
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1 || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </button>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      <ProductModal
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        onSubmit={handleUpdateProduct}
        product={editingProduct}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteProduct}
        product={deletingProduct}
        isDeleting={isDeleting}
      />

      {/* Add Product Modal (local toggle for this page) */}
      <ProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateProduct}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Inventory;
