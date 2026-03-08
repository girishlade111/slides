import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { usePresentationStore } from '@/store/presentationStore';
import type { SlideObject, TextProperties, ShapeProperties, ImageProperties } from '@/store/types';
import {
  X, ChevronDown, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight,
  Palette, Type, Layers,
  RotateCw, Lock, Trash2, Copy,
  MoveUp, MoveDown, ArrowUpToLine, ArrowDownToLine,
} from 'lucide-react';

interface PropertiesPanelProps {
  onClose: () => void;
}

export function PropertiesPanel({ onClose }: PropertiesPanelProps) {
  const { selectedObjectIds, presentation, currentSlideIndex, updateObject, deleteObject, duplicateSlide, copyObjects } = usePresentationStore();
  const [activeSection, setActiveSection] = useState<string>('format');

  const currentSlide = presentation.slides[currentSlideIndex];
  const selectedObject = currentSlide?.objects.find((o) => selectedObjectIds.includes(o.id));

  const tabs = [
    { id: 'format', label: 'Format', icon: Type },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'animate', label: 'Animate', icon: Layers },
  ];

  return (
    <div className="w-[260px] bg-[#f8f9fa] border-l border-[#e0e0e0] flex flex-col h-full overflow-hidden select-none">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#e0e0e0] bg-white">
        <span className="text-[12px] font-semibold text-[#333]">
          {selectedObject ? `${selectedObject.type.charAt(0).toUpperCase() + selectedObject.type.slice(1)} Properties` : 'Properties'}
        </span>
        <button onClick={onClose} className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#e8e8e8]">
          <X className="w-3 h-3 text-[#999]" />
        </button>
      </div>

      <div className="flex border-b border-[#e0e0e0] bg-white">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={cn(
              "flex-1 py-2 text-[10px] font-medium flex flex-col items-center gap-0.5",
              activeSection === tab.id ? "text-[#20B2AA] border-b-2 border-[#20B2AA]" : "text-[#888] hover:text-[#555]"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {activeSection === 'format' && (
          selectedObject
            ? <SelectedObjectFormat obj={selectedObject} slideId={currentSlide.id} />
            : <NoSelectionFormat />
        )}
        {activeSection === 'design' && <DesignSection />}
        {activeSection === 'animate' && <AnimateSection />}
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <div className="text-[10px] font-semibold text-[#999] uppercase tracking-wider mb-1.5">{title}</div>;
}

function SelectedObjectFormat({ obj, slideId }: { obj: SlideObject; slideId: string }) {
  const { updateObject, deleteObject } = usePresentationStore();

  const update = (updates: Partial<SlideObject>) => updateObject(slideId, obj.id, updates);
  const updateProps = (propUpdates: Record<string, any>) => {
    update({ properties: { ...obj.properties, ...propUpdates } });
  };

  return (
    <>
      {/* Actions */}
      <div>
        <SectionHeader title="Actions" />
        <div className="flex items-center gap-1">
          <button onClick={() => deleteObject(slideId, obj.id)} className="flex-1 h-7 flex items-center justify-center gap-1 rounded text-[10px] font-medium text-red-600 hover:bg-red-50 border border-red-200">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
          <button className="flex-1 h-7 flex items-center justify-center gap-1 rounded text-[10px] font-medium text-[#555] hover:bg-[#e8e8e8] border border-[#d0d0d0]">
            <Copy className="w-3 h-3" /> Duplicate
          </button>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <button title="Bring to front" className="flex-1 h-6 flex items-center justify-center rounded text-[10px] hover:bg-[#e8e8e8]">
            <ArrowUpToLine className="w-3 h-3 text-[#666]" />
          </button>
          <button title="Bring forward" className="flex-1 h-6 flex items-center justify-center rounded text-[10px] hover:bg-[#e8e8e8]">
            <MoveUp className="w-3 h-3 text-[#666]" />
          </button>
          <button title="Send backward" className="flex-1 h-6 flex items-center justify-center rounded text-[10px] hover:bg-[#e8e8e8]">
            <MoveDown className="w-3 h-3 text-[#666]" />
          </button>
          <button title="Send to back" className="flex-1 h-6 flex items-center justify-center rounded text-[10px] hover:bg-[#e8e8e8]">
            <ArrowDownToLine className="w-3 h-3 text-[#666]" />
          </button>
        </div>
      </div>

      {/* Text-specific */}
      {obj.properties.type === 'text' && <TextFormatControls obj={obj} slideId={slideId} />}

      {/* Shape-specific */}
      {obj.properties.type === 'shape' && <ShapeFormatControls obj={obj} slideId={slideId} />}

      {/* Image-specific */}
      {obj.properties.type === 'image' && <ImageFormatControls obj={obj} slideId={slideId} />}

      {/* Common: Size & Position */}
      <div>
        <SectionHeader title="Size & Position" />
        <div className="grid grid-cols-2 gap-1.5">
          <FieldInput label="X" value={obj.position.x} onChange={(v) => update({ position: { ...obj.position, x: v } })} />
          <FieldInput label="Y" value={obj.position.y} onChange={(v) => update({ position: { ...obj.position, y: v } })} />
          <FieldInput label="W" value={obj.size.width} onChange={(v) => update({ size: { ...obj.size, width: v } })} />
          <FieldInput label="H" value={obj.size.height} onChange={(v) => update({ size: { ...obj.size, height: v } })} />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <RotateCw className="w-3 h-3 text-[#999]" />
          <FieldInput label="" value={obj.rotation} onChange={(v) => update({ rotation: v })} suffix="°" />
        </div>
      </div>

      {/* Opacity */}
      <div>
        <SectionHeader title="Opacity" />
        <div className="flex items-center gap-2">
          <input type="range" min={0} max={1} step={0.05} value={obj.opacity}
            onChange={(e) => update({ opacity: parseFloat(e.target.value) })}
            className="flex-1 h-1 appearance-none bg-[#d0d0d0] rounded-full cursor-pointer"
            style={{ accentColor: 'hsl(174, 80%, 41%)' }}
          />
          <span className="text-[10px] text-[#666] min-w-[28px] text-right">{Math.round(obj.opacity * 100)}%</span>
        </div>
      </div>
    </>
  );
}

function TextFormatControls({ obj, slideId }: { obj: SlideObject; slideId: string }) {
  const { updateObject } = usePresentationStore();
  const props = obj.properties as TextProperties;
  const updateProps = (updates: Partial<TextProperties>) => {
    updateObject(slideId, obj.id, { properties: { ...props, ...updates } });
  };

  return (
    <div>
      <SectionHeader title="Text" />
      <div className="space-y-2">
        <select
          value={props.fontFamily}
          onChange={(e) => updateProps({ fontFamily: e.target.value })}
          className="w-full h-7 px-2 border border-[#d0d0d0] rounded text-[11px] bg-white cursor-pointer hover:border-[#20B2AA]"
        >
          {['Inter, sans-serif', 'Arial, sans-serif', 'Times New Roman, serif', 'Georgia, serif', 'Verdana, sans-serif',
            'Courier New, monospace', 'Trebuchet MS, sans-serif', 'Impact, sans-serif', 'Comic Sans MS, sans-serif',
            'Palatino, serif', 'Garamond, serif', 'Bookman, serif', 'Tahoma, sans-serif',
          ].map((f) => (
            <option key={f} value={f}>{f.split(',')[0]}</option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <input type="number" value={props.fontSize} min={8} max={200}
            onChange={(e) => updateProps({ fontSize: parseInt(e.target.value) || 16 })}
            className="w-14 h-7 px-2 border border-[#d0d0d0] rounded text-[11px] bg-white text-center"
          />
          <input type="color" value={props.color}
            onChange={(e) => updateProps({ color: e.target.value })}
            className="w-7 h-7 border border-[#d0d0d0] rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-0.5">
          <button onClick={() => updateProps({ fontWeight: props.fontWeight === 700 ? 400 : 700 })}
            className={cn("w-7 h-7 flex items-center justify-center rounded", props.fontWeight === 700 ? "bg-[#e6f7f6]" : "hover:bg-[#e8e8e8]")}>
            <Bold className="w-3.5 h-3.5 text-[#555]" />
          </button>
          <button onClick={() => updateProps({ fontStyle: props.fontStyle === 'italic' ? 'normal' : 'italic' })}
            className={cn("w-7 h-7 flex items-center justify-center rounded", props.fontStyle === 'italic' ? "bg-[#e6f7f6]" : "hover:bg-[#e8e8e8]")}>
            <Italic className="w-3.5 h-3.5 text-[#555]" />
          </button>
          <button onClick={() => updateProps({ textDecoration: props.textDecoration === 'underline' ? 'none' : 'underline' })}
            className={cn("w-7 h-7 flex items-center justify-center rounded", props.textDecoration === 'underline' ? "bg-[#e6f7f6]" : "hover:bg-[#e8e8e8]")}>
            <Underline className="w-3.5 h-3.5 text-[#555]" />
          </button>
          <div className="w-px h-4 bg-[#e0e0e0] mx-0.5" />
          <button onClick={() => updateProps({ textAlign: 'left' })}
            className={cn("w-7 h-7 flex items-center justify-center rounded", props.textAlign === 'left' ? "bg-[#e6f7f6]" : "hover:bg-[#e8e8e8]")}>
            <AlignLeft className="w-3.5 h-3.5 text-[#555]" />
          </button>
          <button onClick={() => updateProps({ textAlign: 'center' })}
            className={cn("w-7 h-7 flex items-center justify-center rounded", props.textAlign === 'center' ? "bg-[#e6f7f6]" : "hover:bg-[#e8e8e8]")}>
            <AlignCenter className="w-3.5 h-3.5 text-[#555]" />
          </button>
          <button onClick={() => updateProps({ textAlign: 'right' })}
            className={cn("w-7 h-7 flex items-center justify-center rounded", props.textAlign === 'right' ? "bg-[#e6f7f6]" : "hover:bg-[#e8e8e8]")}>
            <AlignRight className="w-3.5 h-3.5 text-[#555]" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ShapeFormatControls({ obj, slideId }: { obj: SlideObject; slideId: string }) {
  const { updateObject } = usePresentationStore();
  const props = obj.properties as ShapeProperties;
  const updateProps = (updates: Partial<ShapeProperties>) => {
    updateObject(slideId, obj.id, { properties: { ...props, ...updates } });
  };

  return (
    <>
      <div>
        <SectionHeader title="Fill" />
        <div className="flex items-center gap-2">
          <input type="color" value={props.fillColor} onChange={(e) => updateProps({ fillColor: e.target.value })}
            className="w-8 h-8 border border-[#d0d0d0] rounded cursor-pointer" />
          <div className="flex-1">
            <div className="text-[10px] text-[#888] mb-0.5">Opacity</div>
            <input type="range" min={0} max={100} value={props.fillOpacity}
              onChange={(e) => updateProps({ fillOpacity: parseInt(e.target.value) })}
              className="w-full h-1 appearance-none bg-[#d0d0d0] rounded-full cursor-pointer"
              style={{ accentColor: 'hsl(174, 80%, 41%)' }} />
          </div>
        </div>
      </div>
      <div>
        <SectionHeader title="Border" />
        <div className="flex items-center gap-2">
          <input type="color" value={props.borderColor} onChange={(e) => updateProps({ borderColor: e.target.value })}
            className="w-7 h-7 border border-[#d0d0d0] rounded cursor-pointer" />
          <FieldInput label="Width" value={props.borderWidth} onChange={(v) => updateProps({ borderWidth: v })} suffix="px" />
        </div>
      </div>
    </>
  );
}

function ImageFormatControls({ obj, slideId }: { obj: SlideObject; slideId: string }) {
  const { updateObject } = usePresentationStore();
  const props = obj.properties as ImageProperties;
  const updateFilter = (key: string, value: number) => {
    updateObject(slideId, obj.id, {
      properties: { ...props, filters: { ...props.filters, [key]: value } },
    });
  };

  return (
    <div>
      <SectionHeader title="Image Filters" />
      <div className="space-y-2">
        {[
          { key: 'brightness', label: 'Brightness', min: 0, max: 200 },
          { key: 'contrast', label: 'Contrast', min: 0, max: 200 },
          { key: 'grayscale', label: 'Grayscale', min: 0, max: 100 },
          { key: 'blur', label: 'Blur', min: 0, max: 20 },
          { key: 'sepia', label: 'Sepia', min: 0, max: 100 },
        ].map((f) => (
          <div key={f.key} className="flex items-center gap-2">
            <span className="text-[10px] text-[#888] min-w-[52px]">{f.label}</span>
            <input type="range" min={f.min} max={f.max}
              value={(props.filters as any)[f.key]}
              onChange={(e) => updateFilter(f.key, parseInt(e.target.value))}
              className="flex-1 h-1 appearance-none bg-[#d0d0d0] rounded-full cursor-pointer"
              style={{ accentColor: 'hsl(174, 80%, 41%)' }} />
            <span className="text-[10px] text-[#666] min-w-[24px] text-right">{(props.filters as any)[f.key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoSelectionFormat() {
  return (
    <div className="text-center py-8">
      <div className="text-[12px] text-[#999] font-medium">No object selected</div>
      <p className="text-[10px] text-[#bbb] mt-1">Select an object on the slide to edit its properties</p>
    </div>
  );
}

function FieldInput({ label, value, onChange, suffix }: {
  label: string; value: number; onChange: (v: number) => void; suffix?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      {label && <span className="text-[10px] text-[#999] font-medium min-w-[10px]">{label}</span>}
      <input
        type="number"
        value={Math.round(value)}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="flex-1 h-6 px-1.5 border border-[#d0d0d0] rounded text-[10px] bg-white text-[#555] w-full min-w-0"
      />
      {suffix && <span className="text-[10px] text-[#999]">{suffix}</span>}
    </div>
  );
}

function DesignSection() {
  const store = usePresentationStore();
  const currentSlide = store.presentation.slides[store.currentSlideIndex];

  const handleBgColor = (color: string) => {
    if (!currentSlide) return;
    store.updateSlide(currentSlide.id, { background: { type: 'color', value: color } });
  };

  return (
    <>
      <div>
        <SectionHeader title="Background Color" />
        <div className="grid grid-cols-8 gap-1">
          {[
            '#ffffff', '#f8f9fa', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#374151', '#111827',
            '#20B2AA', '#FFD700', '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899',
          ].map((color) => (
            <button key={color} onClick={() => handleBgColor(color)}
              className="w-6 h-6 rounded border border-[#d0d0d0] hover:ring-2 hover:ring-[#20B2AA]/50"
              style={{ background: color }} />
          ))}
        </div>
      </div>
    </>
  );
}

function AnimateSection() {
  const animations = [
    { name: 'None', active: true }, { name: 'Fade In' }, { name: 'Slide Up' },
    { name: 'Zoom In' }, { name: 'Bounce' }, { name: 'Fly In' },
  ];
  return (
    <div>
      <SectionHeader title="Entrance Animation" />
      <div className="space-y-1">
        {animations.map((anim) => (
          <button key={anim.name} className={cn(
            "w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium",
            anim.active ? "bg-[#e6f7f6] text-[#20B2AA] border border-[#20B2AA]/30" : "text-[#555] hover:bg-[#e8e8e8]"
          )}>{anim.name}</button>
        ))}
      </div>
    </div>
  );
}