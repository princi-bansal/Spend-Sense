import React from 'react';
import { ArrowRight, Pencil, Target } from 'lucide-react';
import {
  Budget,
  CATEGORY_COLORS,
  NavView,
  SavingsGoal,
  SpendingInsight,
  Transaction,
} from '../../types/finance';
import {
  formatINR,
  formatMonthLabel,
  formatShortDate,
  getMonthKey,
} from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { InsightsPanel } from './InsightsPanel';

interface OverviewBottomGridProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  insights: SpendingInsight[];
  selectedMonth: string;
  onNavigate: (view: NavView) => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const OverviewBottomGrid: React.FC<OverviewBottomGridProps> = ({
  transactions,
  budgets,
  goals,
  insights,
  selectedMonth,
  onNavigate,
  onEditTransaction,
}) => {
  const recentMonthTx = transactions
    .filter((tx) => getMonthKey(tx.date) === selectedMonth)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  const spentByCategory = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.type === 'expense' && getMonthKey(tx.date) === selectedMonth) {
      spentByCategory.set(
        tx.category,
        (spentByCategory.get(tx.category) ?? 0) + tx.amount
      );
    }
  }

  const topBudgets = budgets
    .map((b) => {
      const spent = spentByCategory.get(b.category) ?? 0;
      const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
      return { ...b, spent, pct };
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3);

  const topGoals = goals.slice(0, 2);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left 7 cols: Recent Transactions */}
      <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Latest activity for {formatMonthLabel(selectedMonth)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('transactions')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors whitespace-nowrap"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {recentMonthTx.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentMonthTx.map((tx) => {
              const catColor = CATEGORY_COLORS[tx.category] ?? '#64748B';
              const isIncome = tx.type === 'income';
              return (
                <div
                  key={tx.id}
                  className="-mx-2 px-2 py-3.5 rounded-xl flex items-center justify-between gap-3 group transition-colors hover:bg-slate-50/90 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
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
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {tx.category} · {tx.paymentMethod} ·{' '}
                        <span className="tabular-nums">
                          {formatShortDate(tx.date)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className={`font-mono-num text-sm font-bold ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatINR(tx.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onEditTransaction(tx)}
                      aria-label={`Edit ${tx.title}`}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-slate-800 dark:hover:text-violet-400 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
            No transactions logged for {formatMonthLabel(selectedMonth)} yet.
          </p>
        )}
      </div>

      {/* Right 5 cols: Smart Insights + Budget/Goals Pulse */}
      <div className="lg:col-span-5 space-y-6">
        <InsightsPanel
          insights={insights}
          compact
          onViewAnalytics={() => onNavigate('analytics')}
        />

        {/* Budgets & Goals Pulse Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm transition-shadow duration-200 hover:shadow-md space-y-5">
          {/* Top Budgets */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3.5">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Budget Watchlist
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('budgets')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                <span>Manage</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {topBudgets.map((b) => {
                const isOver = b.pct > 100;
                const isNear = !isOver && b.pct >= 80;
                return (
                  <div key={b.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
                        {b.category}
                      </span>
                      <span className="font-mono-num text-slate-600 dark:text-slate-300">
                        <strong
                          className={
                            isOver
                              ? 'text-rose-600 dark:text-rose-400'
                              : isNear
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-slate-900 dark:text-white'
                          }
                        >
                          {formatINR(b.spent)}
                        </strong>{' '}
                        / {formatINR(b.limit)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, b.pct)}%`,
                          backgroundColor: isOver
                            ? '#E11D48'
                            : isNear
                            ? '#FF6B4A'
                            : CATEGORY_COLORS[b.category] ?? '#7C3AED',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Savings Goals Divider */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                Savings Goals
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('goals')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                <span>All Goals</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {topGoals.map((g) => {
                const pct =
                  g.targetAmount > 0
                    ? Math.min(100, (g.currentAmount / g.targetAmount) * 100)
                    : 0;
                return (
                  <div key={g.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200 truncate">
                        <Target className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                        <span className="truncate">{g.name}</span>
                      </span>
                      <span className="font-mono-num font-semibold text-slate-900 dark:text-white shrink-0">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-600 via-teal-500 to-emerald-400 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
