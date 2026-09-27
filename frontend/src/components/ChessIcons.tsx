import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

// ============================================================================
// HIGH-DEFINITION STAUNTON CHESS PIECES (With highlights and detailed curves)
// ============================================================================

export const ChessKing: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 45 45"
    className={`inline-block drop-shadow-sm ${className}`}
  >
    <g
      fill="none"
      fillRule="evenodd"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M22.5 11.63V6M20 8h5"
        strokeLinejoin="miter"
      />
      <path
        d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"
        fill="currentColor"
        fillOpacity="0.25"
      />
      <path
        d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V23.5h-1V23.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0" />
      <path d="M9 40c6-3 20-3 26 0" />
    </g>
  </svg>
);

export const ChessQueen: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 45 45"
    className={`inline-block drop-shadow-sm ${className}`}
  >
    <g
      fill="none"
      fillRule="evenodd"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6" cy="12" r="2.75" fill="currentColor" fillOpacity="0.4" />
      <circle cx="14" cy="9" r="2.75" fill="currentColor" fillOpacity="0.4" />
      <circle cx="22.5" cy="8" r="2.75" fill="currentColor" fillOpacity="0.4" />
      <circle cx="31" cy="9" r="2.75" fill="currentColor" fillOpacity="0.4" />
      <circle cx="39" cy="12" r="2.75" fill="currentColor" fillOpacity="0.4" />
      <path
        d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-7.5-14-7.5 14-7-11 2 12z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"
        fill="currentColor"
        fillOpacity="0.25"
      />
      <path d="M11 38.5c7-3 17-3 24 0" />
      <path d="M12 35.5c6-2 15-2 21 0" />
      <path d="M12.5 32c5.5-1.5 14.5-1.5 20 0" />
    </g>
  </svg>
);

export const ChessRook: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 45 45"
    className={`inline-block drop-shadow-sm ${className}`}
  >
    <g
      fill="none"
      fillRule="evenodd"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5"
        strokeLinejoin="miter"
      />
      <path
        d="M12 35v-4h21v4H12z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M13 14l1.5 14h16l1.5-14H13z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M14 28.5c5-1 12-1 17 0M14 17.5c5-1 12-1 17 0"
      />
      <path
        d="M11 14h23"
        strokeLinejoin="miter"
      />
    </g>
  </svg>
);

export const ChessKnight: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 45 45"
    className={`inline-block drop-shadow-sm ${className}`}
  >
    <g
      fill="none"
      fillRule="evenodd"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"
        fill="currentColor"
        fillOpacity="0.25"
      />
      <circle cx="9.5" cy="25.5" r="1" fill="currentColor" />
      <path
        d="M15 15.5c.2 1.3 1.5 2.3 3 2.5"
        strokeLinecap="round"
      />
      <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" fill="currentColor" />
      <path d="M24 29c4-1 9-1 12 0" />
      <path d="M15 39h23" />
    </g>
  </svg>
);

export const ChessBishop: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 45 45"
    className={`inline-block drop-shadow-sm ${className}`}
  >
    <g
      fill="none"
      fillRule="evenodd"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M9 36c3.39-.97 10.11.04 13.5-2 3.39 2.04 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.04-13.5-2-3.39 2.04-10.11 1.03-13.5 2-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"
        fill="currentColor"
        fillOpacity="0.25"
      />
      <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" fill="currentColor" fillOpacity="0.4" />
      <path d="M17.5 26h10M15 30h15" />
      <path d="M22.5 15.5v5M20 18h5" />
    </g>
  </svg>
);

export const ChessPawn: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 45 45"
    className={`inline-block drop-shadow-sm ${className}`}
  >
    <g
      fill="none"
      fillRule="evenodd"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
        fill="currentColor"
        fillOpacity="0.25"
      />
      <path d="M12 39.5h21" />
      <path d="M14 36c4-1.5 13-1.5 17 0" />
    </g>
  </svg>
);

// ============================================================================
// HIGH-DEFINITION 3D JUDGMENT BADGES (With specular reflections and 3D depth)
// ============================================================================

export const JudgmentBadgeIcon: React.FC<{
  type: string;
  size?: number;
  className?: string;
}> = ({ type, size = 22, className = '' }) => {
  const s = size;

  // Gradient definitions & styles for each badge type
  switch (type) {
    case 'BRILLIANT':
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 36 36"
          className={`inline-block shrink-0 drop-shadow-[0_2px_6px_rgba(27,172,166,0.6)] ${className}`}
        >
          <defs>
            <linearGradient id="brilliant-base" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2cece4" />
              <stop offset="60%" stopColor="#1baca6" />
              <stop offset="100%" stopColor="#0d7974" />
            </linearGradient>
            <linearGradient id="brilliant-glow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle cx="18" cy="18" r="16.5" fill="url(#brilliant-base)" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
          <path d="M 5 16 A 13 13 0 0 1 31 16 A 13 8 0 0 0 5 16 Z" fill="url(#brilliant-glow)" />
          {/* Cyan sparkle accent */}
          <polygon points="18,4 19.5,7 22,7 20,9 21,12 18,10 15,12 16,9 14,7 16.5,7" fill="#ffffff" opacity="0.9" />
          <text
            x="18"
            y="26"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="18"
            fill="#ffffff"
            letterSpacing="-1"
          >
            !!
          </text>
        </svg>
      );

    case 'GREAT':
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 36 36"
          className={`inline-block shrink-0 drop-shadow-[0_2px_6px_rgba(59,130,246,0.5)] ${className}`}
        >
          <defs>
            <linearGradient id="great-base" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="60%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="great-gloss" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle cx="18" cy="18" r="16.5" fill="url(#great-base)" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
          <path d="M 5 16 A 13 13 0 0 1 31 16 A 13 8 0 0 0 5 16 Z" fill="url(#great-gloss)" />
          <text
            x="18"
            y="26"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="21"
            fill="#ffffff"
          >
            !
          </text>
        </svg>
      );

    case 'BEST':
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 36 36"
          className={`inline-block shrink-0 drop-shadow-[0_2px_6px_rgba(129,182,76,0.6)] ${className}`}
        >
          <defs>
            <linearGradient id="best-base" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#9cdb5e" />
              <stop offset="60%" stopColor="#81b64c" />
              <stop offset="100%" stopColor="#4f7528" />
            </linearGradient>
            <linearGradient id="best-gloss" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle cx="18" cy="18" r="16.5" fill="url(#best-base)" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
          <path d="M 5 16 A 13 13 0 0 1 31 16 A 13 8 0 0 0 5 16 Z" fill="url(#best-gloss)" />
          {/* Golden star with bevel */}
          <polygon
            points="18,7 21.2,14.5 29.5,15.2 23.2,20.8 25,29 18,24.8 11,29 12.8,20.8 6.5,15.2 14.8,14.5"
            fill="#ffffff"
          />
        </svg>
      );

    case 'EXCELLENT':
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 36 36"
          className={`inline-block shrink-0 drop-shadow-[0_2px_6px_rgba(150,188,75,0.5)] ${className}`}
        >
          <defs>
            <linearGradient id="exc-base" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#b6e067" />
              <stop offset="60%" stopColor="#96bc4b" />
              <stop offset="100%" stopColor="#67882b" />
            </linearGradient>
            <linearGradient id="exc-gloss" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle cx="18" cy="18" r="16.5" fill="url(#exc-base)" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
          <path d="M 5 16 A 13 13 0 0 1 31 16 A 13 8 0 0 0 5 16 Z" fill="url(#exc-gloss)" />
          {/* Bold checkmark */}
          <path
            d="M 11 18.5 L 16 23.5 L 26 13.5"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'GOOD':
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 36 36"
          className={`inline-block shrink-0 drop-shadow-sm ${className}`}
        >
          <defs>
            <linearGradient id="good-base" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#b8c9a3" />
              <stop offset="60%" stopColor="#a3b18a" />
              <stop offset="100%" stopColor="#6e7a57" />
            </linearGradient>
          </defs>
          <circle cx="18" cy="18" r="16.5" fill="url(#good-base)" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
          <circle cx="18" cy="18" r="7" fill="none" stroke="#ffffff" strokeWidth="3" />
        </svg>
      );

    case 'BOOK':
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 36 36"
          className={`inline-block shrink-0 drop-shadow-[0_2px_5px_rgba(168,136,101,0.5)] ${className}`}
        >
          <defs>
            <linearGradient id="book-base" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c7a783" />
              <stop offset="60%" stopColor="#a88865" />
              <stop offset="100%" stopColor="#735639" />
            </linearGradient>
          </defs>
          <circle cx="18" cy="18" r="16.5" fill="url(#book-base)" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
          {/* 3D Open Book Vector */}
          <path
            d="M 10 13 C 14 11 18 13 18 13 C 18 13 22 11 26 13 L 26 24 C 22 22 18 24 18 24 C 18 24 14 22 10 24 Z"
            fill="#ffffff"
          />
          <line x1="18" y1="13" x2="18" y2="24" stroke="#735639" strokeWidth="1.5" />
        </svg>
      );

    case 'FORCED':
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 36 36"
          className={`inline-block shrink-0 drop-shadow-sm ${className}`}
        >
          <defs>
            <linearGradient id="forced-base" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="60%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>
          <circle cx="18" cy="18" r="16.5" fill="url(#forced-base)" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
          <rect x="12" y="12" width="12" height="12" rx="2" fill="none" stroke="#ffffff" strokeWidth="3" />
        </svg>
      );

    case 'INACCURACY':
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 36 36"
          className={`inline-block shrink-0 drop-shadow-[0_2px_6px_rgba(245,158,11,0.5)] ${className}`}
        >
          <defs>
            <linearGradient id="inacc-base" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="inacc-gloss" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle cx="18" cy="18" r="16.5" fill="url(#inacc-base)" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
          <path d="M 5 16 A 13 13 0 0 1 31 16 A 13 8 0 0 0 5 16 Z" fill="url(#inacc-gloss)" />
          <text
            x="18"
            y="26"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="18"
            fill="#ffffff"
            letterSpacing="-1"
          >
            ?!
          </text>
        </svg>
      );

    case 'MISTAKE':
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 36 36"
          className={`inline-block shrink-0 drop-shadow-[0_2px_6px_rgba(234,88,12,0.5)] ${className}`}
        >
          <defs>
            <linearGradient id="mistake-base" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="60%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#9a3412" />
            </linearGradient>
            <linearGradient id="mistake-gloss" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle cx="18" cy="18" r="16.5" fill="url(#mistake-base)" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
          <path d="M 5 16 A 13 13 0 0 1 31 16 A 13 8 0 0 0 5 16 Z" fill="url(#mistake-gloss)" />
          <text
            x="18"
            y="26"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="21"
            fill="#ffffff"
          >
            ?
          </text>
        </svg>
      );

    case 'MISSED_WIN':
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 36 36"
          className={`inline-block shrink-0 drop-shadow-[0_2px_6px_rgba(219,39,119,0.5)] ${className}`}
        >
          <defs>
            <linearGradient id="missed-base" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="60%" stopColor="#db2777" />
              <stop offset="100%" stopColor="#9d174d" />
            </linearGradient>
            <linearGradient id="missed-gloss" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle cx="18" cy="18" r="16.5" fill="url(#missed-base)" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
          <path d="M 5 16 A 13 13 0 0 1 31 16 A 13 8 0 0 0 5 16 Z" fill="url(#missed-gloss)" />
          {/* Target with Cross */}
          <path
            d="M 12 12 L 24 24 M 24 12 L 12 24"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'BLUNDER':
      return (
        <svg
          width={s}
          height={s}
          viewBox="0 0 36 36"
          className={`inline-block shrink-0 drop-shadow-[0_2px_8px_rgba(220,38,38,0.7)] animate-pulse ${className}`}
        >
          <defs>
            <linearGradient id="blunder-base" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="60%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
            <linearGradient id="blunder-gloss" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle cx="18" cy="18" r="16.5" fill="url(#blunder-base)" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
          <path d="M 5 16 A 13 13 0 0 1 31 16 A 13 8 0 0 0 5 16 Z" fill="url(#blunder-gloss)" />
          <text
            x="18"
            y="26"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="18"
            fill="#ffffff"
            letterSpacing="-1"
          >
            ??
          </text>
        </svg>
      );

    default:
      return null;
  }
};
