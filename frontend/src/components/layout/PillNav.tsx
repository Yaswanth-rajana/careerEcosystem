'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { Badge } from '@/components/design-system/Badge';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export interface PillNavItem {
  label: string;
  href: string;
  badge?: string;
  ariaLabel?: string;
  subItems?: Array<{ label: string; href: string; category?: string }>;
}

export interface PillNavProps {
  logo?: React.ReactNode;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  initialLoadAnimation?: boolean;
}

export const PillNav: React.FC<PillNavProps> = ({
  items,
  activeHref,
  className = '',
  ease = 'power3.easeOut',
}) => {
  const pathname = usePathname();
  const currentHref = activeHref || pathname || '/';
  const shouldReduceMotion = useReducedMotion();

  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number | null>(null);

  const circleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tlRefs = useRef<(gsap.core.Timeline | null)[]>([]);
  const activeTweenRefs = useRef<(gsap.core.Tween | null)[]>([]);
  const navItemsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        if (w === 0 || h === 0) return;

        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 1.8, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 1.8, ease, overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 80), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 1.8, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();
    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease, shouldReduceMotion]);

  const handleEnter = (i: number) => {
    setActiveDropdownIndex(i);
    if (shouldReduceMotion) return;
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.28,
      ease,
      overwrite: 'auto',
    });
  };

  const handleLeave = (i: number) => {
    setActiveDropdownIndex(null);
    if (shouldReduceMotion) return;
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto',
    });
  };

  return (
    <div
      ref={navItemsRef}
      className={`hidden md:flex items-center h-[48px] px-2 rounded-full bg-slate-100/90 border border-slate-200/80 backdrop-blur-xl shadow-sm transition-colors ${className}`}
    >
      <ul className="flex items-center gap-1 sm:gap-1.5 m-0 p-0 list-none h-full" role="menubar">
        {items.map((item, i) => {
          const isActive =
            currentHref === item.href ||
            (item.href === '/' && currentHref === '') ||
            (item.subItems && item.subItems.some((s) => s.href === currentHref));

          const hasSubItems = item.subItems && item.subItems.length > 0;

          return (
            <li
              key={item.href || `item-${i}`}
              className="h-full flex items-center relative"
              role="none"
              onMouseEnter={() => handleEnter(i)}
              onMouseLeave={() => handleLeave(i)}
            >
              <Link
                role="menuitem"
                href={item.href}
                prefetch={true}
                className={`relative h-[36px] px-3.5 rounded-full flex items-center gap-2 text-xs font-semibold select-none overflow-hidden whitespace-nowrap transition-colors duration-150 ${
                  isActive
                    ? 'font-bold bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-label={item.ariaLabel || item.label}
              >
                {/* GSAP Expand Circle Background Effect (non-active) */}
                {!isActive && !shouldReduceMotion && (
                  <span
                    className="hover-circle absolute left-1/2 bottom-0 rounded-full bg-slate-900/10 pointer-events-none z-0"
                    aria-hidden="true"
                    ref={(el) => {
                      circleRefs.current[i] = el;
                    }}
                  />
                )}

                {/* Pill Label Stack */}
                <span className="label-stack relative z-10 inline-flex items-center gap-1.5 whitespace-nowrap">
                  <span className="pill-label inline-flex items-center gap-1.5 whitespace-nowrap">
                    {item.label}
                    {item.badge && (
                      <Badge
                        variant="neutral"
                        size="sm"
                        className={`text-[9.5px] py-0.5 px-2 font-medium rounded-full transition-colors ${
                          isActive
                            ? 'bg-white/20 text-white border border-white/30'
                            : 'bg-slate-200 text-slate-600 border border-slate-300/80'
                        }`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </span>

                  {/* Dual Hover Layer for GSAP slide up */}
                  {!isActive && !shouldReduceMotion && (
                    <span
                      className="pill-label-hover absolute left-0 top-0 text-slate-900 font-bold inline-flex items-center gap-1.5 opacity-0 pointer-events-none whitespace-nowrap"
                      aria-hidden="true"
                    >
                      {item.label}
                      {item.badge && (
                        <Badge
                          variant="neutral"
                          size="sm"
                          className="text-[9.5px] py-0.5 px-2 font-medium rounded-full bg-slate-200 text-slate-900 border border-slate-300/80"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </span>
                  )}
                </span>
              </Link>

              {/* Sub-Items Multi-Role Dropdown */}
              <AnimatePresence>
                {activeDropdownIndex === i && hasSubItems && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1.5 w-60 p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xl z-50 text-left space-y-1.5"
                  >
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">
                      Selected Target Roles ({item.subItems!.length})
                    </div>
                    <div className="space-y-1">
                      {item.subItems!.map((sub) => {
                        const isSubActive = currentHref === sub.href;
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all ${
                              isSubActive
                                ? 'bg-blue-50 text-blue-600 font-bold'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span>{sub.label}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </Link>
                        );
                      })}
                    </div>
                    <div className="pt-1.5 border-t border-slate-100">
                      <Link
                        href="/explore"
                        className="block px-2 py-1 text-[11px] font-bold text-blue-600 hover:underline"
                      >
                        Explore More Roles →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
