import React from 'react';
import { Search, ChevronDown, Share2, X, Minus, Square } from 'lucide-react';

interface PPTTitleBarProps {
  fileName?: string;
}

export function PPTTitleBar({ fileName = 'Presentation1' }: PPTTitleBarProps) {
  return (
    <div className="h-8 bg-[#c43e1c] flex items-center select-none" style={{ minHeight: 32 }}>
      {/* Left: Quick Access Toolbar */}
      <div className="flex items-center gap-0.5 px-2">
        {/* PowerPoint icon */}
        <div className="w-4 h-4 flex items-center justify-center mr-1">
          <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
            <rect x="1" y="3" width="14" height="10" rx="1" fill="white" fillOpacity="0.9" />
            <text x="4" y="10.5" fontSize="7" fontWeight="bold" fill="#c43e1c" fontFamily="Arial">P</text>
          </svg>
        </div>
        
        {/* Quick access buttons */}
        <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/20 text-white/90">
          <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor">
            <path d="M13 3H3v10h10V3zm-1 9H4V4h8v8z" />
          </svg>
        </button>
        <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/20 text-white/90">
          <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor">
            <path d="M4 2v12l4-3 4 3V2H4z" />
          </svg>
        </button>
        <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/20 text-white/90">
          <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor">
            <path d="M2 4h8l-3-3H2v3zm0 1v8h12V5H2zm10 3l-4 3V6l4 3z" />
          </svg>
        </button>
      </div>

      {/* Center: File name */}
      <div className="flex-1 flex items-center justify-center">
        <span className="text-white text-xs font-normal truncate max-w-xs">
          {fileName} - PowerPoint
        </span>
      </div>

      {/* Right: Search + Window controls */}
      <div className="flex items-center">
        {/* Search */}
        <button className="h-6 flex items-center gap-1.5 px-3 rounded-sm hover:bg-white/20 text-white/80 text-xs mr-2">
          <Search className="w-3 h-3" />
          <span>Search</span>
        </button>

        {/* Share */}
        <button className="h-6 flex items-center gap-1 px-2 rounded-sm hover:bg-white/20 text-white/90 text-xs mr-1">
          <Share2 className="w-3 h-3" />
        </button>

        {/* Window controls */}
        <div className="flex items-center h-8">
          <button className="w-11 h-8 flex items-center justify-center hover:bg-white/20 text-white/90">
            <Minus className="w-3 h-3" />
          </button>
          <button className="w-11 h-8 flex items-center justify-center hover:bg-white/20 text-white/90">
            <Square className="w-2.5 h-2.5" strokeWidth={2} />
          </button>
          <button className="w-11 h-8 flex items-center justify-center hover:bg-red-600 text-white/90">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
