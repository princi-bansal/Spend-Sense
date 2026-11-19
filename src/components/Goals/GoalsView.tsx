import React, { useMemo, useState } from 'react';
import {
  Plus,
  Target,
  Trash2,
  Pencil,
  CheckCircle2,
  Calendar,
  X,
  ArrowUpCircle,
} from 'lucide-react';
import { SavingsGoal } from '../../types/finance';
import { formatDate, formatINR, getTodayISO } from '../../utils/formatters';

interface GoalsViewProps {
  goals: SavingsGoal[];
  onSaveGoal: (goal: Omit<SavingsGoal, 'id'>, existingId?: string) => void;
  onContributeGoal: (goalId: string, deltaAmount: number) => void;
  onDeleteGoal: (goalId: string) => void;
}

const GOAL_COLOR_STYLES: Record<
  SavingsGoal['color'],
  { gradient: string; iconBg: string; barGradient: string }
> = {
  purple: {
    gradient: 'from-violet-600 to-purple-600',
    iconBg: 'bg-gradient-to-br from-violet-600 to-purple-500 text-white shadow-sm shadow-violet-500/25',
    barGradient: 'linear-gradient(90deg, #7C3AED, #A855F7)',
  },
  blue: {
    gradient: 'from-teal-600 to-cyan-500',
    iconBg: 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-sm shadow-teal-500/25',
    barGradient: 'linear-gradient(90deg, #0D9488, #2DD4BF)',
  },
  mint: {
    gradient: 'from-emerald-500 to-teal-500',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-500/25',
    barGradient: 'linear-gradient(90deg, #10B981, #14B8A6)',
  },
  orange: {
    gradient: 'from-orange-500 to-rose-500',
    iconBg: 'bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-sm shadow-orange-500/25',
    barGradient: 'linear-gradient(90deg, #F97316, #FB7185)',
  },
};

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  onSaveGoal,
  onContributeGoal,
  onDeleteGoal,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Personal');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState(getTodayISO());
  const [color, setColor] = useState<SavingsGoal['color']>('purple');

  const [contributingId, setContributingId] = useState<string | null>(null);
  const [contributionAmt, setContributionAmt] = useState('');

  const summary = useMemo(() => {
    let totalTarget = 0;
    let totalSaved = 0;
    let completed = 0;
    for (const g of goals) {
      totalTarget += g.targetAmount;
      totalSaved += g.currentAmount;
      if (g.currentAmount >= g.targetAmount) completed += 1;
    }
    const overallPct = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
    return { totalTarget, totalSaved, completed, overallPct };
  }, [goals]);

  const openCreateModal = () => {
    setEditingGoal(null);
    setName('');
    setCategory('Travel & Lifestyle');
    setTargetAmount('');
    setCurrentAmount('0');
    setDeadline(getTodayISO());
    setColor('purple');
    setModalOpen(true);
  };

  const openEditModal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setCategory(goal.category);
    setTargetAmount(String(goal.targetAmount));
    setCurrentAmount(String(goal.currentAmount));
    setDeadline(goal.deadline);
    setColor(goal.color);
    setModalOpen(true);
  };

  const handleSubmitGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount || '0');
    if (!name.trim() || isNaN(target) || target <= 0 || isNaN(current) || current < 0) {
      return;
    }

    onSaveGoal(
      {
        name: name.trim(),
        category: category.trim() || 'Savings',
        targetAmount: Math.round(target),
        currentAmount: Math.round(current),
        deadline,
        color,
      },
      editingGoal?.id
    );
    setModalOpen(false);
  };

  const handleContributeSubmit = (e: React.FormEvent, goalId: string) => {
    e.preventDefault();
    const val = parseFloat(contributionAmt);
    if (isNaN(val) || val <= 0) return;
    onContributeGoal(goalId, Math.round(val));
    setContributingId(null);
    setContributionAmt('');
  };

  return (
    <div className="space-y-6">
      {/* Goals Overview Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Savings Goals Tracker
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono-num">
                <strong className="text-slate-900 dark:text-white">
                  {formatINR(summary.totalSaved)}
                </strong>{' '}
                accumulated
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-num">
                Target {formatINR(summary.totalTarget)}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {summary.completed} of {goals.length} completed
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-teal-500 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-violet-500/20 hover:brightness-110 hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>New Savings Goal</span>
          </button>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Combined goal progress
            </span>
            <span className="font-mono-num font-bold text-violet-600 dark:text-violet-400">
              {summary.overallPct.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 via-teal-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${Math.min(100, summary.overallPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {goals.map((goal) => {
            const pct =
              goal.targetAmount > 0
                ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
                : 0;
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            const isComplete = goal.currentAmount >= goal.targetAmount;
            const theme = GOAL_COLOR_STYLES[goal.color];
            const isContributing = contributingId === goal.id;

            return (
              <div
                key={goal.id}
                className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between gap-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${theme.iconBg}`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Target className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-base font-bold text-slate-900 dark:text-white truncate">
                        {goal.name}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{goal.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Calendar className="h-3 w-3" />
                          {formatDate(goal.deadline)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(goal)}
                      aria-label={`Edit ${goal.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteGoal(goal.id)}
                      aria-label={`Delete ${goal.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Metrics */}
                <div className="space-y-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono-num text-sm text-slate-600 dark:text-slate-300">
                      <strong className="text-lg font-bold text-slate-900 dark:text-white">
                        {formatINR(goal.currentAmount)}
                      </strong>{' '}
                      of {formatINR(goal.targetAmount)}
                    </span>
                    <span className="font-mono-num text-sm font-bold text-slate-900 dark:text-white">
                      {pct.toFixed(0)}%
                    </span>
                  </div>

                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        background: theme.barGradient,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono-num">
                      {isComplete
                        ? 'Target reached!'
                        : `${formatINR(remaining)} left to goal`}
                    </span>
                  </div>
                </div>

                {/* Quick Add Funds */}
                {!isComplete && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    {!isContributing ? (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {[1000, 2500, 5000].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => onContributeGoal(goal.id, preset)}
                              className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 font-mono-num text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              +₹{preset.toLocaleString('en-IN')}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setContributingId(goal.id);
                            setContributionAmt('');
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700"
                        >
                          <ArrowUpCircle className="h-4 w-4" />
                          <span>Custom Deposit</span>
                        </button>
                      </div>
                    ) : (
                      <form
                        onSubmit={(e) => handleContributeSubmit(e, goal.id)}
                        className="flex items-center gap-2"
                      >
                        <div className="relative flex-1">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono-num text-xs text-slate-500">
                            ₹
                          </span>
                          <input
                            type="number"
                            min="1"
                            required
                            placeholder="Amount"
                            value={contributionAmt}
                            onChange={(e) => setContributionAmt(e.target.value)}
                            className="w-full rounded-lg border border-violet-400 bg-slate-50 dark:bg-slate-800 pl-7 pr-3 py-1.5 font-mono-num text-sm text-slate-900 dark:text-white focus:outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setContributingId(null)}
                          className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300"
                        >
                          Cancel
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-12 text-center">
          <p className="font-display text-base font-bold text-slate-900 dark:text-white">
            No savings goals yet
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Create a goal for your emergency fund, travel, or investments.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700"
          >
            Create First Goal
          </button>
        </div>
      )}

      {/* Goal Create/Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="goal-modal-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 px-6 py-4">
              <h2
                id="goal-modal-title"
                className="font-display text-lg font-bold text-slate-900 dark:text-white"
              >
                {editingGoal ? 'Edit Savings Goal' : 'New Savings Goal'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close goal modal"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitGoal} className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="goal-name"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Goal Name
                </label>
                <input
                  id="goal-name"
                  type="text"
                  required
                  placeholder="e.g., Emergency Fund, Bike Downpayment"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="goal-target"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Target (₹)
                  </label>
                  <input
                    id="goal-target"
                    type="number"
                    min="100"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 font-mono-num text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="goal-current"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Saved So Far (₹)
                  </label>
                  <input
                    id="goal-current"
                    type="number"
                    min="0"
                    required
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 font-mono-num text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="goal-category"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Label
                  </label>
                  <input
                    id="goal-category"
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="goal-deadline"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Target Date
                  </label>
                  <input
                    id="goal-deadline"
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Accent Color
                </span>
                <div className="flex items-center gap-2.5">
                  {(['purple', 'blue', 'mint', 'orange'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      aria-label={`Select ${c} accent`}
                      className={`h-8 w-8 rounded-full bg-gradient-to-br ${GOAL_COLOR_STYLES[c].gradient} transition-transform ${
                        color === c
                          ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-slate-900 scale-110'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110"
                >
                  {editingGoal ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
