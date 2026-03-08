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
  PenTool, ArrowRight, Star, Hexagon,
  Upload, Film, BarChart3, PieChart,
  Sparkles, Zap, Clock, Eye,
  Columns, SplitSquareHorizontal,
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

const LADE_TEAL = 'hsl(174, 80%, 41%)';
const LADE_TEAL_HOVER = 'hsl(174, 80%, 35%)';
const LADE_GOLD = 'hsl(51, 100%, 50%)';

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
    <div className="bg-[#f8f9fa] border-b border-[#e0e0e0] select-none">
      {/* Tab bar */}
      <div className="flex items-end h-9 px-1 gap-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 h-8 text-[11px] font-medium rounded-t transition-colors',
              tab === 'File'
                ? 'text-white hover:opacity-90 px-5'
                : activeTab === tab
                  ? 'bg-white text-[#333] border border-b-0 border-[#e0e0e0]'
                  : 'text-[#555] hover:bg-[#eef0f2]'
            )}
            style={tab === 'File' ? { background: LADE_TEAL } : undefined}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Ribbon content */}
      <div className="bg-white border-t border-[#e0e0e0] h-[100px] flex items-stretch px-1 overflow-hidden">
        {activeTab === 'Home' && <HomeRibbon />}
        {activeTab === 'Insert' && <InsertRibbon />}
        {activeTab === 'Design' && <DesignRibbon />}
        {activeTab === 'Transitions' && <TransitionsRibbon />}
        {activeTab === 'Animations' && <AnimationsRibbon />}
        {activeTab === 'Slide Show' && (
          <SlideShowRibbon
            onStartPresentation={onStartPresentation}
            onStartPresenterView={onStartPresenterView}
          />
        )}
        {activeTab === 'Review' && <ReviewRibbon />}
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
        {activeTab === 'File' && <FileRibbon />}
      </div>
    </div>
  );
}

function RibbonGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full border-r border-[#e8e8e8] last:border-r-0">
      <div className="flex-1 flex items-center gap-0.5 px-3 pt-1.5">
        {children}
      </div>
      <div className="text-[10px] text-[#888] text-center pb-1.5 px-1 font-medium">
        {label}
      </div>
    </div>
  );
}

function RibbonButton({ icon: Icon, label, large, onClick, active, accent }: {
  icon: React.ElementType;
  label: string;
  large?: boolean;
  onClick?: () => void;
  active?: boolean;
  accent?: boolean;
}) {
  if (large) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex flex-col items-center gap-1 px-3 py-1.5 rounded-md min-w-[56px]",
          accent
            ? "hover:bg-[#e6f7f6]"
            : "hover:bg-[#f0f0f0]",
          active && "bg-[#e6f7f6] ring-1 ring-[#20B2AA]/30"
        )}
      >
        <Icon className={cn("w-7 h-7", accent ? "text-[#20B2AA]" : "text-[#444]")} strokeWidth={1.5} />
        <span className="text-[10px] text-[#555] leading-tight font-medium">{label}</span>
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-7 h-7 flex items-center justify-center rounded hover:bg-[#f0f0f0]",
        active && "bg-[#e6f7f6]"
      )}
      title={label}
    >
      <Icon className="w-3.5 h-3.5 text-[#555]" strokeWidth={1.5} />
    </button>
  );
}

function HomeRibbon() {
  return (
    <>
      <RibbonGroup label="Clipboard">
        <RibbonButton icon={Clipboard} label="Paste" large accent />
        <div className="flex flex-col gap-0.5">
          <RibbonButton icon={Scissors} label="Cut" />
          <RibbonButton icon={Copy} label="Copy" />
          <RibbonButton icon={Brush} label="Format Painter" />
        </div>
      </RibbonGroup>

      <RibbonGroup label="Slides">
        <div className="flex flex-col gap-1">
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-[#f0f0f0] text-[11px] text-[#444] font-medium">
            <LayoutGrid className="w-4 h-4 text-[#20B2AA]" strokeWidth={1.5} />
            New Slide
            <ChevronDown className="w-3 h-3 text-[#999]" />
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-[#f0f0f0] text-[11px] text-[#444] font-medium">
            <SplitSquareHorizontal className="w-4 h-4" strokeWidth={1.5} />
            Layout
            <ChevronDown className="w-3 h-3 text-[#999]" />
          </button>
        </div>
      </RibbonGroup>

      <RibbonGroup label="Font">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1">
            <div className="h-6 px-2 border border-[#d0d0d0] rounded text-[11px] flex items-center min-w-[110px] bg-white text-[#333] cursor-pointer hover:border-[#20B2AA]">
              Calibri
              <ChevronDown className="w-3 h-3 ml-auto text-[#999]" />
            </div>
            <div className="h-6 px-2 border border-[#d0d0d0] rounded text-[11px] flex items-center w-12 bg-white text-[#333] justify-center cursor-pointer hover:border-[#20B2AA]">
              18
              <ChevronDown className="w-3 h-3 ml-0.5 text-[#999]" />
            </div>
          </div>
          <div className="flex items-center gap-0">
            <RibbonButton icon={Bold} label="Bold (Ctrl+B)" />
            <RibbonButton icon={Italic} label="Italic (Ctrl+I)" />
            <RibbonButton icon={Underline} label="Underline (Ctrl+U)" />
            <RibbonButton icon={Strikethrough} label="Strikethrough" />
            <div className="w-px h-4 bg-[#e0e0e0] mx-0.5" />
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#f0f0f0]" title="Font Color">
              <div className="flex flex-col items-center">
                <Type className="w-3.5 h-3.5 text-[#555]" strokeWidth={1.5} />
                <div className="w-3.5 h-0.5 rounded-full mt-px" style={{ background: LADE_TEAL }} />
              </div>
            </button>
          </div>
        </div>
      </RibbonGroup>

      <RibbonGroup label="Paragraph">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-0">
            <RibbonButton icon={AlignLeft} label="Align Left" />
            <RibbonButton icon={AlignCenter} label="Center" />
            <RibbonButton icon={AlignRight} label="Align Right" />
            <RibbonButton icon={AlignJustify} label="Justify" />
          </div>
          <div className="flex items-center gap-0">
            <button className="h-6 px-2 flex items-center gap-1 rounded hover:bg-[#f0f0f0] text-[10px] text-[#555] font-medium">
              <Columns className="w-3 h-3" />
              Spacing
              <ChevronDown className="w-2.5 h-2.5 text-[#999]" />
            </button>
          </div>
        </div>
      </RibbonGroup>

      <RibbonGroup label="Drawing">
        <div className="flex items-center gap-1">
          <RibbonButton icon={Square} label="Rectangle" />
          <RibbonButton icon={Circle} label="Oval" />
          <RibbonButton icon={Triangle} label="Triangle" />
          <RibbonButton icon={ArrowRight} label="Arrow" />
          <RibbonButton icon={Star} label="Star" />
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
        <RibbonButton icon={LayoutGrid} label="New Slide" large accent />
      </RibbonGroup>
      <RibbonGroup label="Tables">
        <RibbonButton icon={Table} label="Table" large />
      </RibbonGroup>
      <RibbonGroup label="Images">
        <RibbonButton icon={Image} label="Pictures" large />
        <RibbonButton icon={Upload} label="Upload" large />
      </RibbonGroup>
      <RibbonGroup label="Illustrations">
        <div className="flex items-center gap-1">
          <RibbonButton icon={Square} label="Shapes" />
          <RibbonButton icon={Hexagon} label="Icons" />
          <RibbonButton icon={PenTool} label="Draw" />
        </div>
      </RibbonGroup>
      <RibbonGroup label="Charts">
        <div className="flex items-center gap-1">
          <RibbonButton icon={BarChart3} label="Bar Chart" />
          <RibbonButton icon={PieChart} label="Pie Chart" />
        </div>
      </RibbonGroup>
      <RibbonGroup label="Text">
        <RibbonButton icon={Type} label="Text Box" large accent />
      </RibbonGroup>
      <RibbonGroup label="Media">
        <RibbonButton icon={Film} label="Video" large />
      </RibbonGroup>
    </>
  );
}

function DesignRibbon() {
  const themes = [
    { name: 'Light', bg: '#ffffff', border: '#e0e0e0' },
    { name: 'Modern Dark', bg: '#1a2332', border: '#1a2332' },
    { name: 'Teal', bg: '#20B2AA', border: '#20B2AA' },
    { name: 'Nature', bg: '#2d5a27', border: '#2d5a27' },
    { name: 'Royal', bg: '#5b2c6f', border: '#5b2c6f' },
    { name: 'Sunset', bg: 'linear-gradient(135deg, #f59e0b, #ef4444)', border: '#f59e0b' },
    { name: 'Ocean', bg: '#1e3a5f', border: '#1e3a5f' },
  ];
  return (
    <>
      <RibbonGroup label="Themes">
        <div className="flex items-center gap-1.5">
          {themes.map((theme, i) => (
            <button
              key={i}
              className="w-14 h-12 rounded-md border-2 hover:ring-2 hover:ring-[#20B2AA]/50 overflow-hidden"
              style={{ background: theme.bg, borderColor: theme.border }}
              title={theme.name}
            >
              <div className="w-full h-full flex items-end justify-center pb-0.5">
                <div className="w-6 h-0.5 rounded-full bg-white/50" />
              </div>
            </button>
          ))}
        </div>
      </RibbonGroup>
      <RibbonGroup label="Variants">
        <div className="flex items-center gap-1">
          {['#e6f7f6', '#e3f2fd', '#fef9e7', '#fce4ec'].map((color, i) => (
            <button
              key={i}
              className="w-9 h-9 rounded-md border border-[#d0d0d0] hover:ring-2 hover:ring-[#20B2AA]/50"
              style={{ background: color }}
            />
          ))}
        </div>
      </RibbonGroup>
      <RibbonGroup label="Customize">
        <RibbonButton icon={Palette} label="Background" large accent />
      </RibbonGroup>
    </>
  );
}

function TransitionsRibbon() {
  const transitions = [
    { name: 'None', icon: '—' },
    { name: 'Fade', icon: '◐' },
    { name: 'Push', icon: '→' },
    { name: 'Wipe', icon: '▷' },
    { name: 'Split', icon: '⇿' },
    { name: 'Zoom', icon: '⊕' },
  ];
  return (
    <>
      <RibbonGroup label="Transition to This Slide">
        <div className="flex items-center gap-1.5">
          {transitions.map((t, i) => (
            <button
              key={i}
              className={cn(
                "w-14 h-12 rounded-md border flex flex-col items-center justify-center gap-0.5 hover:ring-2 hover:ring-[#20B2AA]/50",
                i === 0 ? "border-[#20B2AA] bg-[#e6f7f6]" : "border-[#d0d0d0] bg-white"
              )}
            >
              <span className="text-base">{t.icon}</span>
              <span className="text-[9px] text-[#666]">{t.name}</span>
            </button>
          ))}
        </div>
      </RibbonGroup>
      <RibbonGroup label="Timing">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1 text-[10px] text-[#555]">
            <Clock className="w-3 h-3" />
            <span>Duration:</span>
            <div className="h-5 px-1.5 border border-[#d0d0d0] rounded text-[10px] flex items-center w-14 bg-white">
              01.00
            </div>
          </div>
          <label className="flex items-center gap-1.5 text-[10px] text-[#555]">
            <input type="checkbox" className="w-3 h-3 accent-[#20B2AA]" />
            Apply to All
          </label>
        </div>
      </RibbonGroup>
    </>
  );
}

function AnimationsRibbon() {
  const anims = [
    { name: 'None', icon: '—' },
    { name: 'Appear', icon: '✦' },
    { name: 'Fade', icon: '◑' },
    { name: 'Fly In', icon: '↗' },
    { name: 'Zoom', icon: '⊕' },
    { name: 'Bounce', icon: '⤿' },
  ];
  return (
    <>
      <RibbonGroup label="Animation">
        <div className="flex items-center gap-1.5">
          {anims.map((a, i) => (
            <button
              key={i}
              className={cn(
                "w-14 h-12 rounded-md border flex flex-col items-center justify-center gap-0.5 hover:ring-2 hover:ring-[#20B2AA]/50",
                i === 0 ? "border-[#20B2AA] bg-[#e6f7f6]" : "border-[#d0d0d0] bg-white"
              )}
            >
              <span className="text-base">{a.icon}</span>
              <span className="text-[9px] text-[#666]">{a.name}</span>
            </button>
          ))}
        </div>
      </RibbonGroup>
      <RibbonGroup label="Advanced">
        <RibbonButton icon={Sparkles} label="Effect Options" large />
        <RibbonButton icon={Zap} label="Animation Pane" large />
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
        <RibbonButton icon={Play} label="From Start" large accent onClick={onStartPresentation} />
        <RibbonButton icon={Play} label="From Current" large onClick={onStartPresentation} />
      </RibbonGroup>
      <RibbonGroup label="Monitors">
        <RibbonButton icon={Monitor} label="Presenter View" large onClick={onStartPresenterView} />
      </RibbonGroup>
      <RibbonGroup label="Set Up">
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-1.5 text-[10px] text-[#555]">
            <input type="checkbox" className="w-3 h-3 accent-[#20B2AA]" />
            Use Timings
          </label>
          <label className="flex items-center gap-1.5 text-[10px] text-[#555]">
            <input type="checkbox" className="w-3 h-3 accent-[#20B2AA]" />
            Show Media Controls
          </label>
        </div>
      </RibbonGroup>
    </>
  );
}

function ReviewRibbon() {
  return (
    <>
      <RibbonGroup label="Proofing">
        <RibbonButton icon={FileText} label="Spelling" large />
      </RibbonGroup>
      <RibbonGroup label="Comments">
        <RibbonButton icon={FileText} label="New Comment" large accent />
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
        <RibbonButton icon={LayoutGrid} label="Normal" large active={!showGrid} accent />
        <RibbonButton icon={Grid3X3} label="Slide Sorter" large onClick={onToggleGrid} active={showGrid} />
        <RibbonButton icon={Eye} label="Reading View" large />
      </RibbonGroup>
      <RibbonGroup label="Show">
        <div className="flex flex-col gap-1.5">
          {onToggleNotes && (
            <label className="flex items-center gap-1.5 text-[10px] text-[#555] cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={showNotes}
                onChange={onToggleNotes}
                className="w-3 h-3 accent-[#20B2AA]"
              />
              Notes
            </label>
          )}
          <label className="flex items-center gap-1.5 text-[10px] text-[#555] cursor-pointer font-medium">
            <input type="checkbox" className="w-3 h-3 accent-[#20B2AA]" />
            Ruler
          </label>
          <label className="flex items-center gap-1.5 text-[10px] text-[#555] cursor-pointer font-medium">
            <input type="checkbox" className="w-3 h-3 accent-[#20B2AA]" />
            Gridlines
          </label>
        </div>
      </RibbonGroup>
      {onToggleDarkMode && (
        <RibbonGroup label="Theme">
          <RibbonButton
            icon={isDarkMode ? Sun : Moon}
            label={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            large
            onClick={onToggleDarkMode}
          />
        </RibbonGroup>
      )}
    </>
  );
}

function FileRibbon() {
  const items = [
    { label: 'New', desc: 'Create a new presentation' },
    { label: 'Open', desc: 'Open a saved presentation' },
    { label: 'Save', desc: 'Save current presentation' },
    { label: 'Export as PDF', desc: 'Download as PDF file' },
    { label: 'Export as PPTX', desc: 'Download as PowerPoint' },
  ];
  return (
    <div className="flex items-center gap-2 px-4">
      {items.map((item) => (
        <button
          key={item.label}
          className="flex flex-col items-start px-4 py-2 rounded-lg hover:bg-[#f0f0f0] min-w-[120px]"
        >
          <span className="text-[12px] font-semibold text-[#333]">{item.label}</span>
          <span className="text-[10px] text-[#888]">{item.desc}</span>
        </button>
      ))}
    </div>
  );
}