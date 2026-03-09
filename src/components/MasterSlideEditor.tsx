import React, { useState } from 'react';
import { X, Plus, Trash2, Type, Image, Hash, AlignLeft, Download, Upload, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMasterSlideStore } from '@/store/masterSlideStore';
import type { MasterPlaceholder } from '@/store/masterSlideTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

const PLACEHOLDER_ICONS: Record<MasterPlaceholder['type'], React.ElementType> = {
  title: Type,
  content: AlignLeft,
  subtitle: Type,
  footer: AlignLeft,
  number: Hash,
  image: Image,
};

const PLACEHOLDER_COLORS: Record<MasterPlaceholder['type'], string> = {
  title: 'hsl(174, 80%, 41%)',
  content: 'hsl(217, 91%, 60%)',
  subtitle: 'hsl(262, 83%, 58%)',
  footer: 'hsl(25, 95%, 53%)',
  number: 'hsl(0, 84%, 60%)',
  image: 'hsl(142, 71%, 45%)',
};

interface MasterSlideEditorProps {
  onClose: () => void;
}

export function MasterSlideEditor({ onClose }: MasterSlideEditorProps) {
  const store = useMasterSlideStore();
  const master = store.getActiveMaster();
  const [renamingLayout, setRenamingLayout] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  if (!master) return null;

  const selectedLayout = master.layouts.find((l) => l.id === store.selectedLayoutId);

  const handleAddPlaceholder = (type: MasterPlaceholder['type']) => {
    if (!store.selectedLayoutId) return;
    const placeholder: MasterPlaceholder = {
      id: crypto.randomUUID(),
      type,
      x: 200 + Math.random() * 200,
      y: 200 + Math.random() * 200,
      width: type === 'footer' || type === 'number' ? 400 : 800,
      height: type === 'footer' || type === 'number' ? 50 : 200,
      defaultText: `${type.charAt(0).toUpperCase() + type.slice(1)} placeholder`,
      fontSize: type === 'title' ? 44 : type === 'subtitle' ? 28 : type === 'footer' || type === 'number' ? 16 : 24,
      fontFamily: 'Inter',
      color: type === 'footer' || type === 'number' ? '#999999' : '#333333',
      align: type === 'title' || type === 'subtitle' ? 'center' : 'left',
    };
    store.addPlaceholder(master.id, store.selectedLayoutId, placeholder);
    toast({ title: `${type} placeholder added` });
  };

  const handleExport = () => {
    const json = store.exportMaster(master.id);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${master.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Master slide exported' });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const id = store.importMaster(ev.target?.result as string);
        if (id) {
          toast({ title: 'Master slide imported' });
        } else {
          toast({ title: 'Import failed', variant: 'destructive' });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-100 text-amber-800 text-xs font-semibold">
            <Edit3 className="w-3 h-3" />
            Editing Master Slides
          </div>
          <span className="text-sm font-medium text-foreground">{master.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleImport}>
            <Upload className="w-3 h-3 mr-1" />
            Import
          </Button>
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
          <Button size="sm" variant="outline" onClick={() => {
            const id = store.createMasterSlide();
            store.setActiveMaster(id);
            toast({ title: 'New master slide created' });
          }}>
            <Plus className="w-3 h-3 mr-1" />
            New Master
          </Button>
          <Button size="sm" onClick={onClose}>
            <X className="w-3 h-3 mr-1" />
            Close Master View
          </Button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left sidebar - Layout list */}
        <div className="w-64 border-r border-border bg-muted/20 flex flex-col">
          <div className="p-3 border-b border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Layouts</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {master.layouts.map((layout) => (
              <button
                key={layout.id}
                onClick={() => store.setSelectedLayoutId(layout.id)}
                onDoubleClick={() => {
                  setRenamingLayout(layout.id);
                  setRenameValue(layout.name);
                }}
                className={cn(
                  'w-full text-left rounded-lg p-2 transition-colors',
                  store.selectedLayoutId === layout.id
                    ? 'bg-primary/10 ring-1 ring-primary/30'
                    : 'hover:bg-muted'
                )}
              >
                {/* Mini thumbnail */}
                <div
                  className="w-full aspect-video rounded border border-border mb-1.5 relative overflow-hidden"
                  style={{ backgroundColor: layout.background.value }}
                >
                  {layout.placeholders.map((p) => (
                    <div
                      key={p.id}
                      className="absolute border border-dashed rounded-sm"
                      style={{
                        left: `${(p.x / 1920) * 100}%`,
                        top: `${(p.y / 1080) * 100}%`,
                        width: `${(p.width / 1920) * 100}%`,
                        height: `${(p.height / 1080) * 100}%`,
                        borderColor: PLACEHOLDER_COLORS[p.type],
                        backgroundColor: `${PLACEHOLDER_COLORS[p.type]}15`,
                      }}
                    />
                  ))}
                </div>
                {renamingLayout === layout.id ? (
                  <Input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => {
                      store.updateLayout(master.id, layout.id, { name: renameValue });
                      setRenamingLayout(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        store.updateLayout(master.id, layout.id, { name: renameValue });
                        setRenamingLayout(null);
                      }
                    }}
                    className="h-6 text-xs"
                    autoFocus
                  />
                ) : (
                  <span className="text-xs font-medium text-foreground">{layout.name}</span>
                )}
                <span className="text-[10px] text-muted-foreground block">
                  {layout.placeholders.length} placeholders
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex flex-col">
          {selectedLayout ? (
            <>
              {/* Placeholder toolbar */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/10">
                <span className="text-xs text-muted-foreground mr-2">Add placeholder:</span>
                {(Object.keys(PLACEHOLDER_ICONS) as MasterPlaceholder['type'][]).map((type) => {
                  const Icon = PLACEHOLDER_ICONS[type];
                  return (
                    <button
                      key={type}
                      onClick={() => handleAddPlaceholder(type)}
                      className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-border hover:bg-muted transition-colors"
                      style={{ borderColor: PLACEHOLDER_COLORS[type] }}
                    >
                      <Icon className="w-3 h-3" style={{ color: PLACEHOLDER_COLORS[type] }} />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  );
                })}
              </div>

              {/* Canvas */}
              <div className="flex-1 flex items-center justify-center p-8 bg-muted/20">
                <div className="relative shadow-2xl rounded-lg overflow-hidden" style={{ width: 960, height: 540 }}>
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: selectedLayout.background.value,
                      transform: 'scale(1)',
                    }}
                  >
                    {selectedLayout.placeholders.map((p) => {
                      const Icon = PLACEHOLDER_ICONS[p.type];
                      const isSelected = store.selectedPlaceholderId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => store.setSelectedPlaceholderId(p.id)}
                          className={cn(
                            'absolute border-2 border-dashed rounded cursor-pointer group',
                            isSelected && 'ring-2 ring-primary'
                          )}
                          style={{
                            left: `${(p.x / 1920) * 100}%`,
                            top: `${(p.y / 1080) * 100}%`,
                            width: `${(p.width / 1920) * 100}%`,
                            height: `${(p.height / 1080) * 100}%`,
                            borderColor: PLACEHOLDER_COLORS[p.type],
                            backgroundColor: `${PLACEHOLDER_COLORS[p.type]}10`,
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-0.5 opacity-60">
                              <Icon className="w-4 h-4" style={{ color: PLACEHOLDER_COLORS[p.type] }} />
                              <span className="text-[10px] font-medium" style={{ color: PLACEHOLDER_COLORS[p.type] }}>
                                {p.defaultText}
                              </span>
                            </div>
                          </div>
                          {/* Delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              store.deletePlaceholder(master.id, selectedLayout.id, p.id);
                            }}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full items-center justify-center text-xs hidden group-hover:flex"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Properties panel */}
              {store.selectedPlaceholderId && (() => {
                const placeholder = selectedLayout.placeholders.find((p) => p.id === store.selectedPlaceholderId);
                if (!placeholder) return null;
                return (
                  <div className="border-t border-border p-4 bg-muted/10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-foreground">
                        Placeholder Properties
                      </h4>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => store.deletePlaceholder(master.id, selectedLayout.id, placeholder.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> Delete
                      </Button>
                    </div>
                    <div className="grid grid-cols-6 gap-3">
                      <div>
                        <label className="text-[10px] text-muted-foreground">X</label>
                        <Input
                          type="number"
                          value={placeholder.x}
                          onChange={(e) => store.updatePlaceholder(master.id, selectedLayout.id, placeholder.id, { x: +e.target.value })}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Y</label>
                        <Input
                          type="number"
                          value={placeholder.y}
                          onChange={(e) => store.updatePlaceholder(master.id, selectedLayout.id, placeholder.id, { y: +e.target.value })}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Width</label>
                        <Input
                          type="number"
                          value={placeholder.width}
                          onChange={(e) => store.updatePlaceholder(master.id, selectedLayout.id, placeholder.id, { width: +e.target.value })}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Height</label>
                        <Input
                          type="number"
                          value={placeholder.height}
                          onChange={(e) => store.updatePlaceholder(master.id, selectedLayout.id, placeholder.id, { height: +e.target.value })}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Font Size</label>
                        <Input
                          type="number"
                          value={placeholder.fontSize}
                          onChange={(e) => store.updatePlaceholder(master.id, selectedLayout.id, placeholder.id, { fontSize: +e.target.value })}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Color</label>
                        <div className="flex gap-1">
                          <input
                            type="color"
                            value={placeholder.color}
                            onChange={(e) => store.updatePlaceholder(master.id, selectedLayout.id, placeholder.id, { color: e.target.value })}
                            className="w-7 h-7 rounded border border-border cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="text-[10px] text-muted-foreground">Default Text</label>
                      <Input
                        value={placeholder.defaultText}
                        onChange={(e) => store.updatePlaceholder(master.id, selectedLayout.id, placeholder.id, { defaultText: e.target.value })}
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                );
              })()}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p className="text-sm">Select a layout from the sidebar to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
