'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

export interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  id: string;
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className, label, error, id, type = 'text', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';
    const computedType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        <label
          htmlFor={id}
          className="text-xs font-semibold text-slate-700 tracking-wide"
        >
          {label}
        </label>
        <div className="relative flex items-center">
          <input
            id={id}
            ref={ref}
            type={computedType}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className={cn(
              'w-full h-[52px] px-4 py-3.5 text-sm font-medium rounded-[14px] transition-all duration-200',
              'bg-slate-50 text-slate-900 focus:bg-white',
              'border border-slate-200',
              'placeholder:text-slate-400',
              'focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              isPasswordType && 'pr-11',
              className
            )}
            {...props}
          />
          {isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#6366F1] rounded-md transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error && (
          <p id={`${id}-error`} className="text-xs font-medium text-red-400 mt-0.5 animate-fadeIn">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';
