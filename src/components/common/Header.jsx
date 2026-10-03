import React from 'react';
import { Menu, Database, Plus, RefreshCw } from 'lucide-react';

export const Header = ({ onOpenSidebar, onOpenAddModal, onOpenSeedModal, totalRecords = null }) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          aria-label="Open navigation sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm tracking-wider shadow-sm shadow-indigo-200">
            SM
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
              StockMaster
            </h1>
            <p className="hidden text-xs text-slate-500 sm:block">Enterprise Inventory Operations</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live database indicator */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Database className="h-3.5 w-3.5 text-slate-500" />
          <span>
            MongoDB Connected
            {totalRecords !== null && (
              <span className="font-semibold text-slate-900 ml-1">
                ({totalRecords.toLocaleString()} items)
              </span>
            )}
          </span>
        </div>

        {/* Database Seeder Button */}
        <button
          type="button"
          onClick={onOpenSeedModal}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          title="Seed 50,000 realistic products into MongoDB"
        >
          <RefreshCw className="h-3.5 w-3.5 text-indigo-600" />
          <span className="hidden md:inline">Seed 50,000 Records</span>
          <span className="md:hidden">Seed 50K</span>
        </button>

        {/* Add Product Button */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
