import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  onClose?: () => void;
}

export const Alert = ({
  className,
  children,
  variant = 'info',
  title,
  onClose,
  ...props
}: AlertProps) => {
  const icons = {
    info: <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />,
  };

  const borderStyles = {
    info: 'border-sky-200 dark:border-sky-900/50 bg-sky-50/70 dark:bg-sky-950/20 text-sky-900 dark:text-sky-200',
    success: 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200',
    warning: 'border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200',
    error: 'border-red-200 dark:border-red-900/50 bg-red-50/70 dark:bg-red-950/20 text-red-900 dark:text-red-200',
  };

  return (
    <div
      role="alert"
      className={cn(
        'p-4 rounded-xl border flex gap-3 text-sm transition-all duration-150 relative',
        borderStyles[variant],
        className
      )}
      {...props}
    >
      {icons[variant]}
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1 leading-none">{title}</h4>}
        <div className="text-xs sm:text-sm leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
