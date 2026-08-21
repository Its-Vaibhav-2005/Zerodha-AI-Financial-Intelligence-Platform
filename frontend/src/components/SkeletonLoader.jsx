import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4 py-6">
      {/* Executive Summary Skeleton */}
      <div className="surface-card p-6 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-[var(--bg-input)] rounded animate-shimmer" />
            <div className="h-4 w-32 bg-[var(--bg-input)]/60 rounded animate-shimmer" />
          </div>
          <div className="h-8 w-28 bg-[var(--bg-input)] rounded-full animate-shimmer" />
        </div>
        <div className="h-16 w-full bg-[var(--bg-input)]/40 rounded-xl animate-shimmer mt-4" />
        
        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[var(--bg-base)] p-4 rounded-xl space-y-2 border border-[var(--border-subtle)]">
              <div className="h-3 w-20 bg-[var(--bg-input)] rounded animate-shimmer" />
              <div className="h-6 w-28 bg-[var(--bg-input)] rounded animate-shimmer" />
            </div>
          ))}
        </div>
      </div>

      {/* Risk Alert Banner Skeleton */}
      <div className="surface-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 bg-[var(--bg-input)] rounded animate-shimmer" />
          <div className="h-6 w-24 bg-[var(--bg-input)]/70 rounded-full animate-shimmer" />
        </div>
        <div className="h-12 w-full bg-[var(--bg-input)]/30 rounded-xl animate-shimmer" />
      </div>

      {/* Drivers Grid Skeleton */}
      <div>
        <div className="h-6 w-56 bg-[var(--bg-input)] rounded animate-shimmer mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="surface-card p-5 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-5 w-20 bg-[var(--bg-input)] rounded animate-shimmer" />
                <div className="h-5 w-16 bg-[var(--bg-input)]/60 rounded-full animate-shimmer" />
              </div>
              <div className="h-10 w-full bg-[var(--bg-input)]/40 rounded animate-shimmer" />
              <div className="h-4 w-24 bg-[var(--bg-input)]/50 rounded animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
