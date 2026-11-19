import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  CategoryBreakdownItem,
  MonthlySeriesPoint,
} from '../../utils/analytics';
import { formatINR, formatMonthLabel } from '../../utils/formatters';

interface ChartsSectionProps {
  trendData: MonthlySeriesPoint[];
  categoryBreakdown: CategoryBreakdownItem[];
  totalMonthExpense: number;
  selectedMonth: string;
  isDark: boolean;
  onAddExpense: () => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
    dataKey?: string;
  }>;
  label?: string;
}

const CashflowTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload || payload.length === 0) return null;

  const colorMap: Record<string, string> = {
    income: '#10B981',
    expense: '#FF6B4A',
    savings: '#7C3AED',
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 shadow-xl text-xs">
      <p className="font-display font-semibold text-slate-900 dark:text-white mb-1.5">
        {label}
      </p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div
            key={entry.dataKey}
            className="flex items-center justify-between gap-5"
          >
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span
                className="h-2.5 w-2.5 rounded-xs shrink-0"
                style={{
                  backgroundColor:
                    colorMap[String(entry.dataKey ?? '')] ?? entry.color,
                }}
              />
              {entry.name}
            </span>
            <span className="font-mono-num font-semibold text-slate-900 dark:text-white">
              {formatINR(Number(entry.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface PieTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: CategoryBreakdownItem;
  }>;
}

const CategoryPieTooltip: React.FC<PieTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 shadow-xl text-xs">
      <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
        <span
          className="h-2.5 w-2.5 rounded-xs shrink-0"
          style={{ backgroundColor: item.color }}
        />
        <span>{item.category}</span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-4 text-slate-600 dark:text-slate-300">
        <span className="font-mono-num font-semibold text-slate-900 dark:text-white">
          {formatINR(item.amount)}
        </span>
        <span className="font-mono-num">{item.percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
};

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  trendData,
  categoryBreakdown,
  totalMonthExpense,
  selectedMonth,
  isDark,
  onAddExpense,
}) => {
  const gridColor = isDark
    ? 'rgba(148, 163, 184, 0.12)'
    : 'rgba(148, 163, 184, 0.2)';
  const axisTickColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <section
      aria-label="Income and expense charts"
      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      {/* 6-Month Cashflow Bar Chart */}
      <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm transition-shadow duration-200 hover:shadow-md flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Income vs. Expenses
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              6-month cashflow trajectory ending {formatMonthLabel(selectedMonth, true)}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-gradient-to-b from-emerald-400 to-teal-600" />
              Income
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-gradient-to-b from-orange-400 to-rose-500" />
              Expenses
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-gradient-to-b from-purple-400 to-violet-700" />
              Savings
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={trendData}
              margin={{ top: 4, right: 8, left: -8, bottom: 0 }}
              barGap={5}
            >
              <defs>
                <linearGradient id="incomeBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" />
                  <stop offset="100%" stopColor="#0D9488" />
                </linearGradient>
                <linearGradient id="expenseBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FB923C" />
                  <stop offset="100%" stopColor="#F43F5E" />
                </linearGradient>
                <linearGradient id="savingsBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#6D28D9" />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={gridColor}
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisTickColor, fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisTickColor, fontSize: 11 }}
                tickFormatter={(val: number) =>
                  val >= 1000 ? `₹${Math.round(val / 1000)}k` : `₹${val}`
                }
              />
              <Tooltip
                content={<CashflowTooltip />}
                cursor={{
                  fill: isDark
                    ? 'rgba(139, 92, 246, 0.08)'
                    : 'rgba(124, 58, 237, 0.05)',
                }}
              />
              <Bar
                dataKey="income"
                name="Income"
                fill="url(#incomeBarGrad)"
                radius={[6, 6, 0, 0]}
                maxBarSize={24}
              />
              <Bar
                dataKey="expense"
                name="Expenses"
                fill="url(#expenseBarGrad)"
                radius={[6, 6, 0, 0]}
                maxBarSize={24}
              />
              <Bar
                dataKey="savings"
                name="Net Savings"
                fill="url(#savingsBarGrad)"
                radius={[6, 6, 0, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown Donut Chart */}
      <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm transition-shadow duration-200 hover:shadow-md flex flex-col">
        <div className="mb-4">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Expense Breakdown
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Category share for {formatMonthLabel(selectedMonth)}
          </p>
        </div>

        {categoryBreakdown.length > 0 ? (
          <div className="flex-1 flex flex-col justify-between gap-4">
            <div className="relative h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={86}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {categoryBreakdown.map((entry) => (
                      <Cell key={entry.category} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CategoryPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Readout */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Total Spent
                </span>
                <span className="mt-0.5 font-mono-num text-base font-bold text-slate-900 dark:text-white">
                  {formatINR(totalMonthExpense, true)}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
              {categoryBreakdown.slice(0, 5).map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between gap-3 rounded-lg px-2 py-1 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2.5 w-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 font-mono-num">
                    <span className="text-slate-500 dark:text-slate-400">
                      {item.percentage.toFixed(0)}%
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white w-20 text-right">
                      {formatINR(item.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No expenses recorded in {formatMonthLabel(selectedMonth)}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              Log your daily expenses to visualize your spending distribution.
            </p>
            <button
              type="button"
              onClick={onAddExpense}
              className="mt-4 rounded-xl bg-gradient-to-r from-violet-600 to-teal-500 px-4 py-2 text-xs font-semibold text-white hover:brightness-110 transition-all"
            >
              Log First Expense
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
