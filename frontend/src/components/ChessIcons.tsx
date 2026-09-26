import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

export const ChessKing: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    stroke="none"
  >
    <path d="M12 2a1 1 0 0 1 1 1v1h1a1 1 0 1 1 0 2h-1v1.17c2.6.49 4.5 2.76 4.5 5.5 0 1.25-.42 2.4-1.12 3.33H19a1 1 0 1 1 0 2h-1.5v2a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-2H5a1 1 0 1 1 0-2h2.62A5.46 5.46 0 0 1 6.5 12.67C6.5 9.93 8.4 7.66 11 7.17V6h-1a1 1 0 1 1 0-2h1V3a1 1 0 0 1 1-1zm3.5 16h-7v1h7v-1zm1.25-3.33H7.25c.5.98 1.48 1.66 2.62 1.83h4.26c1.14-.17 2.12-.85 2.62-1.83zM12 8.67c-2.21 0-4 1.79-4 4 0 .7.18 1.35.5 1.92h7c.32-.57.5-1.22.5-1.92 0-2.21-1.79-4-4-4z" />
  </svg>
);

export const ChessQueen: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    stroke="none"
  >
    <path d="M12 2.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM5 5.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM8.5 7.5l2.25 4.5 1.25-3.5 1.25 3.5 2.25-4.5 2 7.5H6.5l2-7.5zm-3.8 9.5h14.6l-1 3H5.7l-1-3zm-1 4h16.6a.7.7 0 0 1 .7.7v.8H3v-.8a.7.7 0 0 1 .7-.7z" />
  </svg>
);

export const ChessRook: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    stroke="none"
  >
    <path d="M5 4h2v2h2V4h2v2h2V4h2v2h2V4h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1l-1 8h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h1l-1-8H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm1 14h12l.88-7H5.12L6 18zm12-9V6H6v3h12z" />
  </svg>
);

export const ChessKnight: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    stroke="none"
  >
    <path d="M19 18a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h1.1a7.48 7.48 0 0 1 1.4-4.5c.34-.45.74-.86 1.18-1.22L8.2 8.8a1 1 0 0 1-.2-1.1c.36-.78 1.12-2.7 3.5-3.6 2.5-.95 4.8.4 5.7 2.4.6 1.34.4 2.8-.2 4.1.8.8 1.4 1.7 1.8 2.8.5 1.3.3 2.7-.8 3.6h1a1 1 0 0 1 1 1v1zm-3.2-6.5c.5-.9.7-1.8.3-2.7-.6-1.3-2.1-2.2-3.8-1.6-1.2.45-1.7 1.3-1.9 1.9l2.8 2.1c.8.6 1.4 1.3 1.8 2.1.5-.6.8-1.2.8-1.8z" />
  </svg>
);

export const ChessBishop: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    stroke="none"
  >
    <path d="M12 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0 4.2c-2.8 0-5 2.5-5 5.8 0 2.2 1.1 4.2 2.8 5.4H8a1 1 0 0 0-1 1v1.6h10V18.4a1 1 0 0 0-1-1h-1.8c1.7-1.2 2.8-3.2 2.8-5.4 0-3.3-2.2-5.8-5-5.8zm-1 3.8v2H9v1h2v3h1v-3h2v-1h-2v-2h-1z" />
  </svg>
);

export const ChessPawn: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    stroke="none"
  >
    <path d="M12 3a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm3 8h-6a1 1 0 0 0-.9 1.45l2.1 4.55H8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-2.2l2.1-4.55A1 1 0 0 0 15 11z" />
  </svg>
);

// Chess.com style judgment badge icons
export const JudgmentBadgeIcon: React.FC<{
  type: string;
  size?: number;
  className?: string;
}> = ({ type, size = 18, className = '' }) => {
  switch (type) {
    case 'BRILLIANT':
      return (
        <span
          style={{ width: size, height: size }}
          className={`inline-flex items-center justify-center rounded-full bg-[#1baca6] text-white font-black text-[10px] shadow-md shadow-teal-500/30 ${className}`}
        >
          !!
        </span>
      );
    case 'GREAT':
      return (
        <span
          style={{ width: size, height: size }}
          className={`inline-flex items-center justify-center rounded-full bg-[#5c8bb0] text-white font-black text-[11px] shadow-md ${className}`}
        >
          !
        </span>
      );
    case 'BEST':
      return (
        <span
          style={{ width: size, height: size }}
          className={`inline-flex items-center justify-center rounded-full bg-[#81b64c] text-white font-black text-[11px] shadow-md shadow-emerald-500/30 ${className}`}
        >
          ★
        </span>
      );
    case 'EXCELLENT':
      return (
        <span
          style={{ width: size, height: size }}
          className={`inline-flex items-center justify-center rounded-full bg-[#96bc4b] text-white font-bold text-[10px] shadow-md ${className}`}
        >
          ✓
        </span>
      );
    case 'GOOD':
      return (
        <span
          style={{ width: size, height: size }}
          className={`inline-flex items-center justify-center rounded-full bg-[#a3b18a] text-slate-900 font-bold text-[10px] shadow-sm ${className}`}
        >
          ○
        </span>
      );
    case 'BOOK':
      return (
        <span
          style={{ width: size, height: size }}
          className={`inline-flex items-center justify-center rounded-full bg-[#a88865] text-white font-bold text-[9px] shadow-sm ${className}`}
        >
          📖
        </span>
      );
    case 'FORCED':
      return (
        <span
          style={{ width: size, height: size }}
          className={`inline-flex items-center justify-center rounded-full bg-[#64748b] text-white font-bold text-[9px] shadow-sm ${className}`}
        >
          □
        </span>
      );
    case 'INACCURACY':
      return (
        <span
          style={{ width: size, height: size }}
          className={`inline-flex items-center justify-center rounded-full bg-[#f0c15c] text-slate-950 font-black text-[10px] shadow-md shadow-amber-500/20 ${className}`}
        >
          ?!
        </span>
      );
    case 'MISTAKE':
      return (
        <span
          style={{ width: size, height: size }}
          className={`inline-flex items-center justify-center rounded-full bg-[#e58f2a] text-white font-black text-[11px] shadow-md shadow-orange-500/30 ${className}`}
        >
          ?
        </span>
      );
    case 'MISSED_WIN':
      return (
        <span
          style={{ width: size, height: size }}
          className={`inline-flex items-center justify-center rounded-full bg-[#db4373] text-white font-black text-[10px] shadow-md shadow-pink-500/30 ${className}`}
        >
          ✕
        </span>
      );
    case 'BLUNDER':
      return (
        <span
          style={{ width: size, height: size }}
          className={`inline-flex items-center justify-center rounded-full bg-[#ca3431] text-white font-black text-[10px] shadow-md shadow-red-500/40 animate-pulse ${className}`}
        >
          ??
        </span>
      );
    default:
      return null;
  }
};
