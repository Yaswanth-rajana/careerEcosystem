import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border-2 border-dashed border-slate-200 dark:border-obsidian-700 bg-slate-50/50 dark:bg-obsidian-900/30',
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-brand-indigo/10 text-brand-indigo dark:bg-brand-indigo/20 dark:text-brand-indigo-light flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
