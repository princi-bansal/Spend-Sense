import React, { useMemo, useState } from 'react';
import {
  Search,
  Pencil,
  Trash2,
  Download,
  Plus,
  RotateCcw,
  ArrowUpDown,
  Check,
  X,
} from 'lucide-react';
import {
  CATEGORY_COLORS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  Transaction,
} from '../../types/finance';
import {
  exportTransactionsToCSV,
  formatDate,
  formatINR,
  formatMonthLabel,
  getMonthKey,
} from '../../utils/formatters';
import { getCategoryIcon, getPaymentIcon } from '../../utils/categoryIcons';

interface TransactionsViewProps {
  transactions: Transaction[];
  selectedMonth: string;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onOpenAdd: (type?: 'expense' | 'income') => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  selectedMonth,
  onEdit,
  onDelete,
  onOpenAdd,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [monthScope, setMonthScope] = useState<'selected' | 'all'>('selected');
  const [sortBy, setSortBy] = useState<'date-desc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const allCategories = useMemo(() => {
    if (typeFilter === 'expense') return EXPENSE_CATEGORIES;
    if (typeFilter === 'income') return INCOME_CATEGORIES;
    return [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
  }, [typeFilter]);

  const filteredTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return transactions
      .filter((tx) => {
        if (monthScope === 'selected' && getMonthKey(tx.date) !== selectedMonth) {
          return false;
        }
        if (typeFilter !== 'all' && tx.type !== typeFilter) {
          return false;
        }
        if (categoryFilter !== 'all' && tx.category !== categoryFilter) {
          return false;
        }
        if (paymentFilter !== 'all' && tx.paymentMethod !== paymentFilter) {
          return false;
        }
        if (q) {
          const matchesTitle = tx.title.toLowerCase().includes(q);
          const matchesCat = tx.category.toLowerCase().includes(q);
          const matchesNotes = (tx.notes ?? '').toLowerCase().includes(q);
          if (!matchesTitle && !matchesCat && !matchesNotes) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return b.date.localeCompare(a.date);
      });
  }, [
    transactions,
    monthScope,
    selectedMonth,
    typeFilter,
    categoryFilter,
    paymentFilter,
    searchQuery,
    sortBy,
  ]);

  const filteredTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const tx of filteredTransactions) {
      if (tx.type === 'income') income += tx.amount;
      else expense += tx.amount;
    }
    return { income, expense };
  }, [filteredTransactions]);

  const hasActiveFilters =
    searchQuery !== '' ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    paymentFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setPaymentFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Filter & Search Toolbar */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Type Segmented Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              {(['all', 'expense', 'income'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setTypeFilter(tab);
                    setCategoryFilter('all');
                  }}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                    typeFilter === tab
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab === 'all' ? 'All Entries' : tab === 'expense' ? 'Expenses' : 'Income'}
                </button>
              ))}
            </div>

            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              <button
                type="button"
                onClick={() => setMonthScope('selected')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                  monthScope === 'selected'
                    ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {formatMonthLabel(selectedMonth, true)}
              </button>
              <button
                type="button"
                onClick={() => setMonthScope('all')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                  monthScope === 'all'
                    ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All History
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onOpenAdd('income')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50 dark:bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Log Income</span>
            </button>
            <button
              type="button"
              onClick={() =>
                exportTransactionsToCSV(
                  filteredTransactions,
                  'spendsense-filtered'
                )
              }
              disabled={filteredTransactions.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:-translate-y-0.5 disabled:opacity-45 transition-all duration-200 whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>Export Filtered CSV</span>
            </button>
          </div>
        </div>

        {/* Search & Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search merchant, category, notes..."
              aria-label="Search transactions"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          >
            <option value="all">All Categories</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            aria-label="Filter by payment method"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          >
            <option value="all">All Payment Methods</option>
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm} value={pm}>
                {pm}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as 'date-desc' | 'amount-desc' | 'amount-asc'
                  )
                }
                aria-label="Sort transactions"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              >
                <option value="date-desc">Newest First</option>
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                title="Reset filters"
                aria-label="Reset filters"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Summary Metadata Strip (Unboxed, clean separators) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing{' '}
            <strong className="font-mono-num text-slate-900 dark:text-white">
              {filteredTransactions.length}
            </strong>{' '}
            {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
          </span>
          <div className="flex flex-wrap items-center gap-3 font-mono-num">
            <span>
              Inflow:{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">
                +{formatINR(filteredTotals.income)}
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Outflow:{' '}
              <strong className="text-orange-600 dark:text-orange-400">
                -{formatINR(filteredTotals.expense)}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Ledger Table / List */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTransactions.map((tx) => {
              const catColor = CATEGORY_COLORS[tx.category] ?? '#64748B';
              const isIncome = tx.type === 'income';
              const isConfirming = confirmDeleteId === tx.id;

              return (
                <div
                  key={tx.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {/* Left: Icon + Title + Unboxed Metadata */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                      style={{
                        backgroundColor: `${catColor}20`,
                        color: catColor,
                      }}
                    >
                      {getCategoryIcon(tx.category, 'h-4 w-4')}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {tx.title}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                        <span>{tx.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          {getPaymentIcon(tx.paymentMethod, 'h-3 w-3')}
                          {tx.paymentMethod}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{formatDate(tx.date)}</span>
                      </div>
                      {tx.notes && (
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 truncate max-w-md">
                          {tx.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount + Edit/Delete Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 pl-13 sm:pl-0 shrink-0">
                    <span
                      className={`font-mono-num text-sm sm:text-base font-bold ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatINR(tx.amount)}
                    </span>

                    {!isConfirming ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(tx)}
                          aria-label={`Edit ${tx.title}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(tx.id)}
                          aria-label={`Delete ${tx.title}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            onDelete(tx.id);
                            setConfirmDeleteId(null);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-700"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          aria-label="Cancel delete"
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <p className="font-display text-base font-semibold text-slate-900 dark:text-white">
              No matching transactions found
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'Try clearing your search query or switching to All History to view entries from other months.'
                : `No transactions have been logged for ${formatMonthLabel(selectedMonth)} yet.`}
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Reset Filters
                </button>
              )}
              <button
                type="button"
                onClick={() => onOpenAdd('expense')}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110"
              >
                Add Transaction
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
