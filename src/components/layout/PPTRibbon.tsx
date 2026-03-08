import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { usePresentationStore } from '@/store/presentationStore';
import { createTextObject, createShapeObject, createImageObject } from '@/store/objectFactory';
import type { ShapeProperties } from '@/store/types';
import {
  Clipboard, Scissors, Copy, Brush,
  Type, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Strikethrough,
  Square, Circle, Triangle, Image, Table,
  Minus, ChevronDown,
  Palette, LayoutGrid, Play, Monitor,
  FileText, Grid3X3, Moon, Sun,
  PenTool, ArrowRight, Star, Hexagon,
  Upload, Film, BarChart3, PieChart,
  Sparkles, Zap, Clock, Eye,
  Columns, SplitSquareHorizontal,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PPTRibbonProps {
  showGrid: boolean;
  onToggleGrid: () => void;
  showNotes?: boolean;
  onToggleNotes?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onStartPresentation?: () => void;
  onStartPresenterView?: () => void;
  onAddSlide?: () => void;
  isEditable?: boolean;
}

const LADE_TEAL = 'hsl(174, 80%, 41%)';

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
  onAddSlide,
  isEditable = false,
}: PPTRibbonProps) {
  const [activeTab, setActiveTab] = useState('Home');

  return (
    <div className="bg-[#f8f9fa] border-b border-[#e0e0e0] select-none">
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

      <div className="bg-white border-t border-[#e0e0e0] h-[100px] flex items-stretch px-1 overflow-hidden">
        {activeTab === 'Home' && <HomeRibbon onAddSlide={onAddSlide} isEditable={isEditable} />}
        {activeTab === 'Insert' && <InsertRibbon onAddSlide={onAddSlide} isEditable={isEditable} />}
        {activeTab === 'Design' && <DesignRibbon isEditable={isEditable} />}
        {activeTab === 'Transitions' && <TransitionsRibbon />}
        {activeTab === 'Animations' && <AnimationsRibbon />}
        {activeTab === 'Slide Show' && (
          <SlideShowRibbon onStartPresentation={onStartPresentation} onStartPresenterView={onStartPresenterView} />
        )}
        {activeTab === 'Review' && <ReviewRibbon />}
        {activeTab === 'View' && (
          <ViewRibbon showGrid={showGrid} onToggleGrid={onToggleGrid} showNotes={showNotes} onToggleNotes={onToggleNotes} isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} />
        )}
        {activeTab === 'File' && <FileRibbon />}
      </div>
    </div>
  );
}

function RibbonGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full border-r border-[#e8e8e8] last:border-r-0">
      <div className="flex-1 flex items-center gap-0.5 px-3 pt-1.5">{children}</div>
      <div className="text-[10px] text-[#888] text-center pb-1.5 px-1 font-medium">{label}</div>
    </div>
  );
}

function RibbonButton({ icon: Icon, label, large, onClick, active, accent }: {
  icon: React.ElementType; label: string; large?: boolean; onClick?: () => void; active?: boolean; accent?: boolean;
}) {
  if (large) {
    return (
      <button onClick={onClick} className={cn(
        "flex flex-col items-center gap-1 px-3 py-1.5 rounded-md min-w-[56px]",
        accent ? "hover:bg-[#e6f7f6]" : "hover:bg-[#f0f0f0]",
        active && "bg-[#e6f7f6] ring-1 ring-[#20B2AA]/30"
      )}>
        <Icon className={cn("w-7 h-7", accent ? "text-[#20B2AA]" : "text-[#444]")} strokeWidth={1.5} />
        <span className="text-[10px] text-[#555] leading-tight font-medium">{label}</span>
      </button>
    );
  }
  return (
    <button onClick={onClick} className={cn(
      "w-7 h-7 flex items-center justify-center rounded hover:bg-[#f0f0f0]",
      active && "bg-[#e6f7f6]"
    )} title={label}>
      <Icon className="w-3.5 h-3.5 text-[#555]" strokeWidth={1.5} />
    </button>
  );
}

// Helper to insert objects into the current slide
function useInsertObject() {
  const { presentation, currentSlideIndex, addObject } = usePresentationStore();
  const currentSlide = presentation.slides[currentSlideIndex];

  const insertText = useCallback(() => {
    if (!currentSlide) return;
    const obj = createTextObject({
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
    });
    addObject(currentSlide.id, obj);
    toast({ title: 'Text box added' });
  }, [currentSlide, addObject]);

  const insertShape = useCallback((shape: ShapeProperties['shape']) => {
    if (!currentSlide) return;
    const colors: Record<string, string> = {
      rectangle: '#20B2AA', circle: '#3B82F6', triangle: '#F59E0B',
      arrow: '#EF4444', star: '#FFD700', hexagon: '#8B5CF6', line: '#1F2937',
    };
    const obj = createShapeObject(shape, {
      x: 200 + Math.random() * 200,
      y: 150 + Math.random() * 200,
      fillColor: colors[shape] || '#20B2AA',
      width: shape === 'line' ? 400 : 250,
      height: shape === 'line' ? 10 : 200,
    });
    addObject(currentSlide.id, obj);
    toast({ title: `${shape} added` });
  }, [currentSlide, addObject]);

  const insertImage = useCallback((file: File) => {
    if (!currentSlide) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 5MB per image.', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        const maxW = 800;
        const ratio = img.width / img.height;
        const w = Math.min(img.width, maxW);
        const h = w / ratio;
        const obj = createImageObject(src, { width: Math.round(w), height: Math.round(h) });
        addObject(currentSlide.id, obj);
        toast({ title: 'Image added' });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, [currentSlide, addObject]);

  return { insertText, insertShape, insertImage, currentSlide };
}

function HomeRibbon({ onAddSlide, isEditable }: { onAddSlide?: () => void; isEditable?: boolean }) {
  const store = usePresentationStore();
  const { insertText, insertShape } = useInsertObject();

  return (
    <>
      <RibbonGroup label="Clipboard">
        <RibbonButton icon={Clipboard} label="Paste" large accent onClick={() => store.pasteObjects()} />
        <div className="flex flex-col gap-0.5">
          <RibbonButton icon={Scissors} label="Cut" onClick={() => store.cutObjects()} />
          <RibbonButton icon={Copy} label="Copy" onClick={() => store.copyObjects()} />
          <RibbonButton icon={Brush} label="Format Painter" />
        </div>
      </RibbonGroup>

      <RibbonGroup label="Slides">
        <div className="flex flex-col gap-1">
          <button onClick={onAddSlide} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-[#f0f0f0] text-[11px] text-[#444] font-medium">
            <LayoutGrid className="w-4 h-4 text-[#20B2AA]" strokeWidth={1.5} />
            New Slide
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-[#f0f0f0] text-[11px] text-[#444] font-medium">
            <SplitSquareHorizontal className="w-4 h-4" strokeWidth={1.5} />
            Layout
            <ChevronDown className="w-3 h-3 text-[#999]" />
          </button>
        </div>
      </RibbonGroup>

      <RibbonGroup label="Insert">
        <div className="flex items-center gap-1">
          <RibbonButton icon={Type} label="Text Box" onClick={isEditable ? insertText : undefined} />
          <RibbonButton icon={Square} label="Rectangle" onClick={isEditable ? () => insertShape('rectangle') : undefined} />
          <RibbonButton icon={Circle} label="Circle" onClick={isEditable ? () => insertShape('circle') : undefined} />
          <RibbonButton icon={Triangle} label="Triangle" onClick={isEditable ? () => insertShape('triangle') : undefined} />
        </div>
      </RibbonGroup>

      <RibbonGroup label="Font">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1">
            <div className="h-6 px-2 border border-[#d0d0d0] rounded text-[11px] flex items-center min-w-[110px] bg-white text-[#333] cursor-pointer hover:border-[#20B2AA]">
              Inter
              <ChevronDown className="w-3 h-3 ml-auto text-[#999]" />
            </div>
            <div className="h-6 px-2 border border-[#d0d0d0] rounded text-[11px] flex items-center w-12 bg-white text-[#333] justify-center cursor-pointer hover:border-[#20B2AA]">
              32
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
              <Columns className="w-3 h-3" /> Spacing <ChevronDown className="w-2.5 h-2.5 text-[#999]" />
            </button>
          </div>
        </div>
      </RibbonGroup>

      <RibbonGroup label="Drawing">
        <div className="flex items-center gap-1">
          <RibbonButton icon={Square} label="Rectangle" onClick={isEditable ? () => insertShape('rectangle') : undefined} />
          <RibbonButton icon={Circle} label="Oval" onClick={isEditable ? () => insertShape('circle') : undefined} />
          <RibbonButton icon={Triangle} label="Triangle" onClick={isEditable ? () => insertShape('triangle') : undefined} />
          <RibbonButton icon={ArrowRight} label="Arrow" onClick={isEditable ? () => insertShape('arrow') : undefined} />
          <RibbonButton icon={Star} label="Star" onClick={isEditable ? () => insertShape('star') : undefined} />
          <RibbonButton icon={Minus} label="Line" onClick={isEditable ? () => insertShape('line') : undefined} />
        </div>
      </RibbonGroup>
    </>
  );
}

function InsertRibbon({ onAddSlide, isEditable }: { onAddSlide?: () => void; isEditable?: boolean }) {
  const { insertText, insertShape, insertImage } = useInsertObject();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) insertImage(file);
    e.target.value = '';
  };

  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <RibbonGroup label="Slides">
        <RibbonButton icon={LayoutGrid} label="New Slide" large accent onClick={onAddSlide} />
      </RibbonGroup>
      <RibbonGroup label="Text">
        <RibbonButton icon={Type} label="Text Box" large accent onClick={isEditable ? insertText : undefined} />
      </RibbonGroup>
      <RibbonGroup label="Images">
        <RibbonButton icon={Image} label="Pictures" large onClick={isEditable ? handleImageUpload : undefined} />
        <RibbonButton icon={Upload} label="Upload" large onClick={isEditable ? handleImageUpload : undefined} />
      </RibbonGroup>
      <RibbonGroup label="Shapes">
        <div className="flex items-center gap-1">
          <RibbonButton icon={Square} label="Rectangle" onClick={isEditable ? () => insertShape('rectangle') : undefined} />
          <RibbonButton icon={Circle} label="Circle" onClick={isEditable ? () => insertShape('circle') : undefined} />
          <RibbonButton icon={Triangle} label="Triangle" onClick={isEditable ? () => insertShape('triangle') : undefined} />
          <RibbonButton icon={ArrowRight} label="Arrow" onClick={isEditable ? () => insertShape('arrow') : undefined} />
          <RibbonButton icon={Star} label="Star" onClick={isEditable ? () => insertShape('star') : undefined} />
          <RibbonButton icon={Hexagon} label="Hexagon" onClick={isEditable ? () => insertShape('hexagon') : undefined} />
          <RibbonButton icon={Minus} label="Line" onClick={isEditable ? () => insertShape('line') : undefined} />
        </div>
      </RibbonGroup>
      <RibbonGroup label="Charts">
        <div className="flex items-center gap-1">
          <RibbonButton icon={BarChart3} label="Bar Chart" />
          <RibbonButton icon={PieChart} label="Pie Chart" />
        </div>
      </RibbonGroup>
      <RibbonGroup label="Media">
        <RibbonButton icon={Film} label="Video" large />
      </RibbonGroup>
    </>
  );
}

function DesignRibbon({ isEditable }: { isEditable?: boolean }) {
  const store = usePresentationStore();
  const currentSlide = store.presentation.slides[store.currentSlideIndex];

  const handleBgColor = (color: string) => {
    if (!isEditable || !currentSlide) return;
    store.updateSlide(currentSlide.id, {
      background: { type: 'color', value: color },
    });
  };

  const themes = [
    { name: 'Light', bg: '#ffffff' },
    { name: 'Dark', bg: '#1a2332' },
    { name: 'Teal', bg: '#20B2AA' },
    { name: 'Nature', bg: '#2d5a27' },
    { name: 'Royal', bg: '#5b2c6f' },
    { name: 'Ocean', bg: '#1e3a5f' },
    { name: 'Sunset', bg: '#e65100' },
  ];

  return (
    <>
      <RibbonGroup label="Themes">
        <div className="flex items-center gap-1.5">
          {themes.map((theme) => (
            <button
              key={theme.name}
              className="w-14 h-12 rounded-md border-2 hover:ring-2 hover:ring-[#20B2AA]/50 overflow-hidden"
              style={{ background: theme.bg, borderColor: theme.bg === '#ffffff' ? '#e0e0e0' : theme.bg }}
              title={theme.name}
              onClick={() => handleBgColor(theme.bg)}
            />
          ))}
        </div>
      </RibbonGroup>
      <RibbonGroup label="Background">
        <div className="grid grid-cols-4 gap-1">
          {['#ffffff', '#f8f9fa', '#1F2937', '#20B2AA', '#FFD700', '#3B82F6', '#EF4444', '#10B981'].map((c) => (
            <button
              key={c}
              className="w-8 h-8 rounded border border-[#d0d0d0] hover:ring-2 hover:ring-[#20B2AA]/50"
              style={{ background: c }}
              onClick={() => handleBgColor(c)}
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
    { name: 'None', icon: '—' }, { name: 'Fade', icon: '◐' }, { name: 'Push', icon: '→' },
    { name: 'Wipe', icon: '▷' }, { name: 'Split', icon: '⇿' }, { name: 'Zoom', icon: '⊕' },
  ];
  return (
    <>
      <RibbonGroup label="Transition to This Slide">
        <div className="flex items-center gap-1.5">
          {transitions.map((t, i) => (
            <button key={i} className={cn(
              "w-14 h-12 rounded-md border flex flex-col items-center justify-center gap-0.5 hover:ring-2 hover:ring-[#20B2AA]/50",
              i === 0 ? "border-[#20B2AA] bg-[#e6f7f6]" : "border-[#d0d0d0] bg-white"
            )}>
              <span className="text-base">{t.icon}</span>
              <span className="text-[9px] text-[#666]">{t.name}</span>
            </button>
          ))}
        </div>
      </RibbonGroup>
      <RibbonGroup label="Timing">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1 text-[10px] text-[#555]">
            <Clock className="w-3 h-3" /><span>Duration:</span>
            <div className="h-5 px-1.5 border border-[#d0d0d0] rounded text-[10px] flex items-center w-14 bg-white">01.00</div>
          </div>
          <label className="flex items-center gap-1.5 text-[10px] text-[#555]">
            <input type="checkbox" className="w-3 h-3 accent-[#20B2AA]" /> Apply to All
          </label>
        </div>
      </RibbonGroup>
    </>
  );
}

function AnimationsRibbon() {
  const anims = [
    { name: 'None', icon: '—' }, { name: 'Appear', icon: '✦' }, { name: 'Fade', icon: '◑' },
    { name: 'Fly In', icon: '↗' }, { name: 'Zoom', icon: '⊕' }, { name: 'Bounce', icon: '⤿' },
  ];
  return (
    <>
      <RibbonGroup label="Animation">
        <div className="flex items-center gap-1.5">
          {anims.map((a, i) => (
            <button key={i} className={cn(
              "w-14 h-12 rounded-md border flex flex-col items-center justify-center gap-0.5 hover:ring-2 hover:ring-[#20B2AA]/50",
              i === 0 ? "border-[#20B2AA] bg-[#e6f7f6]" : "border-[#d0d0d0] bg-white"
            )}>
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
  onStartPresentation?: () => void; onStartPresenterView?: () => void;
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
    </>
  );
}

function ReviewRibbon() {
  return (
    <>
      <RibbonGroup label="Proofing"><RibbonButton icon={FileText} label="Spelling" large /></RibbonGroup>
      <RibbonGroup label="Comments"><RibbonButton icon={FileText} label="New Comment" large accent /></RibbonGroup>
    </>
  );
}

function ViewRibbon({ showGrid, onToggleGrid, showNotes, onToggleNotes, isDarkMode, onToggleDarkMode }: {
  showGrid: boolean; onToggleGrid: () => void; showNotes?: boolean; onToggleNotes?: () => void; isDarkMode?: boolean; onToggleDarkMode?: () => void;
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
              <input type="checkbox" checked={showNotes} onChange={onToggleNotes} className="w-3 h-3 accent-[#20B2AA]" /> Notes
            </label>
          )}
          <label className="flex items-center gap-1.5 text-[10px] text-[#555] cursor-pointer font-medium">
            <input type="checkbox" className="w-3 h-3 accent-[#20B2AA]" /> Ruler
          </label>
          <label className="flex items-center gap-1.5 text-[10px] text-[#555] cursor-pointer font-medium">
            <input type="checkbox" className="w-3 h-3 accent-[#20B2AA]" /> Gridlines
          </label>
        </div>
      </RibbonGroup>
      {onToggleDarkMode && (
        <RibbonGroup label="Theme">
          <RibbonButton icon={isDarkMode ? Sun : Moon} label={isDarkMode ? 'Light Mode' : 'Dark Mode'} large onClick={onToggleDarkMode} />
        </RibbonGroup>
      )}
    </>
  );
}

function FileRibbon() {
  const store = usePresentationStore();
  const items = [
    { label: 'New', desc: 'Create a new presentation', action: () => { store.newPresentation(); toast({ title: 'New presentation created' }); } },
    { label: 'Save', desc: 'Save current presentation', action: () => { store.saveToLocalStorage(); toast({ title: 'Saved' }); } },
    { label: 'Export as PDF', desc: 'Download as PDF file', action: () => toast({ title: 'Coming soon', description: 'PDF export is in development.' }) },
    { label: 'Export as PPTX', desc: 'Download as PowerPoint', action: () => toast({ title: 'Coming soon', description: 'PPTX export is in development.' }) },
  ];
  return (
    <div className="flex items-center gap-2 px-4">
      {items.map((item) => (
        <button key={item.label} onClick={item.action} className="flex flex-col items-start px-4 py-2 rounded-lg hover:bg-[#f0f0f0] min-w-[120px]">
          <span className="text-[12px] font-semibold text-[#333]">{item.label}</span>
          <span className="text-[10px] text-[#888]">{item.desc}</span>
        </button>
      ))}
    </div>
  );
}