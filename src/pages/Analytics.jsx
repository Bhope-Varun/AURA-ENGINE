import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  BarChart2,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import inventoryApi from '../services/api.js';
import { formatCurrency, formatNumber } from '../utils/formatters.js';

export const Analytics = () => {
  const { refreshTrigger, setTotalRecords } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryApi.getAnalytics();
      setData(response);
      if (response?.summary?.totalProducts !== undefined) {
        setTotalRecords(response.summary.totalProducts);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [refreshTrigger]);

  const summary = data?.summary || {
    totalProducts: 0,
    totalStock: 0,
    totalInventoryValue: 0,
    totalCostValue: 0,
    potentialProfit: 0,
  };

  const categories = data?.categoryBreakdown || [];

  const overallMarginPercent =
    summary.totalInventoryValue > 0
      ? (
          ((summary.totalInventoryValue - summary.totalCostValue) /
            summary.totalInventoryValue) *
          100
        ).toFixed(1)
      : '0.0';

  const exportAnalyticsCSV = () => {
    if (!categories.length) return;
    const headers = [
      'Category',
      'SKU Count',
      'Total Stock Units',
      'Avg Unit Price',
      'Avg Unit Cost',
      'Total Valuation ($)',
      'Total Cost Basis ($)',
      'Gross Margin (%)',
    ];
    const rows = categories.map((c) => {
      const margin =
        c.inventoryValue > 0
          ? (((c.inventoryValue - (c.costValue || 0)) / c.inventoryValue) * 100).toFixed(1)
          : '0.0';
      return [
        `"${c.category}"`,
        c.productCount,
        c.totalStock,
        c.avgPrice,
        c.avgCost || 0,
        c.inventoryValue,
        c.costValue || 0,
        margin,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_analytics_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Inventory Analytics & Financials
          </h1>
          <p className="text-xs text-slate-500 sm:text-sm">
            MongoDB aggregation engine computing capital allocation, gross margins, and category valuation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportAnalyticsCSV}
            disabled={categories.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Export Report</span>
          </button>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Recalculate</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Financial KPI Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Valuation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
            <span>Market Valuation</span>
            <DollarSign className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {loading ? '...' : formatCurrency(summary.totalInventoryValue)}
          </div>
          <div className="mt-1 text-xs text-slate-500">Total selling price value</div>
        </div>

        {/* Cost Basis */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
            <span>Total Cost Basis</span>
            <TrendingUp className="h-4 w-4 text-slate-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {loading ? '...' : formatCurrency(summary.totalCostValue)}
          </div>
          <div className="mt-1 text-xs text-slate-500">Capital invested in stock</div>
        </div>

        {/* Potential Gross Profit */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
            <span>Unrealized Gross Profit</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">
            {loading ? '...' : formatCurrency(summary.potentialProfit)}
          </div>
          <div className="mt-1 text-xs text-emerald-700 font-medium">Valuation minus Cost</div>
        </div>

        {/* Blended Gross Margin */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
            <span>Blended Margin</span>
            <Percent className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {loading ? '...' : `${overallMarginPercent}%`}
          </div>
          <div className="mt-1 text-xs text-slate-500">Across full 50,000 SKU catalog</div>
        </div>
      </div>

      {/* Comparison Chart: Valuation vs Cost Basis by Category */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Revenue Valuation vs Cost Basis by Category
          </h2>
          <p className="text-xs text-slate-500">
            Comparing total realizable retail value against raw inventory cost ($ USD)
          </p>
        </div>

        <div className="h-80 w-full">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
              Aggregating metrics...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categories}
                margin={{ top: 10, right: 20, left: 10, bottom: 30 }}
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
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val, name) => [
                    formatCurrency(val),
                    name === 'inventoryValue' ? 'Total Valuation' : 'Cost Basis',
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                  formatter={(value) =>
                    value === 'inventoryValue' ? 'Retail Valuation ($)' : 'Cost Basis ($)'
                  }
                />
                <Bar
                  dataKey="inventoryValue"
                  fill="#4f46e5"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="costValue"
                  fill="#94a3b8"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Category Breakdown Table with Margin % */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 bg-slate-50/50">
          <h2 className="text-base font-semibold text-slate-900">
            Category Margin & Capital Performance
          </h2>
          <p className="text-xs text-slate-500">
            Computed aggregations on price, cost, volume, and gross margin per department
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5 text-right">SKU Count</th>
                <th className="px-6 py-3.5 text-right">Total Units</th>
                <th className="px-6 py-3.5 text-right">Avg Price</th>
                <th className="px-6 py-3.5 text-right">Avg Cost</th>
                <th className="px-6 py-3.5 text-right">Total Valuation</th>
                <th className="px-6 py-3.5 text-right">Gross Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    Computing analytics across database...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No records found
                  </td>
                </tr>
              ) : (
                categories.map((c) => {
                  const marginPct =
                    c.inventoryValue > 0
                      ? (((c.inventoryValue - (c.costValue || 0)) / c.inventoryValue) * 100).toFixed(1)
                      : '0.0';

                  return (
                    <tr key={c.category} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-slate-900">{c.category}</td>
                      <td className="px-6 py-3.5 text-right font-mono text-xs">
                        {formatNumber(c.productCount)}
                      </td>
                      <td className="px-6 py-3.5 text-right font-mono text-xs">
                        {formatNumber(c.totalStock)}
                      </td>
                      <td className="px-6 py-3.5 text-right font-medium text-slate-900">
                        {formatCurrency(c.avgPrice)}
                      </td>
                      <td className="px-6 py-3.5 text-right text-slate-500 font-mono text-xs">
                        {formatCurrency(c.avgCost)}
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold text-slate-900">
                        {formatCurrency(c.inventoryValue)}
                      </td>
                      <td className="px-6 py-3.5 text-right font-bold text-emerald-600">
                        {marginPct}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
