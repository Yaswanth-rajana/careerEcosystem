'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, RefreshCw, AlertCircle, Eye } from 'lucide-react';
import { MentorDiscoveryItemDTO } from '@backend/types/mentorship';
import { PublicMentorProfileContent } from './PublicMentorProfileContent';
import { Skeleton } from './Skeleton';

interface PublicMentorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMentor?: MentorDiscoveryItemDTO | null;
}

export function PublicMentorProfileModal({
  isOpen,
  onClose,
  initialMentor = null,
}: PublicMentorProfileModalProps) {
  const [mentor, setMentor] = useState<MentorDiscoveryItemDTO | null>(initialMentor);
  const [loading, setLoading] = useState<boolean>(!initialMentor);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch mentor profile data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/mentor/public-profile');
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load public profile');
      }

      setMentor(data.mentor);
    } catch (err: any) {
      setError(err.message || 'Unable to load profile preview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Manage open/close effects: fetch, scroll-lock, focus restoration, ESC key
  useEffect(() => {
    if (!isOpen) return;

    // Save active element for focus restoration
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button after open
    const timeoutId = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    // Fetch data if needed or refresh
    fetchProfile();

    // Keydown listener for ESC key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeoutId);

      // Restore focus
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        // Close when clicking directly on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="public-profile-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-6xl max-h-[92vh] bg-slate-50 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col border border-slate-200/90 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Modal Top Bar */}
        <div className="shrink-0 flex items-center justify-between px-5 sm:px-8 py-3.5 sm:py-4 bg-white/95 backdrop-blur-md border-b border-slate-200/80 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="public-profile-modal-title"
                  className="text-sm sm:text-base font-bold text-slate-900 font-display"
                >
                  Public Profile Preview
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Preview
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                This is exactly how mentees view your profile, pricing, and availability.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-1 p-2 sm:px-3 sm:py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Close</span>
              <kbd className="hidden md:inline text-[10px] px-1 py-0.5 rounded bg-slate-200/80 text-slate-500 border border-slate-300/60 font-mono ml-1">
                ESC
              </kbd>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 overscroll-contain bg-slate-50/50">
          {loading ? (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 bg-white space-y-6">
                <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                  <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-7 w-48 rounded-lg" />
                    <Skeleton className="h-4 w-72 rounded-md" />
                    <Skeleton className="h-4 w-40 rounded-md" />
                  </div>
                </div>
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-5/6 rounded" />
                  <Skeleton className="h-4 w-2/3 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
              </div>
            </div>
          ) : error ? (
            <div className="max-w-md mx-auto my-12 p-6 rounded-2xl bg-white border border-rose-200 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Failed to load preview</h3>
                <p className="text-xs text-slate-500 mt-1">{error}</p>
              </div>
              <button
                type="button"
                onClick={fetchProfile}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          ) : mentor ? (
            <div className="max-w-6xl mx-auto">
              <PublicMentorProfileContent mentor={mentor} isModalView={true} />
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
