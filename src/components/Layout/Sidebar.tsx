import React, { useState } from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  BarChart3,
  RotateCcw,
  X,
  Check,
} from 'lucide-react';
import { NavView } from '../../types/finance';

interface SidebarProps {
  activeView: NavView;
  onSelectView: (view: NavView) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onResetDemoData: () => void;
  transactionCount: number;
}

const NAV_ITEMS: {
  id: NavView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, iconColor: 'text-violet-500 dark:text-violet-400' },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight, iconColor: 'text-teal-500 dark:text-teal-400' },
  { id: 'budgets', label: 'Budgets', icon: PieChart, iconColor: 'text-orange-500 dark:text-orange-400' },
  { id: 'goals', label: 'Savings Goals', icon: Target, iconColor: 'text-emerald-500 dark:text-emerald-400' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, iconColor: 'text-purple-500 dark:text-purple-400' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  mobileOpen,
  onCloseMobile,
  onResetDemoData,
  transactionCount,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  const handleNavClick = (view: NavView) => {
    onSelectView(view);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 px-4 py-6">
      <div>
        {/* Brand Lockup */}
        <div className="flex items-center justify-between px-2 mb-8">
          <button
            type="button"
            onClick={() => handleNavClick('overview')}
            className="flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-xl group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-teal-500 to-orange-500 shadow-md shadow-violet-500/25 transition-transform duration-200 group-hover:scale-105">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 text-white"
                aria-hidden="true"
              >
                <path
                  d="M6 5h11M6 9.5h11M13 5c2.2 0 3.5 1.3 3.5 3.2S15.2 11.5 13 11.5H6l8.5 7.5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <span className="block font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                SpendSense
              </span>
              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                Make Every Rupee Count
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav aria-label="Main navigation" className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-teal-500 text-white shadow-md shadow-violet-500/25'
                    : 'text-slate-600 hover:bg-slate-100/90 hover:translate-x-0.5 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-100'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : item.iconColor
                    }`}
                  />
                  <span>{item.label}</span>
                </span>
                {item.id === 'transactions' && (
                  <span
                    className={`font-mono-num text-xs ${
                      isActive
                        ? 'text-white/90'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {transactionCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Data Utility */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="px-2">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Local Browser Storage
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your ₹ ledger, budgets, and goals save automatically on this device.
          </p>
        </div>

        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5 shrink-0" />
            <span>Reset Sample Data</span>
          </button>
        ) : (
          <div className="rounded-xl bg-slate-100 dark:bg-slate-800/90 p-2.5 space-y-2">
            <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
              Restore default sample data?
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetDemoData();
                  setConfirmReset(false);
                }}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-orange-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-orange-700 transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
                Restore
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="flex-1 rounded-lg bg-white dark:bg-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:w-64 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
