import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'brand' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md';
}

export const Badge = ({
  className,
  children,
  variant = 'neutral',
  size = 'md',
  ...props
}: BadgeProps) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full tracking-wide';

  const variants = {
    neutral:
      'bg-slate-100 dark:bg-obsidian-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-obsidian-600',
    brand:
      'bg-brand-indigo/10 text-brand-indigo dark:bg-brand-indigo/20 dark:text-brand-indigo-light border border-brand-indigo/20',
    success:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40',
    warning:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40',
    info:
      'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-200 dark:border-sky-800/40',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
