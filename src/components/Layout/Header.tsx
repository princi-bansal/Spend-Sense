import React from 'react';
import {
  Menu,
  Plus,
  Download,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { NavView } from '../../types/finance';
import { formatMonthLabel, shiftMonthKey } from '../../utils/formatters';

interface HeaderProps {
  activeView: NavView;
  selectedMonth: string;
  onChangeMonth: (monthKey: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenAddModal: () => void;
  onExportCSV: () => void;
  onOpenMobileMenu: () => void;
}

const VIEW_TITLES: Record<NavView, string> = {
  overview: 'Financial Overview',
  transactions: 'Transactions Ledger',
  budgets: 'Monthly Budget Planner',
  goals: 'Savings Goals',
  analytics: 'Spending Analytics',
};

export const Header: React.FC<HeaderProps> = ({
  activeView,
  selectedMonth,
  onChangeMonth,
  isDark,
  onToggleTheme,
  onOpenAddModal,
  onExportCSV,
  onOpenMobileMenu,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Left Zone: Mobile Toggle + Title + Month Selector */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="lg:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
              {VIEW_TITLES[activeView]}
            </h1>
          </div>

          {/* Month Switcher */}
          <div className="hidden sm:flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700/90 bg-slate-50 dark:bg-slate-800/70 p-1 ml-2 shrink-0">
            <button
              type="button"
              onClick={() => onChangeMonth(shiftMonthKey(selectedMonth, -1))}
              aria-label="Previous month"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap min-w-[110px] text-center">
              {formatMonthLabel(selectedMonth)}
            </span>
            <button
              type="button"
              onClick={() => onChangeMonth(shiftMonthKey(selectedMonth, 1))}
              aria-label="Next month"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right Zone: Theme Toggle + Export CSV + Primary CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-violet-600" />}
          </button>

          <button
            type="button"
            onClick={onExportCSV}
            className="hidden md:inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <Download className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-teal-500 px-4 text-xs sm:text-sm font-semibold text-white shadow-md shadow-violet-500/25 hover:brightness-110 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/30 active:scale-[0.98] transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Mobile Month Switcher Bar (compact single row on < sm) */}
      <div className="sm:hidden flex items-center justify-between border-t border-slate-200/70 dark:border-slate-800 px-4 py-2 bg-slate-50/80 dark:bg-slate-900/60">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onChangeMonth(shiftMonthKey(selectedMonth, -1))}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-2 text-xs font-semibold text-slate-800 dark:text-slate-100">
            {formatMonthLabel(selectedMonth)}
          </span>
          <button
            type="button"
            onClick={() => onChangeMonth(shiftMonthKey(selectedMonth, 1))}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={onExportCSV}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
        >
          <Download className="h-3.5 w-3.5" />
          <span>CSV</span>
        </button>
      </div>
    </header>
  );
};
