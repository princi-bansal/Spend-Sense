import {
  Budget,
  CATEGORY_COLORS,
  SpendingInsight,
  Transaction,
} from '../types/finance';
import {
  formatINR,
  formatMonthLabel,
  getMonthKey,
  shiftMonthKey,
} from './formatters';

export interface MonthlySummary {
  totalBalance: number;
  monthIncome: number;
  monthExpense: number;
  monthSavings: number;
  savingsRate: number;
  prevMonthIncome: number;
  prevMonthExpense: number;
  expenseDeltaPct: number | null;
  incomeDeltaPct: number | null;
}

export function computeMonthlySummary(
  transactions: Transaction[],
  selectedMonth: string
): MonthlySummary {
  let totalIncomeAll = 0;
  let totalExpenseAll = 0;
  let monthIncome = 0;
  let monthExpense = 0;
  let prevMonthIncome = 0;
  let prevMonthExpense = 0;

  const prevMonth = shiftMonthKey(selectedMonth, -1);

  for (const tx of transactions) {
    const mk = getMonthKey(tx.date);
    if (tx.type === 'income') {
      totalIncomeAll += tx.amount;
      if (mk === selectedMonth) monthIncome += tx.amount;
      if (mk === prevMonth) prevMonthIncome += tx.amount;
    } else {
      totalExpenseAll += tx.amount;
      if (mk === selectedMonth) monthExpense += tx.amount;
      if (mk === prevMonth) prevMonthExpense += tx.amount;
    }
  }

  const totalBalance = totalIncomeAll - totalExpenseAll;
  const monthSavings = monthIncome - monthExpense;
  const savingsRate = monthIncome > 0 ? (monthSavings / monthIncome) * 100 : 0;

  const expenseDeltaPct =
    prevMonthExpense > 0
      ? ((monthExpense - prevMonthExpense) / prevMonthExpense) * 100
      : null;

  const incomeDeltaPct =
    prevMonthIncome > 0
      ? ((monthIncome - prevMonthIncome) / prevMonthIncome) * 100
      : null;

  return {
    totalBalance,
    monthIncome,
    monthExpense,
    monthSavings,
    savingsRate,
    prevMonthIncome,
    prevMonthExpense,
    expenseDeltaPct,
    incomeDeltaPct,
  };
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export function computeCategoryBreakdown(
  transactions: Transaction[],
  selectedMonth: string,
  type: 'expense' | 'income' = 'expense'
): CategoryBreakdownItem[] {
  const map = new Map<string, number>();
  let total = 0;

  for (const tx of transactions) {
    if (tx.type === type && getMonthKey(tx.date) === selectedMonth) {
      map.set(tx.category, (map.get(tx.category) ?? 0) + tx.amount);
      total += tx.amount;
    }
  }

  return Array.from(map.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
      color: CATEGORY_COLORS[category] ?? '#64748B',
    }))
    .sort((a, b) => b.amount - a.amount);
}

export interface MonthlySeriesPoint {
  monthKey: string;
  label: string;
  income: number;
  expense: number;
  savings: number;
}

export function computeSixMonthTrend(
  transactions: Transaction[],
  anchorMonth: string
): MonthlySeriesPoint[] {
  const months: string[] = [];
  for (let i = -5; i <= 0; i++) {
    months.push(shiftMonthKey(anchorMonth, i));
  }

  const totals = new Map<string, { income: number; expense: number }>();
  for (const mk of months) {
    totals.set(mk, { income: 0, expense: 0 });
  }

  for (const tx of transactions) {
    const mk = getMonthKey(tx.date);
    const entry = totals.get(mk);
    if (entry) {
      if (tx.type === 'income') entry.income += tx.amount;
      else entry.expense += tx.amount;
    }
  }

  return months.map((mk) => {
    const entry = totals.get(mk)!;
    return {
      monthKey: mk,
      label: formatMonthLabel(mk, true),
      income: entry.income,
      expense: entry.expense,
      savings: Math.max(0, entry.income - entry.expense),
    };
  });
}

export interface DailySpendPoint {
  day: string;
  expense: number;
  cumulative: number;
}

export function computeDailySpendSeries(
  transactions: Transaction[],
  selectedMonth: string
): DailySpendPoint[] {
  const [year, month] = selectedMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyMap = new Map<number, number>();

  for (const tx of transactions) {
    if (tx.type === 'expense' && getMonthKey(tx.date) === selectedMonth) {
      const dayNum = Number(tx.date.split('-')[2]);
      dailyMap.set(dayNum, (dailyMap.get(dayNum) ?? 0) + tx.amount);
    }
  }

  let running = 0;
  const series: DailySpendPoint[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dayExpense = dailyMap.get(d) ?? 0;
    running += dayExpense;
    series.push({
      day: String(d),
      expense: dayExpense,
      cumulative: running,
    });
  }

  return series;
}

export interface PaymentMethodStat {
  method: string;
  amount: number;
  count: number;
  percentage: number;
}

export function computePaymentMethodStats(
  transactions: Transaction[],
  selectedMonth: string
): PaymentMethodStat[] {
  const map = new Map<string, { amount: number; count: number }>();
  let total = 0;

  for (const tx of transactions) {
    if (tx.type === 'expense' && getMonthKey(tx.date) === selectedMonth) {
      const prev = map.get(tx.paymentMethod) ?? { amount: 0, count: 0 };
      map.set(tx.paymentMethod, {
        amount: prev.amount + tx.amount,
        count: prev.count + 1,
      });
      total += tx.amount;
    }
  }

  return Array.from(map.entries())
    .map(([method, data]) => ({
      method,
      amount: data.amount,
      count: data.count,
      percentage: total > 0 ? (data.amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function generateSmartInsights(
  transactions: Transaction[],
  budgets: Budget[],
  selectedMonth: string
): SpendingInsight[] {
  const insights: SpendingInsight[] = [];
  const summary = computeMonthlySummary(transactions, selectedMonth);
  const breakdown = computeCategoryBreakdown(transactions, selectedMonth, 'expense');
  const monthExpenses = transactions.filter(
    (tx) => tx.type === 'expense' && getMonthKey(tx.date) === selectedMonth
  );

  // 1. Savings rate evaluation
  if (summary.monthIncome > 0) {
    if (summary.savingsRate >= 30) {
      insights.push({
        id: 'insight-savings-strong',
        title: 'Strong Monthly Savings Rate',
        description: `You saved ${summary.savingsRate.toFixed(1)}% of your ${formatMonthLabel(selectedMonth)} income, well above the 20% recommended benchmark.`,
        metric: `${formatINR(summary.monthSavings)} saved`,
        tone: 'positive',
      });
    } else if (summary.savingsRate >= 15) {
      insights.push({
        id: 'insight-savings-steady',
        title: 'Steady Savings Cushion',
        description: `Your savings rate is ${summary.savingsRate.toFixed(1)}% this month. Trimming discretionary spends by 5% unlocks extra SIP capacity.`,
        metric: `${summary.savingsRate.toFixed(1)}% saved`,
        tone: 'info',
      });
    } else {
      insights.push({
        id: 'insight-savings-low',
        title: 'Tight Cashflow Margin',
        description: `Expenses consumed ${(100 - Math.max(0, summary.savingsRate)).toFixed(0)}% of income in ${formatMonthLabel(selectedMonth)}. Review non-essential categories.`,
        metric: `${formatINR(summary.monthSavings)} net`,
        tone: 'warning',
      });
    }
  }

  // 2. Budget overrun or near-limit alerts
  const spentByCategory = new Map<string, number>();
  for (const item of breakdown) {
    spentByCategory.set(item.category, item.amount);
  }

  const overBudgets = budgets
    .map((b) => ({
      ...b,
      spent: spentByCategory.get(b.category) ?? 0,
      ratio: b.limit > 0 ? (spentByCategory.get(b.category) ?? 0) / b.limit : 0,
    }))
    .filter((b) => b.ratio >= 0.85)
    .sort((a, b) => b.ratio - a.ratio);

  if (overBudgets.length > 0) {
    const topAlert = overBudgets[0];
    const isExceeded = topAlert.ratio > 1;
    insights.push({
      id: 'insight-budget-alert',
      title: isExceeded
        ? `${topAlert.category} Exceeded Budget`
        : `${topAlert.category} Approaching Limit`,
      description: isExceeded
        ? `Spent ${formatINR(topAlert.spent)} against a ${formatINR(topAlert.limit)} cap (${Math.round(topAlert.ratio * 100)}% used).`
        : `You have used ${Math.round(topAlert.ratio * 100)}% of your ${formatINR(topAlert.limit)} ${topAlert.category} budget.`,
      metric: isExceeded
        ? `+${formatINR(topAlert.spent - topAlert.limit)} over`
        : `${formatINR(topAlert.limit - topAlert.spent)} left`,
      tone: isExceeded ? 'alert' : 'warning',
      category: topAlert.category,
    });
  } else if (budgets.length > 0 && monthExpenses.length > 0) {
    insights.push({
      id: 'insight-budget-healthy',
      title: 'All Category Budgets On Track',
      description: 'Every tracked category is currently under 85% utilization for the selected month.',
      metric: `${budgets.length} budgets safe`,
      tone: 'positive',
    });
  }

  // 3. Top discretionary category
  const discretionary = breakdown.filter((b) => b.category !== 'Housing & Rent');
  if (discretionary.length > 0) {
    const top = discretionary[0];
    insights.push({
      id: 'insight-top-discretionary',
      title: `Top Non-Rent Spend: ${top.category}`,
      description: `${top.category} accounts for ${top.percentage.toFixed(1)}% of your total expenses this month.`,
      metric: formatINR(top.amount),
      tone: 'info',
      category: top.category,
    });
  }

  // 4. Month-over-month spend velocity
  if (summary.expenseDeltaPct !== null) {
    const absDelta = Math.abs(summary.expenseDeltaPct);
    const isLower = summary.expenseDeltaPct < 0;
    insights.push({
      id: 'insight-mom-velocity',
      title: isLower ? 'Spending Down vs Last Month' : 'Higher Spend Pace vs Last Month',
      description: isLower
        ? `Your expenses are ${absDelta.toFixed(1)}% lower than ${formatMonthLabel(shiftMonthKey(selectedMonth, -1))}.`
        : `Your expenses are ${absDelta.toFixed(1)}% higher compared to ${formatMonthLabel(shiftMonthKey(selectedMonth, -1))}.`,
      metric: `${isLower ? '-' : '+'}${absDelta.toFixed(1)}%`,
      tone: isLower ? 'positive' : 'warning',
    });
  }

  // 5. Payment method insight (UPI share)
  const paymentStats = computePaymentMethodStats(transactions, selectedMonth);
  const upiStat = paymentStats.find((p) => p.method === 'UPI');
  if (upiStat && upiStat.count > 0) {
    insights.push({
      id: 'insight-upi-share',
      title: 'UPI Transaction Footprint',
      description: `${upiStat.count} UPI payments made up ${upiStat.percentage.toFixed(0)}% of your monthly outflow.`,
      metric: formatINR(upiStat.amount),
      tone: 'info',
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'insight-empty',
      title: 'Log Transactions for Smart Insights',
      description: 'Add income or daily expenses in this month to unlock automated cashflow analysis and budget warnings.',
      metric: 'Ready',
      tone: 'info',
    });
  }

  return insights;
}
