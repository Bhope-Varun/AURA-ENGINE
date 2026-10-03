import React, { useState } from 'react';
import { Database, AlertTriangle, Loader2, Sparkles, X } from 'lucide-react';

export const SeedModal = ({ isOpen, onClose, onConfirm, isSeeding = false }) => {
  const [recordCount, setRecordCount] = useState(50000);
  const [clearExisting, setClearExisting] = useState(true);

  if (!isOpen) return null;

  const handleSeed = () => {
    onConfirm(recordCount, clearExisting);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={isSeeding ? undefined : onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Database Seeder</h3>
              <p className="text-xs text-slate-500">Mass data generation for high-load testing</p>
            </div>
          </div>
          {!isSeeding && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="mt-4 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Generate and bulk-insert realistic product records with random categories, SKUs, pricing, stock levels, and timestamps using bulk MongoDB operations.
          </p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Target Record Volume
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[5000, 25000, 50000].map((count) => (
                  <button
                    key={count}
                    type="button"
                    disabled={isSeeding}
                    onClick={() => setRecordCount(count)}
                    className={`rounded-lg border py-2 text-xs font-medium transition-all ${
                      recordCount === count
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs ring-1 ring-indigo-600'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {count.toLocaleString()} Records
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={clearExisting}
                  disabled={isSeeding}
                  onChange={(e) => setClearExisting(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span>Purge existing database records before seeding</span>
              </label>
            </div>
          </div>

          {recordCount === 50000 && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                Seeding 50,000 records takes ~1 to 3 seconds via chunked bulk insertion. Indexes on SKU, category, and productName are automatically synced.
              </span>
            </div>
          )}

          {isSeeding && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 text-center space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mx-auto" />
              <div className="text-xs font-semibold text-indigo-900">
                Bulk inserting {recordCount.toLocaleString()} products...
              </div>
              <p className="text-[11px] text-indigo-700">
                Writing BSON documents to WiredTiger storage and updating compound indexes.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSeeding}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSeed}
            disabled={isSeeding}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isSeeding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Executing Bulk Seed...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Seed {recordCount.toLocaleString()} Records</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeedModal;
