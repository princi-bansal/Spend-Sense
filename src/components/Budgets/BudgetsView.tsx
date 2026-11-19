import React, { useMemo, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
} from 'lucide-react';
import {
  Budget,
  CATEGORY_COLORS,
  EXPENSE_CATEGORIES,
  ExpenseCategory,
  Transaction,
} from '../../types/finance';
import { formatINR, formatMonthLabel, getMonthKey } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';

interface BudgetsViewProps {
  budgets: Budget[];
  transactions: Transaction[];
  selectedMonth: string;
  onSaveBudget: (category: ExpenseCategory, limit: number) => void;
  onDeleteBudget: (category: ExpenseCategory) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  transactions,
  selectedMonth,
  onSaveBudget,
  onDeleteBudget,
}) => {
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(
    null
  );
  const [editValue, setEditValue] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('Other');
  const [newLimit, setNewLimit] = useState('');

  const spentByCategory = useMemo(() => {
    const map = new Map<ExpenseCategory, number>();
    for (const tx of transactions) {
      if (tx.type === 'expense' && getMonthKey(tx.date) === selectedMonth) {
        const cat = tx.category as ExpenseCategory;
        map.set(cat, (map.get(cat) ?? 0) + tx.amount);
      }
    }
    return map;
  }, [transactions, selectedMonth]);

  const unbudgetedCategories = useMemo(() => {
    const budgetedSet = new Set(budgets.map((b) => b.category));
    return EXPENSE_CATEGORIES.filter((c) => !budgetedSet.has(c));
  }, [budgets]);

  const totals = useMemo(() => {
    let totalBudget = 0;
    let totalTrackedSpend = 0;
    for (const b of budgets) {
      totalBudget += b.limit;
      totalTrackedSpend += spentByCategory.get(b.category) ?? 0;
    }
    const remaining = totalBudget - totalTrackedSpend;
    const pct = totalBudget > 0 ? (totalTrackedSpend / totalBudget) * 100 : 0;
    return { totalBudget, totalTrackedSpend, remaining, pct };
  }, [budgets, spentByCategory]);

  const startEdit = (budget: Budget) => {
    setEditingCategory(budget.category);
    setEditValue(String(budget.limit));
  };

  const commitEdit = (category: ExpenseCategory) => {
    const num = parseFloat(editValue);
    if (!isNaN(num) && num > 0) {
      onSaveBudget(category, Math.round(num));
    }
    setEditingCategory(null);
  };

  const handleOpenAdd = () => {
    if (unbudgetedCategories.length > 0) {
      setNewCategory(unbudgetedCategories[0]);
    }
    setNewLimit('');
    setShowAddForm(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(newLimit);
    if (isNaN(num) || num <= 0) return;
    onSaveBudget(newCategory, Math.round(num));
    setShowAddForm(false);
    setNewLimit('');
  };

  return (
    <div className="space-y-6">
      {/* Overall Monthly Budget Summary */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {formatMonthLabel(selectedMonth)} Budget Health
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Tracking {budgets.length} expense categories against your monthly rupee limits
            </p>
          </div>

          {unbudgetedCategories.length > 0 && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-teal-500 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-violet-500/20 hover:brightness-110 hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add Category Budget</span>
            </button>
          )}
        </div>

        {/* Add Category Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddSubmit}
            className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
          >
            <div>
              <label
                htmlFor="new-budget-cat"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Category
              </label>
              <select
                id="new-budget-cat"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ExpenseCategory)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
              >
                {unbudgetedCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="new-budget-limit"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Monthly Limit (₹)
              </label>
              <input
                id="new-budget-limit"
                type="number"
                min="100"
                required
                placeholder="e.g., 4000"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 font-mono-num text-sm text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all"
              >
                Save Budget
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Overall Progress Bar */}
        <div className="mt-6 space-y-2.5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="font-mono-num text-sm text-slate-700 dark:text-slate-300">
              <strong className="text-lg font-bold text-slate-900 dark:text-white">
                {formatINR(totals.totalTrackedSpend)}
              </strong>{' '}
              spent of{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatINR(totals.totalBudget)}
              </span>{' '}
              planned
            </div>
            <span
              className={`font-mono-num text-xs font-bold ${
                totals.remaining >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {totals.remaining >= 0
                ? `${formatINR(totals.remaining)} remaining`
                : `${formatINR(Math.abs(totals.remaining))} over total budget`}
            </span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                totals.pct > 100
                  ? 'bg-gradient-to-r from-orange-500 to-rose-600'
                  : totals.pct >= 80
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-violet-600 via-teal-500 to-emerald-400'
              }`}
              style={{ width: `${Math.min(100, totals.pct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {budgets.map((budget) => {
          const spent = spentByCategory.get(budget.category) ?? 0;
          const pct = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
          const remaining = budget.limit - spent;
          const isOver = pct > 100;
          const isNear = !isOver && pct >= 80;
          const catColor = CATEGORY_COLORS[budget.category] ?? '#7C3AED';
          const isEditing = editingCategory === budget.category;

          return (
            <div
              key={budget.category}
              className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                    style={{
                      backgroundColor: `${catColor}20`,
                      color: catColor,
                    }}
                  >
                    {getCategoryIcon(budget.category, 'h-4 w-4')}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {budget.category}
                    </h3>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs">
                      {isOver ? (
                        <>
                          <AlertOctagon className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                          <span className="font-semibold text-rose-600 dark:text-rose-400">
                            Over Budget
                          </span>
                        </>
                      ) : isNear ? (
                        <>
                          <AlertTriangle className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                          <span className="font-semibold text-orange-600 dark:text-orange-400">
                            Near Limit
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            On Track
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit / Delete buttons */}
                {!isEditing && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(budget)}
                      aria-label={`Edit ${budget.category} budget`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteBudget(budget.category)}
                      aria-label={`Delete ${budget.category} budget`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Inline Edit Mode */}
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono-num text-xs text-slate-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="100"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      aria-label={`New limit for ${budget.category}`}
                      className="w-full rounded-lg border border-violet-400 bg-slate-50 dark:bg-slate-800 pl-7 pr-2.5 py-1.5 font-mono-num text-sm font-semibold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => commitEdit(budget.category)}
                    aria-label="Confirm budget limit"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    aria-label="Cancel budget edit"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="font-mono-num text-slate-600 dark:text-slate-300">
                      <strong className="text-sm font-bold text-slate-900 dark:text-white">
                        {formatINR(spent)}
                      </strong>{' '}
                      / {formatINR(budget.limit)}
                    </span>
                    <span className="font-mono-num font-bold text-slate-700 dark:text-slate-200">
                      {Math.round(pct)}%
                    </span>
                  </div>

                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, pct)}%`,
                        backgroundColor: isOver
                          ? '#E11D48'
                          : isNear
                          ? '#F97316'
                          : catColor,
                      }}
                    />
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono-num">
                    {remaining >= 0
                      ? `${formatINR(remaining)} left this month`
                      : `${formatINR(Math.abs(remaining))} over monthly cap`}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
