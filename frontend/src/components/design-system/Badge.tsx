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
      'bg-slate-100 text-slate-700 border border-slate-200',
    brand:
      'bg-blue-50 text-blue-700 border border-blue-200',
    success:
      'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning:
      'bg-amber-50 text-amber-700 border border-amber-200',
    info:
      'bg-sky-50 text-sky-700 border border-sky-200',
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
