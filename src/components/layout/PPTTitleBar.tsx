import React from 'react';
import { Search, ChevronDown, Share2, X, Minus, Square, Save, Undo2, Redo2 } from 'lucide-react';

interface PPTTitleBarProps {
  fileName?: string;
}

export function PPTTitleBar({ fileName = 'Presentation1' }: PPTTitleBarProps) {
  return (
    <div className="h-9 flex items-center select-none" style={{ minHeight: 36, background: 'hsl(174, 80%, 41%)' }}>
      {/* Left: Logo + Quick Access */}
      <div className="flex items-center gap-0.5 px-2">
        {/* Lade Slides icon */}
        <div className="w-6 h-6 flex items-center justify-center mr-1.5 rounded" style={{ background: 'hsla(0,0%,100%,0.15)' }}>
          <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none">
            <rect x="3" y="5" width="14" height="10" rx="1.5" fill="white" fillOpacity="0.95" />
            <path d="M7 8h6M7 10.5h4" stroke="hsl(174, 80%, 41%)" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="14" cy="12" r="1" fill="hsl(51, 100%, 50%)" />
          </svg>
        </div>
        
        {/* Quick access buttons */}
        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/20 text-white/90" title="Save (Ctrl+S)">
          <Save className="w-3.5 h-3.5" />
        </button>
        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/20 text-white/90" title="Undo (Ctrl+Z)">
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/20 text-white/90" title="Redo (Ctrl+Y)">
          <Redo2 className="w-3.5 h-3.5" />
        </button>
        
        <div className="w-px h-4 bg-white/20 mx-1" />
      </div>

      {/* Center: File name */}
      <div className="flex-1 flex items-center justify-center">
        <span className="text-white/70 text-xs mr-1">📄</span>
        <span className="text-white text-xs font-medium truncate max-w-xs">
          {fileName}
        </span>
        <span className="text-white/60 text-xs ml-1.5">– Lade Slides</span>
      </div>

      {/* Right: Search + Share + Window controls */}
      <div className="flex items-center">
        {/* Search */}
        <button className="h-7 flex items-center gap-1.5 px-3 rounded hover:bg-white/20 text-white/80 text-xs mr-1">
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
        </button>

        {/* Share */}
        <button className="h-7 flex items-center gap-1 px-2.5 rounded-full text-xs mr-2 font-medium" style={{ background: 'hsl(51, 100%, 50%)', color: 'hsl(174, 80%, 20%)' }}>
          <Share2 className="w-3 h-3" />
          <span>Share</span>
        </button>

        {/* Window controls */}
        <div className="flex items-center h-9">
          <button className="w-11 h-9 flex items-center justify-center hover:bg-white/20 text-white/90">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button className="w-11 h-9 flex items-center justify-center hover:bg-white/20 text-white/90">
            <Square className="w-2.5 h-2.5" strokeWidth={2} />
          </button>
          <button className="w-11 h-9 flex items-center justify-center hover:bg-red-500/80 text-white/90">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}