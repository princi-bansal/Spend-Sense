import React, { useEffect, useState } from 'react';
import { X, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  PaymentMethod,
  Transaction,
  TransactionCategory,
  TransactionType,
} from '../../types/finance';
import { getTodayISO } from '../../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  editingTransaction: Transaction | null;
  defaultType?: TransactionType;
  onClose: () => void;
  onSave: (txData: Omit<Transaction, 'id'>, existingId?: string) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  editingTransaction,
  defaultType = 'expense',
  onClose,
  onSave,
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Food & Dining');
  const [date, setDate] = useState(getTodayISO());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (editingTransaction) {
      setType(editingTransaction.type);
      setTitle(editingTransaction.title);
      setAmount(String(editingTransaction.amount));
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod);
      setNotes(editingTransaction.notes ?? '');
      setError('');
    } else {
      setType(defaultType);
      setTitle('');
      setAmount('');
      setCategory(defaultType === 'income' ? 'Salary' : 'Food & Dining');
      setDate(getTodayISO());
      setPaymentMethod(defaultType === 'income' ? 'Bank Transfer' : 'UPI');
      setNotes('');
      setError('');
    }
  }, [isOpen, editingTransaction, defaultType]);

  if (!isOpen) return null;

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleTypeSwitch = (nextType: TransactionType) => {
    setType(nextType);
    const validCategories =
      nextType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    if (!validCategories.includes(category as never)) {
      setCategory(nextType === 'expense' ? 'Food & Dining' : 'Salary');
    }
    if (!editingTransaction) {
      setPaymentMethod(nextType === 'income' ? 'Bank Transfer' : 'UPI');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!title.trim()) {
      setError('Please enter a transaction title.');
      return;
    }
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount greater than ₹0.');
      return;
    }
    if (!date) {
      setError('Please select a transaction date.');
      return;
    }

    onSave(
      {
        title: title.trim(),
        amount: Math.round(numericAmount * 100) / 100,
        type,
        category,
        date,
        paymentMethod,
        notes: notes.trim() || undefined,
      },
      editingTransaction?.id
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 px-6 py-4">
          <h2
            id="transaction-modal-title"
            className="font-display text-lg font-bold text-slate-900 dark:text-white"
          >
            {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type Switcher */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => handleTypeSwitch('expense')}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>Expense</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeSwitch('income')}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all ${
                type === 'income'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowDownLeft className="h-4 w-4" />
              <span>Income</span>
            </button>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="tx-amount"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Amount (₹)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono-num text-sm font-semibold text-slate-500 dark:text-slate-400">
                  ₹
                </span>
                <input
                  id="tx-amount"
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 pl-8 pr-3.5 py-2.5 font-mono-num text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="tx-date"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Date
              </label>
              <input
                id="tx-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="tx-title"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Description / Merchant
            </label>
            <input
              id="tx-title"
              type="text"
              required
              placeholder={
                type === 'expense'
                  ? 'e.g., Swiggy Order, Metro Recharge, Rent'
                  : 'e.g., Monthly Salary, Freelance Invoice'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="tx-category"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Category
              </label>
              <select
                id="tx-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="tx-payment"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Payment Method
              </label>
              <select
                id="tx-payment"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label
              htmlFor="tx-notes"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Notes (Optional)
            </label>
            <input
              id="tx-notes"
              type="text"
              placeholder="Add any extra context..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          {error && (
            <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/25 hover:brightness-110 transition-all"
            >
              {editingTransaction ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
