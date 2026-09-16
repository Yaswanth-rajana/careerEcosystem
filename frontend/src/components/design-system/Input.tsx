import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full px-4 py-2.5 text-sm rounded-xl transition-colors duration-150',
              'bg-white dark:bg-obsidian-800 text-slate-900 dark:text-slate-100',
              'border border-slate-200 dark:border-obsidian-700',
              'placeholder:text-slate-400 dark:placeholder:text-slate-500',
              'focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 focus:border-brand-indigo',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-500 focus:ring-red-500/30 focus:border-red-500',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-slate-400 dark:text-slate-500 pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="text-xs font-medium text-red-500 mt-0.5">{error}</p>}
        {!error && hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 text-sm rounded-xl transition-colors duration-150',
            'bg-white dark:bg-obsidian-800 text-slate-900 dark:text-slate-100',
            'border border-slate-200 dark:border-obsidian-700',
            'placeholder:text-slate-400 dark:placeholder:text-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 focus:border-brand-indigo',
            'min-h-[100px] resize-y',
            error && 'border-red-500 focus:ring-red-500/30 focus:border-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs font-medium text-red-500 mt-0.5">{error}</p>}
        {!error && hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
