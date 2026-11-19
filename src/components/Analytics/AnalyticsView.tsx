import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import {
  CategoryBreakdownItem,
  DailySpendPoint,
  MonthlySeriesPoint,
  MonthlySummary,
  PaymentMethodStat,
} from '../../utils/analytics';
import { SpendingInsight } from '../../types/finance';
import { formatINR, formatMonthLabel } from '../../utils/formatters';
import { getPaymentIcon } from '../../utils/categoryIcons';
import { InsightsPanel } from '../Dashboard/InsightsPanel';

interface AnalyticsViewProps {
  selectedMonth: string;
  summary: MonthlySummary;
  dailySeries: DailySpendPoint[];
  trendData: MonthlySeriesPoint[];
  categoryBreakdown: CategoryBreakdownItem[];
  paymentStats: PaymentMethodStat[];
  insights: SpendingInsight[];
  isDark: boolean;
}

interface DailyTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number; name?: string }>;
  label?: string;
}

const DailyTooltip: React.FC<DailyTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 shadow-lg text-xs">
      <p className="font-semibold text-slate-900 dark:text-white">
        Day {label}
      </p>
      <p className="mt-1 font-mono-num font-bold text-violet-600 dark:text-violet-400">
        {formatINR(Number(payload[0]?.value ?? 0))}
      </p>
    </div>
  );
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  selectedMonth,
  summary,
  dailySeries,
  trendData,
  categoryBreakdown,
  paymentStats,
  insights,
  isDark,
}) => {
  const [spendMode, setSpendMode] = useState<'cumulative' | 'daily'>('cumulative');

  const analyticsKPIs = useMemo(() => {
    const activeDays = dailySeries.filter((d) => d.expense > 0);
    const avgDaily =
      dailySeries.length > 0 ? summary.monthExpense / dailySeries.length : 0;
    const peakDay = dailySeries.reduce(
      (max, curr) => (curr.expense > max.expense ? curr : max),
      { day: '-', expense: 0, cumulative: 0 }
    );
    const topCategory = categoryBreakdown[0];
    const topPayment = paymentStats[0];

    return {
      avgDaily,
      activeSpendDays: activeDays.length,
      peakDay,
      topCategory,
      topPayment,
    };
  }, [dailySeries, summary.monthExpense, categoryBreakdown, paymentStats]);

  const gridColor = isDark
    ? 'rgba(148, 163, 184, 0.12)'
    : 'rgba(148, 163, 184, 0.2)';
  const tickColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <div className="space-y-6">
      {/* Top Analytical KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-5 text-white shadow-md shadow-purple-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
          <p className="text-xs font-medium text-purple-100">
            Daily Spend Average
          </p>
          <p className="mt-2 font-mono-num text-2xl font-bold">
            {formatINR(Math.round(analyticsKPIs.avgDaily))}
          </p>
          <p className="mt-2 text-xs text-purple-100">
            Across {analyticsKPIs.activeSpendDays} active spend days
          </p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 p-5 text-white shadow-md shadow-orange-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
          <p className="text-xs font-medium text-orange-50">
            Highest Spend Day
          </p>
          <p className="mt-2 font-mono-num text-2xl font-bold">
            {formatINR(analyticsKPIs.peakDay.expense)}
          </p>
          <p className="mt-2 text-xs text-orange-50">
            {analyticsKPIs.peakDay.expense > 0
              ? `Day ${analyticsKPIs.peakDay.day} of ${formatMonthLabel(selectedMonth, true)}`
              : 'No expenses logged'}
          </p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-500 p-5 text-white shadow-md shadow-teal-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
          <p className="text-xs font-medium text-teal-50">
            Largest Category
          </p>
          <p className="mt-2 font-display text-xl font-bold truncate">
            {analyticsKPIs.topCategory ? analyticsKPIs.topCategory.category : '—'}
          </p>
          <p className="mt-2 font-mono-num text-xs text-teal-50">
            {analyticsKPIs.topCategory
              ? `${formatINR(analyticsKPIs.topCategory.amount)} · ${analyticsKPIs.topCategory.percentage.toFixed(1)}%`
              : 'No data yet'}
          </p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-violet-600 p-5 text-white shadow-md shadow-emerald-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
          <p className="text-xs font-medium text-emerald-50">
            Top Payment Channel
          </p>
          <p className="mt-2 font-display text-xl font-bold truncate">
            {analyticsKPIs.topPayment ? analyticsKPIs.topPayment.method : '—'}
          </p>
          <p className="mt-2 font-mono-num text-xs text-emerald-50">
            {analyticsKPIs.topPayment
              ? `${analyticsKPIs.topPayment.percentage.toFixed(0)}% of outflow (${analyticsKPIs.topPayment.count} tx)`
              : 'No data yet'}
          </p>
        </div>
      </div>

      {/* Daily Spending Velocity Area Chart */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Monthly Spending Velocity — {formatMonthLabel(selectedMonth)}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Track how your expenses accumulate day by day throughout the month
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setSpendMode('cumulative')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                spendMode === 'cumulative'
                  ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Cumulative
            </button>
            <button
              type="button"
              onClick={() => setSpendMode('daily')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                spendMode === 'daily'
                  ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Daily Spikes
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={180}>
            <AreaChart
              data={dailySeries}
              margin={{ top: 8, right: 12, left: -6, bottom: 0 }}
            >
              <defs>
                <linearGradient id="spendAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={spendMode === 'cumulative' ? '#7C3AED' : '#FF6B4A'}
                    stopOpacity={0.42}
                  />
                  <stop
                    offset="95%"
                    stopColor={spendMode === 'cumulative' ? '#14B8A6' : '#FB7185'}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={gridColor}
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: tickColor, fontSize: 11 }}
                interval={2}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: tickColor, fontSize: 11 }}
                tickFormatter={(val: number) =>
                  val >= 1000 ? `₹${Math.round(val / 1000)}k` : `₹${val}`
                }
              />
              <Tooltip content={<DailyTooltip />} />
              <Area
                type="monotone"
                dataKey={spendMode === 'cumulative' ? 'cumulative' : 'expense'}
                stroke={spendMode === 'cumulative' ? '#7C3AED' : '#FF6B4A'}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#spendAreaGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Channels & Net Savings Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payment Channel Breakdown */}
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Payment Method Mix
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 mb-5">
            Where your outflows originated in {formatMonthLabel(selectedMonth)}
          </p>

          {paymentStats.length > 0 ? (
            <div className="space-y-4">
              {paymentStats.map((stat, idx) => {
                const barColors = ['#7C3AED', '#14B8A6', '#10B981', '#FF6B4A', '#64748B'];
                const barColor = barColors[idx % barColors.length];
                return (
                  <div key={stat.method} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                        {getPaymentIcon(stat.method, 'h-3.5 w-3.5 text-violet-500 dark:text-violet-400')}
                        {stat.method}
                        <span className="font-normal text-slate-400">
                          · {stat.count} tx
                        </span>
                      </span>
                      <span className="font-mono-num font-bold text-slate-900 dark:text-white">
                        {formatINR(stat.amount)}{' '}
                        <span className="font-normal text-slate-500">
                          ({stat.percentage.toFixed(0)}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${stat.percentage}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
              No payment channel data for this month.
            </p>
          )}
        </div>

        {/* 6-Month Net Savings Bar Chart */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            6-Month Net Savings Retention
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 mb-5">
            Monthly surplus retained after all expenses
          </p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={180}>
              <BarChart
                data={trendData}
                margin={{ top: 4, right: 8, left: -8, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="retentionBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" />
                    <stop offset="100%" stopColor="#0D9488" />
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
                  tick={{ fill: tickColor, fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: tickColor, fontSize: 11 }}
                  tickFormatter={(val: number) =>
                    val >= 1000 ? `₹${Math.round(val / 1000)}k` : `₹${val}`
                  }
                />
                <Tooltip
                  formatter={(value: unknown) => [formatINR(Number(value ?? 0)), 'Net Savings']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="savings"
                  fill="url(#retentionBarGrad)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Full Smart Spending Insights */}
      <InsightsPanel insights={insights} />
    </div>
  );
};
