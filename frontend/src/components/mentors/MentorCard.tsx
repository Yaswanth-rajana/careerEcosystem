'use client';

import React, { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Building2 } from 'lucide-react';
import { Mentor, CandidateContext } from '@/lib/mentors/mentor-types';
import { Button } from '@/components/design-system/Button';

interface MentorCardProps {
  mentor: Mentor;
  candidateContext?: CandidateContext | null;
  onBookSession?: (mentor: Mentor) => void;
  behindGlowColor?: string;
  enableTilt?: boolean;
}

export const MentorCard: React.FC<MentorCardProps> = ({
  mentor,
  onBookSession,
  behindGlowColor = 'rgba(37, 99, 235, 0.45)',
  enableTilt = true,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const [cardStyle, setCardStyle] = useState<React.CSSProperties>({
    '--pointer-x': '50%',
    '--pointer-y': '50%',
    '--pointer-from-center': '0',
    '--pointer-from-left': '0.5',
    '--pointer-from-top': '0.5',
    '--card-opacity': '0',
    '--rotate-x': '0deg',
    '--rotate-y': '0deg',
    '--behind-glow-color': behindGlowColor,
    '--behind-glow-size': '35%',
  } as React.CSSProperties);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!enableTilt || !wrapperRef.current) return;

      const rect = wrapperRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const px = (x / rect.width) * 100;
      const py = (y / rect.height) * 100;

      const fromLeft = x / rect.width;
      const fromTop = y / rect.height;

      const rotX = (fromTop - 0.5) * -10;
      const rotY = (fromLeft - 0.5) * 10;

      const dist = Math.sqrt(Math.pow(fromLeft - 0.5, 2) + Math.pow(fromTop - 0.5, 2)) * 2;

      setCardStyle({
        '--pointer-x': `${px.toFixed(1)}%`,
        '--pointer-y': `${py.toFixed(1)}%`,
        '--pointer-from-center': dist.toFixed(2),
        '--pointer-from-left': fromLeft.toFixed(2),
        '--pointer-from-top': fromTop.toFixed(2),
        '--card-opacity': '1',
        '--rotate-x': `${rotY.toFixed(2)}deg`,
        '--rotate-y': `${rotX.toFixed(2)}deg`,
        '--behind-glow-color': behindGlowColor,
        '--behind-glow-size': '35%',
      } as React.CSSProperties);
    },
    [behindGlowColor, enableTilt]
  );

  const handlePointerEnter = () => {
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setCardStyle((prev) => ({
      ...prev,
      '--card-opacity': '0',
      '--rotate-x': '0deg',
      '--rotate-y': '0deg',
    }));
  };

  return (
    <div
      ref={wrapperRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={cardStyle}
      className={`pc-card-wrapper relative transition-all duration-300 ${isHovered ? 'active z-20' : 'z-10'}`}
    >
      {/* Ambient Behind Glow */}
      <div
        className="pc-behind absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at var(--pointer-x) var(--pointer-y), var(--behind-glow-color) 0%, transparent var(--behind-glow-size))`,
          filter: 'blur(35px) saturate(1.2)',
          opacity: 'calc(0.75 * var(--card-opacity, 0))',
        }}
      />

      {/* 3D Tilt Shell Card matching User Reference Layout */}
      <div
        className="pc-card relative flex flex-col justify-between h-full rounded-3xl border border-slate-200/90 bg-white hover:border-blue-500/60 backdrop-blur-xl p-6 shadow-md hover:shadow-xl transition-all duration-200 ease-out overflow-hidden"
        style={{
          transform: isHovered
            ? 'perspective(600px) rotateX(var(--rotate-y)) rotateY(var(--rotate-x)) translateZ(4px)'
            : 'perspective(600px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
        }}
      >
        {/* Subtle Light Glare overlay */}
        <div
          className="pc-glare pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300"
          style={{
            opacity: 'calc(0.25 * var(--card-opacity, 0))',
            backgroundImage: `radial-gradient(circle at var(--pointer-x) var(--pointer-y), rgba(255, 255, 255, 0.4) 0%, transparent 60%)`,
          }}
        />

        {/* Card Content Container */}
        <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
          <div>
            {/* Top Row: Large Circular Avatar (Left) + Rating (Right) */}
            <div className="flex items-start justify-between mb-5">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 shrink-0 shadow-md">
                <Image
                  src={mentor.avatar}
                  alt={mentor.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>

              {/* Rating Top Right */}
              <div className="flex items-center gap-1.5 font-bold text-base text-slate-900 pt-1">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>{mentor.rating.toFixed(1)}</span>
              </div>
            </div>

            {/* Mentor Details: Name, Role, Experience, Company */}
            <div className="space-y-3 text-left">
              <div>
                <h3 className="font-extrabold text-xl font-display text-slate-900 mb-1 tracking-tight">
                  {mentor.name}
                </h3>
                <p className="text-sm font-semibold text-slate-700">
                  {mentor.role}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  {mentor.experienceYears} Years of Experience
                </p>
              </div>

              {/* Company / Domain Row */}
              <div className="flex items-center gap-2 pt-1 text-xs font-semibold text-slate-700">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-3 h-3 text-blue-600" />
                </div>
                <span className="truncate">{mentor.domain}</span>
              </div>
            </div>
          </div>

          {/* Action Button Section */}
          <div className="pt-2 space-y-2.5">
            <Button
              variant="primary"
              size="md"
              onClick={() => onBookSession && onBookSession(mentor)}
              className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl shadow-md text-sm transition-all"
            >
              Book a FREE Session
            </Button>

            <Link href={`/mentors/${mentor.id}`} className="block text-center">
              <span className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
                View Profile →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
