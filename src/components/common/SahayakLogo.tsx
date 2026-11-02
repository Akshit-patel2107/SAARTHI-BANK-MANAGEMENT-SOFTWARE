/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles } from 'lucide-react';

interface SahayakLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  inverted?: boolean;
  className?: string;
}

export const SahayakLogo: React.FC<SahayakLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  inverted = false,
  className = '',
}) => {
  const iconBoxSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const titleSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const subtitleSize = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-xs' : 'text-[11px]';

  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {/* Emblem */}
      <div
        className={`${iconBoxSize} rounded-2xl ${
          inverted
            ? 'bg-white text-blue-900 shadow-md ring-1 ring-slate-100'
            : 'bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 text-white shadow-md shadow-blue-900/10'
        } flex items-center justify-center shrink-0 relative overflow-hidden`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4"
        >
          {/* Circular intelligence orbit */}
          <circle cx="16" cy="16" r="13" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="3 3" />
          
          {/* Stylized 'S' AI spark wave */}
          <path
            d="M10 20C10 16.5 13 14 16 14C19 14 22 11.5 22 8"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M22 12C22 15.5 19 18 16 18C13 18 10 20.5 10 24"
            stroke="#2dd4bf"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Core Spark Node */}
          <circle cx="16" cy="16" r="2.5" fill="#ffffff" />
          <circle cx="22" cy="8" r="1.5" fill="#38bdf8" />
          <circle cx="10" cy="24" r="1.5" fill="#2dd4bf" />
        </svg>
      </div>

      <div className="flex flex-col leading-tight">
        <div className="flex items-center space-x-1.5">
          <span
            className={`font-extrabold tracking-tight ${titleSize} ${
              inverted ? 'text-white' : 'text-slate-900'
            }`}
          >
            Sahayak<span className="text-blue-600 font-black ml-0.5">AI</span>
          </span>
          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider">
            Banking
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`${subtitleSize} font-medium ${
              inverted ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            Intelligent Banking Assistance Platform
          </span>
        )}
      </div>
    </div>
  );
};
