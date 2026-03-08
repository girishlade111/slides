import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Clipboard, Scissors, Copy, Brush,
  Type, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Strikethrough,
  Square, Circle, Triangle, Image, Table,
  Minus, ChevronDown, RotateCcw, RotateCw,
  Palette, LayoutGrid, Play, Monitor,
  FileText, Grid3X3, Moon, Sun,
} from 'lucide-react';

interface PPTRibbonProps {
  showGrid: boolean;
  onToggleGrid: () => void;
  showNotes?: boolean;
  onToggleNotes?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onStartPresentation?: () => void;
  onStartPresenterView?: () => void;
}

const tabs = ['File', 'Home', 'Insert', 'Design', 'Transitions', 'Animations', 'Slide Show', 'Review', 'View'];

export function PPTRibbon({
  showGrid,
  onToggleGrid,
  showNotes,
  onToggleNotes,
  isDarkMode,
  onToggleDarkMode,
  onStartPresentation,
  onStartPresenterView,
}: PPTRibbonProps) {
  const [activeTab, setActiveTab] = useState('Home');

  return (
    <div className="bg-[#f3f3f3] border-b border-[#d1d1d1] select-none">
      {/* Tab bar */}
      <div className="flex items-end h-8 px-1 gap-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 h-7 text-xs font-normal rounded-t-sm transition-colors',
              tab === 'File'
                ? 'bg-[#c43e1c] text-white hover:bg-[#a83518] px-5'
                : activeTab === tab
                  ? 'bg-white text-[#333] border border-b-0 border-[#d1d1d1]'
                  : 'text-[#444] hover:bg-[#e5e5e5]'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Ribbon content */}
      <div className="bg-white border-t border-[#d1d1d1] h-24 flex items-stretch px-1 overflow-hidden">
        {activeTab === 'Home' && <HomeRibbon />}
        {activeTab === 'Insert' && <InsertRibbon />}
        {activeTab === 'Design' && <DesignRibbon />}
        {activeTab === 'Slide Show' && (
          <SlideShowRibbon
            onStartPresentation={onStartPresentation}
            onStartPresenterView={onStartPresenterView}
          />
        )}
        {activeTab === 'View' && (
          <ViewRibbon
            showGrid={showGrid}
            onToggleGrid={onToggleGrid}
            showNotes={showNotes}
            onToggleNotes={onToggleNotes}
            isDarkMode={isDarkMode}
            onToggleDarkMode={onToggleDarkMode}
          />
        )}
        {activeTab === 'Transitions' && <PlaceholderRibbon label="Transitions" />}
        {activeTab === 'Animations' && <PlaceholderRibbon label="Animations" />}
        {activeTab === 'Review' && <PlaceholderRibbon label="Review" />}
        {activeTab === 'File' && <PlaceholderRibbon label="File" />}
      </div>
    </div>
  );
}

function RibbonGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full border-r border-[#e0e0e0] last:border-r-0">
      <div className="flex-1 flex items-center gap-0.5 px-2 pt-1">
        {children}
      </div>
      <div className="text-[10px] text-[#666] text-center pb-1 px-1">
        {label}
      </div>
    </div>
  );
}

function RibbonButton({ icon: Icon, label, large, onClick, active }: {
  icon: React.ElementType;
  label: string;
  large?: boolean;
  onClick?: () => void;
  active?: boolean;
}) {
  if (large) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex flex-col items-center gap-0.5 px-3 py-1 rounded hover:bg-[#e5e5e5] min-w-[52px]",
          active && "bg-[#cce4f7]"
        )}
      >
        <Icon className="w-6 h-6 text-[#444]" strokeWidth={1.5} />
        <span className="text-[10px] text-[#444] leading-tight">{label}</span>
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-7 h-7 flex items-center justify-center rounded hover:bg-[#e5e5e5]",
        active && "bg-[#cce4f7]"
      )}
      title={label}
    >
      <Icon className="w-3.5 h-3.5 text-[#444]" strokeWidth={1.5} />
    </button>
  );
}

function HomeRibbon() {
  return (
    <>
      {/* Clipboard */}
      <RibbonGroup label="Clipboard">
        <RibbonButton icon={Clipboard} label="Paste" large />
        <div className="flex flex-col gap-0.5">
          <RibbonButton icon={Scissors} label="Cut" />
          <RibbonButton icon={Copy} label="Copy" />
          <RibbonButton icon={Brush} label="Format Painter" />
        </div>
      </RibbonGroup>

      {/* Slides */}
      <RibbonGroup label="Slides">
        <div className="flex flex-col gap-0.5">
          <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#e5e5e5] text-[10px] text-[#444]">
            <LayoutGrid className="w-3.5 h-3.5" strokeWidth={1.5} />
            New Slide
            <ChevronDown className="w-2.5 h-2.5" />
          </button>
          <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#e5e5e5] text-[10px] text-[#444]">
            <LayoutGrid className="w-3.5 h-3.5" strokeWidth={1.5} />
            Layout
            <ChevronDown className="w-2.5 h-2.5" />
          </button>
        </div>
      </RibbonGroup>

      {/* Font */}
      <RibbonGroup label="Font">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-0.5">
            <div className="h-6 px-2 border border-[#c0c0c0] rounded-sm text-[11px] flex items-center min-w-[100px] bg-white text-[#333]">
              Calibri
              <ChevronDown className="w-2.5 h-2.5 ml-auto text-[#666]" />
            </div>
            <div className="h-6 px-2 border border-[#c0c0c0] rounded-sm text-[11px] flex items-center w-10 bg-white text-[#333] justify-center">
              18
              <ChevronDown className="w-2.5 h-2.5 ml-0.5 text-[#666]" />
            </div>
          </div>
          <div className="flex items-center gap-0">
            <RibbonButton icon={Bold} label="Bold" />
            <RibbonButton icon={Italic} label="Italic" />
            <RibbonButton icon={Underline} label="Underline" />
            <RibbonButton icon={Strikethrough} label="Strikethrough" />
            <div className="w-px h-4 bg-[#d0d0d0] mx-0.5" />
            <RibbonButton icon={Type} label="Font Color" />
          </div>
        </div>
      </RibbonGroup>

      {/* Paragraph */}
      <RibbonGroup label="Paragraph">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-0">
            <RibbonButton icon={AlignLeft} label="Align Left" />
            <RibbonButton icon={AlignCenter} label="Center" />
            <RibbonButton icon={AlignRight} label="Align Right" />
            <RibbonButton icon={AlignJustify} label="Justify" />
          </div>
          <div className="flex items-center gap-0">
            <button className="h-6 px-2 flex items-center gap-0.5 rounded hover:bg-[#e5e5e5] text-[10px] text-[#444]">
              <Minus className="w-3 h-3" />
              Line Spacing
              <ChevronDown className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </RibbonGroup>

      {/* Drawing */}
      <RibbonGroup label="Drawing">
        <div className="flex items-center gap-0.5">
          <RibbonButton icon={Square} label="Rectangle" />
          <RibbonButton icon={Circle} label="Oval" />
          <RibbonButton icon={Triangle} label="Triangle" />
          <RibbonButton icon={Minus} label="Line" />
        </div>
      </RibbonGroup>
    </>
  );
}

function InsertRibbon() {
  return (
    <>
      <RibbonGroup label="Slides">
        <RibbonButton icon={LayoutGrid} label="New Slide" large />
      </RibbonGroup>
      <RibbonGroup label="Tables">
        <RibbonButton icon={Table} label="Table" large />
      </RibbonGroup>
      <RibbonGroup label="Images">
        <RibbonButton icon={Image} label="Pictures" large />
      </RibbonGroup>
      <RibbonGroup label="Illustrations">
        <div className="flex items-center gap-0.5">
          <RibbonButton icon={Square} label="Shapes" />
          <RibbonButton icon={Circle} label="Icons" />
        </div>
      </RibbonGroup>
      <RibbonGroup label="Text">
        <RibbonButton icon={Type} label="Text Box" large />
      </RibbonGroup>
    </>
  );
}

function DesignRibbon() {
  return (
    <>
      <RibbonGroup label="Themes">
        <div className="flex items-center gap-1">
          {['#ffffff', '#1a3a5c', '#2d4a22', '#5b2c6f', '#7b241c'].map((color, i) => (
            <button
              key={i}
              className="w-14 h-10 rounded border border-[#c0c0c0] hover:border-[#0078d4] hover:ring-1 hover:ring-[#0078d4]"
              style={{ background: color }}
            />
          ))}
        </div>
      </RibbonGroup>
      <RibbonGroup label="Variants">
        <div className="flex items-center gap-1">
          {['#e8eaf6', '#e3f2fd', '#e8f5e9', '#fff3e0'].map((color, i) => (
            <button
              key={i}
              className="w-8 h-8 rounded border border-[#c0c0c0] hover:border-[#0078d4]"
              style={{ background: color }}
            />
          ))}
        </div>
      </RibbonGroup>
      <RibbonGroup label="Customize">
        <RibbonButton icon={Palette} label="Format Background" large />
      </RibbonGroup>
    </>
  );
}

function SlideShowRibbon({ onStartPresentation, onStartPresenterView }: {
  onStartPresentation?: () => void;
  onStartPresenterView?: () => void;
}) {
  return (
    <>
      <RibbonGroup label="Start Slide Show">
        <RibbonButton icon={Play} label="From Beginning" large onClick={onStartPresentation} />
        <RibbonButton icon={Play} label="From Current" large onClick={onStartPresentation} />
      </RibbonGroup>
      <RibbonGroup label="Monitors">
        <RibbonButton icon={Monitor} label="Presenter View" large onClick={onStartPresenterView} />
      </RibbonGroup>
    </>
  );
}

function ViewRibbon({ showGrid, onToggleGrid, showNotes, onToggleNotes, isDarkMode, onToggleDarkMode }: {
  showGrid: boolean;
  onToggleGrid: () => void;
  showNotes?: boolean;
  onToggleNotes?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}) {
  return (
    <>
      <RibbonGroup label="Presentation Views">
        <RibbonButton icon={LayoutGrid} label="Normal" large active={!showGrid} />
        <RibbonButton icon={Grid3X3} label="Slide Sorter" large onClick={onToggleGrid} active={showGrid} />
      </RibbonGroup>
      <RibbonGroup label="Show">
        <div className="flex flex-col gap-1">
          {onToggleNotes && (
            <label className="flex items-center gap-1.5 text-[10px] text-[#444] cursor-pointer">
              <input
                type="checkbox"
                checked={showNotes}
                onChange={onToggleNotes}
                className="w-3 h-3 accent-[#0078d4]"
              />
              Notes
            </label>
          )}
          <label className="flex items-center gap-1.5 text-[10px] text-[#444] cursor-pointer">
            <input type="checkbox" className="w-3 h-3 accent-[#0078d4]" />
            Ruler
          </label>
          <label className="flex items-center gap-1.5 text-[10px] text-[#444] cursor-pointer">
            <input type="checkbox" className="w-3 h-3 accent-[#0078d4]" />
            Gridlines
          </label>
        </div>
      </RibbonGroup>
      {onToggleDarkMode && (
        <RibbonGroup label="Theme">
          <RibbonButton
            icon={isDarkMode ? Sun : Moon}
            label={isDarkMode ? 'Light' : 'Dark'}
            large
            onClick={onToggleDarkMode}
          />
        </RibbonGroup>
      )}
    </>
  );
}

function PlaceholderRibbon({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center flex-1 text-xs text-[#999]">
      {label} tools
    </div>
  );
}
