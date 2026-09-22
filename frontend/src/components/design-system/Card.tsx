import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'neutral' | 'glass' | 'bordered' | 'accent';
  hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, variant = 'neutral', hoverEffect = false, ...props }, ref) => {
    const baseStyles = 'rounded-2xl transition-all duration-200 overflow-hidden';

    const variants = {
      neutral:
        'bg-white border border-slate-200/80 shadow-sm',
      glass:
        'glass-panel shadow-sm',
      bordered:
        'border-2 border-slate-200 bg-transparent',
      accent:
        'bg-gradient-to-br from-white via-slate-50 to-indigo-50/30 border border-indigo-200/60 shadow-glow',
    };

    const hoverStyles = hoverEffect
      ? 'hover:-translate-y-1 hover:shadow-md hover:border-slate-300'
      : '';

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], hoverStyles, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-6 py-5 border-b border-slate-100', className)} {...props}>
    {children}
  </div>
);

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-6 py-4 bg-slate-50/50 border-t border-slate-100', className)} {...props}>
    {children}
  </div>
);
