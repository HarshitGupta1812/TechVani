import React from 'react';

/**
 * TechVaniLogo — Shared brand identity component.
 * Renders the SVG hex-node icon + "TechVani" wordmark.
 * Props:
 *  - size: 'sm' | 'md' | 'lg'  (default: 'md')
 *  - wordmark: boolean (default: true)
 */
export default function TechVaniLogo({ size = 'md', wordmark = true }) {
  const sizes = {
    sm: { icon: 24, text: 'text-base' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 44, text: 'text-3xl' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* SVG Icon: Hexagonal node with circuit accent */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="tv-logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="55%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
          <filter id="tv-logo-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer hexagon ring */}
        <path
          d="M20 3 L35 11.5 L35 28.5 L20 37 L5 28.5 L5 11.5 Z"
          stroke="url(#tv-logo-grad)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
        />

        {/* Inner filled hexagon */}
        <path
          d="M20 9 L30 14.5 L30 25.5 L20 31 L10 25.5 L10 14.5 Z"
          fill="url(#tv-logo-grad)"
          opacity="0.15"
        />

        {/* Circuit node dot at center */}
        <circle
          cx="20"
          cy="20"
          r="4"
          fill="url(#tv-logo-grad)"
          filter="url(#tv-logo-glow)"
        />

        {/* Circuit trace lines */}
        <line x1="20" y1="16" x2="20" y2="9"  stroke="url(#tv-logo-grad)" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
        <line x1="23.5" y1="22" x2="30" y2="25.5" stroke="url(#tv-logo-grad)" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
        <line x1="16.5" y1="22" x2="10" y2="25.5" stroke="url(#tv-logo-grad)" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />

        {/* Terminal dots on trace ends */}
        <circle cx="20"  cy="9"    r="1.5" fill="url(#tv-logo-grad)" opacity="0.9" />
        <circle cx="30"  cy="25.5" r="1.5" fill="url(#tv-logo-grad)" opacity="0.9" />
        <circle cx="10"  cy="25.5" r="1.5" fill="url(#tv-logo-grad)" opacity="0.9" />
      </svg>

      {/* Wordmark */}
      {wordmark && (
        <span className={`${s.text} font-bold tracking-tight leading-none`}>
          <span style={{
            background: 'linear-gradient(135deg, #e2e8f0 0%, #c4b5fd 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Tech
          </span>
          <span style={{
            background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #f472b6 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Vani
          </span>
        </span>
      )}
    </div>
  );
}
