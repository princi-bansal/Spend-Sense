import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { SpendingInsight } from '../../types/finance';

interface InsightsPanelProps {
  insights: SpendingInsight[];
  onViewAnalytics?: () => void;
  compact?: boolean;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  insights,
  onViewAnalytics,
  compact = false,
}) => {
  const displayed = compact ? insights.slice(0, 3) : insights;

  const getToneConfig = (tone: SpendingInsight['tone']) => {
    switch (tone) {
      case 'positive':
        return {
          icon: CheckCircle2,
          iconClass: 'text-white',
          bgClass: 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm shadow-emerald-500/25',
          metricClass: 'text-emerald-600 dark:text-emerald-400',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconClass: 'text-white',
          bgClass: 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-sm shadow-orange-500/25',
          metricClass: 'text-orange-600 dark:text-orange-400',
        };
      case 'alert':
        return {
          icon: AlertOctagon,
          iconClass: 'text-white',
          bgClass: 'bg-gradient-to-br from-rose-500 to-orange-600 shadow-sm shadow-rose-500/25',
          metricClass: 'text-rose-600 dark:text-rose-400',
        };
      default:
        return {
          icon: Lightbulb,
          iconClass: 'text-white',
          bgClass: 'bg-gradient-to-br from-violet-600 to-teal-500 shadow-sm shadow-violet-500/25',
          metricClass: 'text-violet-600 dark:text-violet-400',
        };
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Smart Spending Insights
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Automated takeaways computed from your live rupee ledger
          </p>
        </div>
        {onViewAnalytics && (
          <button
            type="button"
            onClick={onViewAnalytics}
            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors whitespace-nowrap shrink-0"
          >
            <span>Deep Analytics</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {displayed.map((insight) => {
          const tone = getToneConfig(insight.tone);
          const Icon = tone.icon;

          return (
            <div
              key={insight.id}
              className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5"
            >
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone.bgClass}`}
              >
                <Icon className={`h-4 w-4 ${tone.iconClass}`} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {insight.title}
                  </h3>
                  <span
                    className={`font-mono-num text-xs font-bold shrink-0 ${tone.metricClass}`}
                  >
                    {insight.metric}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
