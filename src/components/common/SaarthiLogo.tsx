/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SaarthiLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  inverted?: boolean;
  className?: string;
}

export const SaarthiLogo: React.FC<SaarthiLogoProps> = ({
  size = 'md',
  showTagline = true,
  inverted = false,
  className = '',
}) => {
  const iconSize = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
  const titleSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';
  const taglineSize = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-xs' : 'text-[11px]';

  return (
    <div className={`flex items-center space-x-2.5 select-none ${className}`}>
      {/* Saarthi Guidance & Connection Emblem */}
      <div
        className={`${iconSize} rounded-xl ${
          inverted ? 'bg-white text-slate-900 shadow-md' : 'bg-slate-900 text-white shadow-xs'
        } flex items-center justify-center shrink-0 relative overflow-hidden`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5/6 h-5/6"
        >
          {/* Subtle background glow */}
          <circle cx="16" cy="16" r="14" fill="currentColor" fillOpacity={inverted ? '0.08' : '0.12'} />
          
          {/* Saarthi Compass & Guidance Dual Arcs */}
          <path
            d="M9 16C9 12.134 12.134 9 16 9C19.866 9 23 12.134 23 16"
            stroke="#0ea5e9"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M23 16C23 19.866 19.866 23 16 23C12.134 23 9 19.866 9 16"
            stroke="#0d9488"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          
          {/* Center Connection Core */}
          <circle cx="16" cy="16" r="3" fill="#38bdf8" />
          <circle cx="16" cy="16" r="1.5" fill="white" />
          
          {/* Forward direction arrow point */}
          <path
            d="M20 12L23 9L26 12"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-center space-x-1.5">
          <span
            className={`font-extrabold tracking-tight font-sans ${titleSize} ${
              inverted ? 'text-white' : 'text-slate-900'
            }`}
          >
            SAARTHI
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
        </div>

        {showTagline && (
          <span
            className={`font-medium tracking-wide ${taglineSize} ${
              inverted ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            Banking, Made Simpler.
          </span>
        )}
      </div>
    </div>
  );
};
