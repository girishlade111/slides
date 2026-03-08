import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  X, ChevronDown, Bold, Italic, Underline, 
  AlignLeft, AlignCenter, AlignRight,
  Palette, Type, Square, Image, Layers,
  RotateCw, Lock, Unlock
} from 'lucide-react';

interface PropertiesPanelProps {
  onClose: () => void;
}

export function PropertiesPanel({ onClose }: PropertiesPanelProps) {
  const [activeSection, setActiveSection] = useState<string>('format');

  const tabs = [
    { id: 'format', label: 'Format', icon: Type },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'animate', label: 'Animate', icon: Layers },
  ];

  return (
    <div className="w-[260px] bg-[#f8f9fa] border-l border-[#e0e0e0] flex flex-col h-full overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#e0e0e0] bg-white">
        <span className="text-[12px] font-semibold text-[#333]">Properties</span>
        <button onClick={onClose} className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#e8e8e8]">
          <X className="w-3 h-3 text-[#999]" />
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-[#e0e0e0] bg-white">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={cn(
              "flex-1 py-2 text-[10px] font-medium flex flex-col items-center gap-0.5",
              activeSection === tab.id
                ? "text-[#20B2AA] border-b-2 border-[#20B2AA]"
                : "text-[#888] hover:text-[#555]"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {activeSection === 'format' && <FormatSection />}
        {activeSection === 'design' && <DesignSection />}
        {activeSection === 'animate' && <AnimateSection />}
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="text-[10px] font-semibold text-[#999] uppercase tracking-wider mb-1.5">
      {title}
    </div>
  );
}

function FormatSection() {
  return (
    <>
      {/* Text formatting */}
      <div>
        <SectionHeader title="Text" />
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <div className="flex-1 h-7 px-2 border border-[#d0d0d0] rounded text-[11px] flex items-center bg-white cursor-pointer hover:border-[#20B2AA]">
              Calibri
              <ChevronDown className="w-3 h-3 ml-auto text-[#999]" />
            </div>
            <div className="w-12 h-7 px-1 border border-[#d0d0d0] rounded text-[11px] flex items-center justify-center bg-white cursor-pointer hover:border-[#20B2AA]">
              18
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#e8e8e8]"><Bold className="w-3.5 h-3.5 text-[#555]" /></button>
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#e8e8e8]"><Italic className="w-3.5 h-3.5 text-[#555]" /></button>
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#e8e8e8]"><Underline className="w-3.5 h-3.5 text-[#555]" /></button>
            <div className="w-px h-4 bg-[#e0e0e0] mx-0.5" />
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#e8e8e8]"><AlignLeft className="w-3.5 h-3.5 text-[#555]" /></button>
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#e8e8e8]"><AlignCenter className="w-3.5 h-3.5 text-[#555]" /></button>
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#e8e8e8]"><AlignRight className="w-3.5 h-3.5 text-[#555]" /></button>
          </div>
        </div>
      </div>

      {/* Colors */}
      <div>
        <SectionHeader title="Fill Color" />
        <div className="grid grid-cols-8 gap-1">
          {[
            '#20B2AA', '#FFD700', '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
            '#8B5CF6', '#EC4899', '#ffffff', '#f3f4f6', '#d1d5db', '#9ca3af',
            '#6b7280', '#4b5563', '#374151', '#111827',
          ].map((color) => (
            <button
              key={color}
              className="w-6 h-6 rounded border border-[#d0d0d0] hover:ring-2 hover:ring-[#20B2AA]/50"
              style={{ background: color }}
            />
          ))}
        </div>
      </div>

      {/* Border */}
      <div>
        <SectionHeader title="Border" />
        <div className="flex items-center gap-2">
          <div className="flex-1 h-7 px-2 border border-[#d0d0d0] rounded text-[11px] flex items-center bg-white">
            <div className="w-3 h-3 rounded-sm border border-[#333] mr-1.5" />
            No border
            <ChevronDown className="w-3 h-3 ml-auto text-[#999]" />
          </div>
        </div>
      </div>

      {/* Size & Position */}
      <div>
        <SectionHeader title="Size & Position" />
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: 'X', value: '120' },
            { label: 'Y', value: '80' },
            { label: 'W', value: '400' },
            { label: 'H', value: '300' },
          ].map((field) => (
            <div key={field.label} className="flex items-center gap-1">
              <span className="text-[10px] text-[#999] font-medium w-3">{field.label}</span>
              <div className="flex-1 h-6 px-1.5 border border-[#d0d0d0] rounded text-[10px] flex items-center bg-white text-[#555]">
                {field.value}px
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1">
            <RotateCw className="w-3 h-3 text-[#999]" />
            <div className="w-14 h-6 px-1.5 border border-[#d0d0d0] rounded text-[10px] flex items-center bg-white text-[#555]">
              0°
            </div>
          </div>
          <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#e8e8e8]" title="Lock aspect ratio">
            <Lock className="w-3 h-3 text-[#999]" />
          </button>
        </div>
      </div>

      {/* Opacity */}
      <div>
        <SectionHeader title="Opacity" />
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={100}
            defaultValue={100}
            className="flex-1 h-1 appearance-none bg-[#d0d0d0] rounded-full cursor-pointer"
            style={{ accentColor: 'hsl(174, 80%, 41%)' }}
          />
          <span className="text-[10px] text-[#666] min-w-[28px] text-right">100%</span>
        </div>
      </div>
    </>
  );
}

function DesignSection() {
  const colorSchemes = [
    { name: 'Lade Teal', colors: ['#20B2AA', '#FFD700', '#ffffff', '#1F2937'] },
    { name: 'Corporate', colors: ['#1a3a5c', '#3B82F6', '#ffffff', '#374151'] },
    { name: 'Nature', colors: ['#10B981', '#059669', '#d1fae5', '#064e3b'] },
    { name: 'Warm', colors: ['#F59E0B', '#EF4444', '#fef3c7', '#78350f'] },
    { name: 'Purple', colors: ['#8B5CF6', '#EC4899', '#f5f3ff', '#4c1d95'] },
  ];

  return (
    <>
      <div>
        <SectionHeader title="Color Scheme" />
        <div className="space-y-1.5">
          {colorSchemes.map((scheme) => (
            <button
              key={scheme.name}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#e8e8e8] border border-transparent hover:border-[#20B2AA]/30"
            >
              <div className="flex gap-0.5">
                {scheme.colors.map((c, i) => (
                  <div key={i} className="w-4 h-4 rounded-sm border border-[#e0e0e0]" style={{ background: c }} />
                ))}
              </div>
              <span className="text-[10px] text-[#555] font-medium">{scheme.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionHeader title="Background" />
        <div className="grid grid-cols-4 gap-1.5">
          {['#ffffff', '#f8f9fa', '#1F2937', '#20B2AA', '#1a3a5c', '#FFD700', '#f3e8ff', '#ecfdf5'].map((c) => (
            <button
              key={c}
              className="aspect-video rounded border border-[#d0d0d0] hover:ring-2 hover:ring-[#20B2AA]/50"
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function AnimateSection() {
  const animations = [
    { name: 'None', active: true },
    { name: 'Fade In' },
    { name: 'Slide Up' },
    { name: 'Zoom In' },
    { name: 'Bounce' },
    { name: 'Fly In' },
  ];

  return (
    <>
      <div>
        <SectionHeader title="Entrance Animation" />
        <div className="space-y-1">
          {animations.map((anim) => (
            <button
              key={anim.name}
              className={cn(
                "w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium",
                anim.active
                  ? "bg-[#e6f7f6] text-[#20B2AA] border border-[#20B2AA]/30"
                  : "text-[#555] hover:bg-[#e8e8e8]"
              )}
            >
              {anim.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionHeader title="Duration" />
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={100}
            max={3000}
            defaultValue={500}
            className="flex-1 h-1 appearance-none bg-[#d0d0d0] rounded-full cursor-pointer"
            style={{ accentColor: 'hsl(174, 80%, 41%)' }}
          />
          <span className="text-[10px] text-[#666] min-w-[32px] text-right">0.5s</span>
        </div>
      </div>

      <div>
        <SectionHeader title="Delay" />
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={5000}
            defaultValue={0}
            className="flex-1 h-1 appearance-none bg-[#d0d0d0] rounded-full cursor-pointer"
            style={{ accentColor: 'hsl(174, 80%, 41%)' }}
          />
          <span className="text-[10px] text-[#666] min-w-[32px] text-right">0s</span>
        </div>
      </div>
    </>
  );
}