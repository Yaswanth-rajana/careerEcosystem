'use client';

import React, { useState, useEffect } from 'react';
import { MentorShell } from '@/components/MentorShell';
import { CardSkeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { ReviewDTO, PaginatedResult } from '@backend/types/mentorship';
import { Star, ChevronLeft, ChevronRight, MessageSquare, AlertCircle } from 'lucide-react';

export default function MentorReviewsPage() {
  const [data, setData] = useState<PaginatedResult<ReviewDTO>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async (targetPage: number = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/mentor/reviews?page=${targetPage}&limit=10`);
      if (!res.ok) throw new Error('Failed to load reviews');
      const json = await res.json();
      setData(json);
      setPage(targetPage);
    } catch (err: any) {
      setError(err.message || 'Error loading reviews');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, []);

  return (
    <MentorShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="pb-2 border-b border-slate-200/80">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Candidate Feedback & Reviews
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Verified ratings and feedback submitted by students from completed mentorship sessions
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : data.items.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No reviews yet"
            description="Reviews from completed sessions will appear here once candidates share their feedback."
            actionText="View Completed Sessions"
            actionHref="/mentorship/bookings?tab=completed"
          />
        ) : (
          <div className="space-y-4">
            {data.items.map((rev) => {
              const date = new Date(rev.createdAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={rev.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-100 flex-shrink-0">
                        {rev.candidateName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{rev.candidateName}</h4>
                        <span className="text-[11px] text-slate-500">
                          {rev.serviceTitle} • {date}
                        </span>
                      </div>
                    </div>

                    {/* Star Rating Display */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rev.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
                    &ldquo;{rev.review}&rdquo;
                  </p>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 text-xs">
                <span className="text-slate-500">
                  Showing {(page - 1) * data.limit + 1} to{' '}
                  {Math.min(page * data.limit, data.total)} of {data.total} reviews
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => fetchReviews(page - 1)}
                    className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-semibold text-slate-700 px-2">
                    {page} / {data.totalPages}
                  </span>
                  <button
                    disabled={page >= data.totalPages}
                    onClick={() => fetchReviews(page + 1)}
                    className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MentorShell>
  );
}
