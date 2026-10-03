import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  BarChart3,
  X,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Stock KPIs',
    },
    {
      to: '/inventory',
      label: 'Inventory',
      icon: Package,
      description: '50K Data Table & Control',
    },
    {
      to: '/analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Aggregation & Margins',
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-slate-900 text-slate-100 p-4">
      <div>
        {/* Brand */}
        <div className="flex items-center justify-between px-2 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-white text-base tracking-tight">StockMaster</div>
              <div className="text-[11px] text-slate-400 font-mono">v1.0.0 Enterprise</div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0 opacity-80 group-hover:opacity-100" />
                <div className="flex flex-col">
                  <span>{item.label}</span>
                  <span className="text-[10px] text-slate-400 font-normal group-hover:text-slate-300">
                    {item.description}
                  </span>
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Database specs block */}
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium mb-1.5">
            <ShieldCheck className="h-4 w-4" />
            <span>MongoDB WiredTiger</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Optimized for 50,000+ records with B-tree compound indexing, lean projection, and sub-millisecond pagination.
          </p>
          <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60 pt-2 font-mono">
            <span>INDEX: SKU (UNIQUE)</span>
            <span className="text-emerald-400">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-800 pt-3 px-2 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Inventory Core</span>
        <span className="flex items-center gap-1 text-slate-400">
          Node / Express
          <ArrowUpRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden lg:block lg:w-64 lg:shrink-0 lg:border-r lg:border-slate-800">
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
