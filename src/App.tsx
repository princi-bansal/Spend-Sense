import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import {
  Budget,
  ExpenseCategory,
  NavView,
  SavingsGoal,
  Transaction,
  TransactionType,
} from './types/finance';
import {
  createSampleGoals,
  createSampleTransactions,
  SAMPLE_BUDGETS,
} from './data/sampleData';
import {
  computeCategoryBreakdown,
  computeDailySpendSeries,
  computeMonthlySummary,
  computePaymentMethodStats,
  computeSixMonthTrend,
  generateSmartInsights,
} from './utils/analytics';
import {
  exportTransactionsToCSV,
  formatINR,
  getCurrentMonthKey,
  getMonthKey,
} from './utils/formatters';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { SummaryCards } from './components/Dashboard/SummaryCards';
import { ChartsSection } from './components/Dashboard/ChartsSection';
import { OverviewBottomGrid } from './components/Dashboard/OverviewBottomGrid';
import { TransactionsView } from './components/Transactions/TransactionsView';
import { TransactionModal } from './components/Transactions/TransactionModal';
import { BudgetsView } from './components/Budgets/BudgetsView';
import { GoalsView } from './components/Goals/GoalsView';
import { AnalyticsView } from './components/Analytics/AnalyticsView';

const STORAGE_KEYS = {
  transactions: 'spendsense_transactions_v1',
  budgets: 'spendsense_budgets_v1',
  goals: 'spendsense_goals_v1',
  theme: 'spendsense_theme_v1',
};

function loadFromStorage<T>(key: string, fallback: () => T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback();
    const parsed = JSON.parse(raw) as T;
    return parsed;
  } catch {
    return fallback();
  }
}

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadFromStorage(STORAGE_KEYS.transactions, createSampleTransactions)
  );
  const [budgets, setBudgets] = useState<Budget[]>(() =>
    loadFromStorage(STORAGE_KEYS.budgets, () => SAMPLE_BUDGETS)
  );
  const [goals, setGoals] = useState<SavingsGoal[]>(() =>
    loadFromStorage(STORAGE_KEYS.goals, createSampleGoals)
  );
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.theme);
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    } catch {
      return false;
    }
  });

  const [activeView, setActiveView] = useState<NavView>('overview');
  const [selectedMonth, setSelectedMonth] = useState<string>(() =>
    getCurrentMonthKey()
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Transaction Modal State
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [defaultTxType, setDefaultTxType] = useState<TransactionType>('expense');

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  // Persist state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
    } catch {
      // Ignore storage quota errors
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify(budgets));
    } catch {
      // Ignore storage quota errors
    }
  }, [budgets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goals));
    } catch {
      // Ignore storage quota errors
    }
  }, [goals]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.theme, isDark ? 'dark' : 'light');
    } catch {
      // Ignore storage error
    }
  }, [isDark]);

  // Derived Financial Analytics
  const summary = useMemo(
    () => computeMonthlySummary(transactions, selectedMonth),
    [transactions, selectedMonth]
  );

  const categoryBreakdown = useMemo(
    () => computeCategoryBreakdown(transactions, selectedMonth, 'expense'),
    [transactions, selectedMonth]
  );

  const trendData = useMemo(
    () => computeSixMonthTrend(transactions, selectedMonth),
    [transactions, selectedMonth]
  );

  const dailySeries = useMemo(
    () => computeDailySpendSeries(transactions, selectedMonth),
    [transactions, selectedMonth]
  );

  const paymentStats = useMemo(
    () => computePaymentMethodStats(transactions, selectedMonth),
    [transactions, selectedMonth]
  );

  const insights = useMemo(
    () => generateSmartInsights(transactions, budgets, selectedMonth),
    [transactions, budgets, selectedMonth]
  );

  // Handlers
  const handleOpenAddTransaction = (type: TransactionType = 'expense') => {
    setEditingTx(null);
    setDefaultTxType(type);
    setTxModalOpen(true);
  };

  const handleOpenEditTransaction = (tx: Transaction) => {
    setEditingTx(tx);
    setDefaultTxType(tx.type);
    setTxModalOpen(true);
  };

  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTransactions((prev) =>
        prev.map((item) =>
          item.id === existingId ? { ...txData, id: existingId } : item
        )
      );
      showToast(`Updated "${txData.title}" (${formatINR(txData.amount)})`);
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      setTransactions((prev) => [newTx, ...prev]);
      const txMonth = getMonthKey(txData.date);
      if (txMonth !== selectedMonth) {
        setSelectedMonth(txMonth);
      }
      showToast(`Added ${txData.type}: ${txData.title} (${formatINR(txData.amount)})`);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    setTransactions((prev) => prev.filter((item) => item.id !== id));
    if (target) {
      showToast(`Deleted "${target.title}"`);
    }
  };

  const handleSaveBudget = (category: ExpenseCategory, limit: number) => {
    setBudgets((prev) => {
      const exists = prev.some((b) => b.category === category);
      if (exists) {
        return prev.map((b) =>
          b.category === category ? { ...b, limit } : b
        );
      }
      return [...prev, { category, limit }];
    });
    showToast(`Saved ${category} budget: ${formatINR(limit)}`);
  };

  const handleDeleteBudget = (category: ExpenseCategory) => {
    setBudgets((prev) => prev.filter((b) => b.category !== category));
    showToast(`Removed ${category} budget`);
  };

  const handleSaveGoal = (
    goalData: Omit<SavingsGoal, 'id'>,
    existingId?: string
  ) => {
    if (existingId) {
      setGoals((prev) =>
        prev.map((g) => (g.id === existingId ? { ...goalData, id: existingId } : g))
      );
      showToast(`Updated goal "${goalData.name}"`);
    } else {
      const newGoal: SavingsGoal = {
        ...goalData,
        id: `goal-${Date.now()}`,
      };
      setGoals((prev) => [newGoal, ...prev]);
      showToast(`Created goal "${goalData.name}"`);
    }
  };

  const handleContributeGoal = (goalId: string, deltaAmount: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, currentAmount: g.currentAmount + deltaAmount }
          : g
      )
    );
    showToast(`Added ${formatINR(deltaAmount)} toward savings goal`);
  };

  const handleDeleteGoal = (goalId: string) => {
    const target = goals.find((g) => g.id === goalId);
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
    if (target) showToast(`Deleted goal "${target.name}"`);
  };

  const handleExportAllCSV = () => {
    exportTransactionsToCSV(transactions, 'spendsense-ledger');
    showToast(`Exported ${transactions.length} transactions to CSV`);
  };

  const handleResetDemoData = () => {
    const sampleTx = createSampleTransactions();
    const sampleGoals = createSampleGoals();
    setTransactions(sampleTx);
    setBudgets(SAMPLE_BUDGETS);
    setGoals(sampleGoals);
    setSelectedMonth(getCurrentMonthKey());
    showToast('Restored default SpendSense sample data');
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onResetDemoData={handleResetDemoData}
        transactionCount={transactions.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeView={activeView}
          selectedMonth={selectedMonth}
          onChangeMonth={setSelectedMonth}
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
          onOpenAddModal={() => handleOpenAddTransaction('expense')}
          onExportCSV={handleExportAllCSV}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
          {activeView === 'overview' && (
            <>
              <SummaryCards summary={summary} selectedMonth={selectedMonth} />
              <ChartsSection
                trendData={trendData}
                categoryBreakdown={categoryBreakdown}
                totalMonthExpense={summary.monthExpense}
                selectedMonth={selectedMonth}
                isDark={isDark}
                onAddExpense={() => handleOpenAddTransaction('expense')}
              />
              <OverviewBottomGrid
                transactions={transactions}
                budgets={budgets}
                goals={goals}
                insights={insights}
                selectedMonth={selectedMonth}
                onNavigate={setActiveView}
                onEditTransaction={handleOpenEditTransaction}
              />
            </>
          )}

          {activeView === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              selectedMonth={selectedMonth}
              onEdit={handleOpenEditTransaction}
              onDelete={handleDeleteTransaction}
              onOpenAdd={handleOpenAddTransaction}
            />
          )}

          {activeView === 'budgets' && (
            <BudgetsView
              budgets={budgets}
              transactions={transactions}
              selectedMonth={selectedMonth}
              onSaveBudget={handleSaveBudget}
              onDeleteBudget={handleDeleteBudget}
            />
          )}

          {activeView === 'goals' && (
            <GoalsView
              goals={goals}
              onSaveGoal={handleSaveGoal}
              onContributeGoal={handleContributeGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          )}

          {activeView === 'analytics' && (
            <AnalyticsView
              selectedMonth={selectedMonth}
              summary={summary}
              dailySeries={dailySeries}
              trendData={trendData}
              categoryBreakdown={categoryBreakdown}
              paymentStats={paymentStats}
              insights={insights}
              isDark={isDark}
            />
          )}
        </main>
      </div>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={txModalOpen}
        editingTransaction={editingTx}
        defaultType={defaultTxType}
        onClose={() => setTxModalOpen(false)}
        onSave={handleSaveTransaction}
      />

      {/* Action Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 dark:bg-white px-4 py-3 text-xs sm:text-sm font-medium text-white dark:text-slate-900 shadow-xl"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
