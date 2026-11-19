import { Transaction } from '../types/finance';

export function formatINR(amount: number, compact = false): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (compact) {
    if (abs >= 10000000) {
      return `${sign}₹${(abs / 10000000).toFixed(2)}Cr`;
    }
    if (abs >= 100000) {
      return `${sign}₹${(abs / 100000).toFixed(2)}L`;
    }
    if (abs >= 1000) {
      return `${sign}₹${(abs / 1000).toFixed(1)}k`;
    }
  }

  return `${sign}${new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: abs % 1 === 0 ? 0 : 2,
  }).format(abs)}`;
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatShortDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

export function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // YYYY-MM
}

export function formatMonthLabel(monthKey: string, short = false): string {
  const [year, month] = monthKey.split('-').map(Number);
  if (!year || !month) return monthKey;
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-IN', {
    month: short ? 'short' : 'long',
    year: short ? '2-digit' : 'numeric',
  });
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shiftMonthKey(monthKey: string, offset: number): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function exportTransactionsToCSV(transactions: Transaction[], filenamePrefix = 'spendsense-transactions'): void {
  const headers = ['Date', 'Title', 'Type', 'Category', 'Payment Method', 'Amount (INR)', 'Notes'];
  const escapeCSV = (value: string | number | undefined): string => {
    const str = String(value ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = transactions
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((tx) => [
      escapeCSV(tx.date),
      escapeCSV(tx.title),
      escapeCSV(tx.type === 'income' ? 'Income' : 'Expense'),
      escapeCSV(tx.category),
      escapeCSV(tx.paymentMethod),
      escapeCSV(tx.amount),
      escapeCSV(tx.notes ?? ''),
    ]);

  // Prepend UTF-8 BOM so Excel displays ₹ cleanly
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filenamePrefix}-${getTodayISO()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
