import React from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { MonthlySummary } from '../../utils/analytics';
import { formatINR, formatMonthLabel } from '../../utils/formatters';

interface SummaryCardsProps {
  summary: MonthlySummary;
  selectedMonth: string;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  selectedMonth,
}) => {
  const monthLabel = formatMonthLabel(selectedMonth, true);

  return (
    <section
      aria-label="Key financial metrics"
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
    >
      {/* Card 1: Total Balance — Vibrant Purple Gradient */}
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-700 via-purple-600 to-fuchsia-600 p-6 text-white shadow-lg shadow-purple-600/25 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-600/35">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/15 blur-xl transition-transform duration-300 group-hover:scale-125"
        />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-purple-100">Total Balance</p>
            <p className="mt-2 font-mono-num text-2xl sm:text-3xl font-bold tracking-tight">
              {formatINR(summary.totalBalance)}
            </p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs shadow-inner">
            <Wallet className="h-5 w-5 text-white" />
          </div>
        </div>

        <div className="relative mt-5 flex items-center gap-2 text-xs text-purple-100">
          <span>Net cashflow</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-num font-semibold text-white">
            {summary.monthSavings >= 0 ? '+' : ''}
            {formatINR(summary.monthSavings)} in {monthLabel}
          </span>
        </div>
      </div>

      {/* Card 2: Monthly Income — Mint Green to Teal Gradient */}
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-6 text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-600/35">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/15 blur-xl transition-transform duration-300 group-hover:scale-125"
        />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-emerald-50">
              Income ({monthLabel})
            </p>
            <p className="mt-2 font-mono-num text-2xl sm:text-3xl font-bold tracking-tight">
              {formatINR(summary.monthIncome)}
            </p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs shadow-inner">
            <ArrowDownLeft className="h-5 w-5 text-white" />
          </div>
        </div>

        <div className="relative mt-5 flex items-center gap-1.5 text-xs text-emerald-50">
          {summary.incomeDeltaPct !== null ? (
            <>
              {summary.incomeDeltaPct >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-white shrink-0" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-amber-100 shrink-0" />
              )}
              <span className="font-mono-num font-bold text-white">
                {summary.incomeDeltaPct >= 0 ? '+' : ''}
                {summary.incomeDeltaPct.toFixed(1)}%
              </span>
              <span>vs prev month</span>
            </>
          ) : (
            <span>Logged inflows for {monthLabel}</span>
          )}
        </div>
      </div>

      {/* Card 3: Monthly Expenses — Coral Orange Gradient */}
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 via-orange-500 to-rose-500 p-6 text-white shadow-lg shadow-orange-500/25 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/35">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/15 blur-xl transition-transform duration-300 group-hover:scale-125"
        />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-orange-50">
              Expenses ({monthLabel})
            </p>
            <p className="mt-2 font-mono-num text-2xl sm:text-3xl font-bold tracking-tight">
              {formatINR(summary.monthExpense)}
            </p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs shadow-inner">
            <ArrowUpRight className="h-5 w-5 text-white" />
          </div>
        </div>

        <div className="relative mt-5 flex items-center gap-1.5 text-xs text-orange-50">
          {summary.expenseDeltaPct !== null ? (
            <>
              {summary.expenseDeltaPct <= 0 ? (
                <TrendingDown className="h-3.5 w-3.5 text-white shrink-0" />
              ) : (
                <TrendingUp className="h-3.5 w-3.5 text-white shrink-0" />
              )}
              <span className="font-mono-num font-bold text-white">
                {summary.expenseDeltaPct >= 0 ? '+' : ''}
                {summary.expenseDeltaPct.toFixed(1)}%
              </span>
              <span>vs prev month</span>
            </>
          ) : (
            <span>Logged outflows for {monthLabel}</span>
          )}
        </div>
      </div>

      {/* Card 4: Monthly Savings — Deep Teal to Purple Gradient */}
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-500 to-violet-600 p-6 text-white shadow-lg shadow-teal-600/25 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-600/35">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/15 blur-xl transition-transform duration-300 group-hover:scale-125"
        />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-teal-50">
              Monthly Savings
            </p>
            <p className="mt-2 font-mono-num text-2xl sm:text-3xl font-bold tracking-tight">
              {formatINR(summary.monthSavings)}
            </p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs shadow-inner">
            <PiggyBank className="h-5 w-5 text-white" />
          </div>
        </div>

        <div className="relative mt-5 flex items-center justify-between gap-2 text-xs text-teal-50">
          <span>Savings rate</span>
          <span className="font-mono-num font-bold text-white">
            {summary.monthIncome > 0
              ? `${summary.savingsRate.toFixed(1)}% of income`
              : 'No income logged'}
          </span>
        </div>
      </div>
    </section>
  );
};
