'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/design-system/Badge';
import { Card } from '@/components/design-system/Card';
import { motion } from 'framer-motion';

export interface StoryBeatContainerProps {
  id: string;
  beatNumber?: string;
  eyebrow?: string;
  showBadge?: boolean;
  title?: string;
  subtext?: string;
  children?: React.ReactNode;
  className?: string;
}

export const StoryBeatContainer: React.FC<StoryBeatContainerProps> = ({
  id,
  beatNumber,
  eyebrow,
  showBadge = false,
  title,
  subtext,
  children,
  className,
}) => {
  return (
    <section
      id={id}
      className={cn(
        'relative py-20 lg:py-28 border-b border-slate-200/60 dark:border-obsidian-800/80 transition-colors',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-10"
        >
          {/* Beat Header Header (Only if title/subtext present) */}
          {(title || subtext) && (
            <div className="space-y-4 max-w-3xl text-left">
              {showBadge && eyebrow && (
                <div className="flex items-center gap-2">
                  <Badge variant="brand" className="font-mono text-xs uppercase py-1 px-3">
                    {beatNumber ? `BEAT ${beatNumber} // ` : ''}{eyebrow}
                  </Badge>
                </div>
              )}

              {title && (
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight leading-tight">
                  {title}
                </h2>
              )}

              {subtext && (
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                  {subtext}
                </p>
              )}
            </div>
          )}

          {/* Beat Body / Visual Slot */}
          <div className="w-full">
            {children || (
              <Card variant="neutral" className="p-8 sm:p-12 border-dashed border-2 border-slate-200 dark:border-obsidian-700 bg-slate-50/50 dark:bg-obsidian-900/40">
                <div className="flex flex-col items-center justify-center text-center space-y-3 py-6">
                  <div className="px-3 py-1 rounded-md bg-slate-200 dark:bg-obsidian-700 font-mono text-xs text-slate-600 dark:text-slate-400">
                    [SLOT: VISUAL & INTERACTIVE CANVAS FOR BEAT {beatNumber}]
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                    Placeholder canvas ready for narrative graphics, interactive path visualizers, and state diagrams.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
