import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Package,
  Boxes,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import inventoryApi from '../services/api.js';
import { formatCurrency, formatNumber } from '../utils/formatters.js';
import StatusBadge from '../components/common/StatusBadge.jsx';

const CHART_COLORS = [
  '#4f46e5', // indigo-600
  '#06b6d4', // cyan-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#8b5cf6', // violet-500
  '#3b82f6', // blue-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#64748b', // slate-500
];

export const Dashboard = () => {
  const { refreshTrigger, setTotalRecords } = useOutletContext();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryApi.getAnalytics();
      setAnalytics(data);
      if (data?.summary?.totalProducts !== undefined) {
        setTotalRecords(data.summary.totalProducts);
      }
    } catch (err) {
      console.error('Failed to load inventory analytics:', err);
      setError(err.message || 'Could not load inventory analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [refreshTrigger]);

  const summary = analytics?.summary || {
    totalProducts: 0,
    totalStock: 0,
    totalInventoryValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  };

  const categoryData = analytics?.categoryBreakdown || [];
  const criticalAlerts = analytics?.criticalAlerts || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Inventory Dashboard
          </h1>
          <p className="text-xs text-slate-500 sm:text-sm mt-0.5">
            Real-time aggregate valuation, stock health metrics, and category breakdown.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/inventory"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
          >
            <span>View All Records</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchAnalytics}
            className="font-semibold underline hover:text-rose-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Products */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Total Products
            </span>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {loading ? (
                <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
              ) : (
                formatNumber(summary.totalProducts)
              )}
            </div>
            <div className="mt-1 flex items-center text-xs text-slate-500">
              <span>Distinct SKUs in catalog</span>
            </div>
          </div>
        </div>

        {/* Total Stock Units */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Total Stock Volume
            </span>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {loading ? (
                <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
              ) : (
                formatNumber(summary.totalStock)
              )}
            </div>
            <div className="mt-1 flex items-center text-xs text-slate-500">
              <span>Total physical units on hand</span>
            </div>
          </div>
        </div>

        {/* Total Inventory Value */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Inventory Valuation
            </span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {loading ? (
                <div className="h-8 w-28 bg-slate-200 rounded animate-pulse" />
              ) : (
                formatCurrency(summary.totalInventoryValue)
              )}
            </div>
            <div className="mt-1 flex items-center text-xs text-emerald-600 font-medium">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              <span>price × stockQuantity</span>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Stock Warnings
            </span>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {loading ? (
                <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
              ) : (
                formatNumber((summary.lowStockCount || 0) + (summary.outOfStockCount || 0))
              )}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="text-amber-700 font-medium">
                {summary.lowStockCount || 0} Low
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-rose-600 font-medium">
                {summary.outOfStockCount || 0} Out of Stock
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Inventory Valuation by Category (Bar Chart) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Inventory Valuation by Category
              </h2>
              <p className="text-xs text-slate-500">
                Aggregated valuation ($ USD) calculated via MongoDB pipeline
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                Loading aggregation data...
              </div>
            ) : categoryData.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                No catalog items available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), 'Total Valuation']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="inventoryValue"
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Product Count by Category (Donut Chart) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">Catalog Distribution</h2>
            <p className="text-xs text-slate-500">Product SKU share by department</p>
          </div>

          <div className="h-56 w-full">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                Loading catalog share...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="productCount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.category}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [formatNumber(val) + ' SKUs', 'Product Count']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-600 max-h-24 overflow-y-auto pr-1">
            {categoryData.slice(0, 8).map((cat, idx) => (
              <div key={cat.category} className="flex items-center gap-1.5 truncate">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                />
                <span className="truncate">{cat.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock by Category (Volume Distribution) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Stock Volume by Category</h2>
            <p className="text-xs text-slate-500">
              Total quantity of units warehouse-ready per department
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
              Loading stock metrics...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value) => [formatNumber(value) + ' units', 'Units on Hand']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="totalStock" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Critical Stock Alerts Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Critical Reorder Alerts
            </h2>
            <p className="text-xs text-slate-500">
              Items at or below defined reorder thresholds requiring replenishment
            </p>
          </div>
          <Link
            to="/inventory"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Manage Inventory</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3 text-right">Price</th>
                <th className="px-6 py-3 text-right">Stock</th>
                <th className="px-6 py-3 text-right">Reorder Level</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    Scanning inventory database for low stock items...
                  </td>
                </tr>
              ) : criticalAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    All items are stocked above their reorder thresholds.
                  </td>
                </tr>
              ) : (
                criticalAlerts.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      {item.productName}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[11px] text-slate-500">
                      {item.sku}
                    </td>
                    <td className="px-6 py-3.5">{item.category}</td>
                    <td className="px-6 py-3.5 text-right font-medium text-slate-900">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-6 py-3.5 text-right font-bold text-rose-600">
                      {formatNumber(item.stockQuantity)}
                    </td>
                    <td className="px-6 py-3.5 text-right text-slate-500">
                      {formatNumber(item.reorderLevel)}
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge
                        stockQuantity={item.stockQuantity}
                        reorderLevel={item.reorderLevel}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
