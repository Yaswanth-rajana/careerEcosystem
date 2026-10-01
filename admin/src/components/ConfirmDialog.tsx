'use client';

import React, { useState } from 'react';
import { AdminModal } from './AdminModal';
import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void> | void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  requireReason?: boolean;
  reasonPlaceholder?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  requireReason = false,
  reasonPlaceholder = 'Please provide an auditable operational reason...',
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (requireReason && (!reason || reason.trim().length < 5)) {
      setError('A reason of at least 5 characters is required for this action.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirm(reason.trim() || undefined);
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getButtonStyles = () => {
    switch (variant) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm';
    }
  };

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          {variant === 'danger' || variant === 'warning' ? (
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Info className="w-4.5 h-4.5" />
            </div>
          )}
          <p className="text-xs text-slate-600 leading-relaxed pt-1">{message}</p>
        </div>

        {requireReason && (
          <div className="space-y-1.5 pt-2">
            <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
              Audit Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              placeholder={reasonPlaceholder}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm"
            />
          </div>
        )}

        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${getButtonStyles()} disabled:opacity-50`}
          >
            {isSubmitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </AdminModal>
  );
};
