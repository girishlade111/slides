import { useState, useRef, useEffect } from 'react';
import {
  FilePlus, FolderOpen, Save, SaveAll, Download, Image, Settings, X, ChevronDown,
} from 'lucide-react';

interface FileMenuProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onExportPng: () => void;
  onSettings: () => void;
  onClose: () => void;
  presentationName?: string;
}

export function FileMenu({
  onNew, onOpen, onSave, onSaveAs, onExportPng, onSettings, onClose, presentationName,
}: FileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const item = (icon: React.ReactNode, label: string, action: () => void, shortcut?: string) => (
    <button
      onClick={() => { action(); setIsOpen(false); }}
      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
    >
      <span className="w-4 h-4 flex items-center justify-center text-muted-foreground">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {shortcut && <span className="text-xs text-muted-foreground">{shortcut}</span>}
    </button>
  );

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2.5 py-1 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors"
      >
        File
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-popover border border-border rounded-lg shadow-lg z-50 py-1.5 px-1.5">
          {item(<FilePlus className="w-4 h-4" />, 'New Presentation', onNew)}
          {item(<FolderOpen className="w-4 h-4" />, 'Open...', onOpen)}

          <div className="my-1.5 border-t border-border" />

          {item(<Save className="w-4 h-4" />, 'Save', onSave, '⌘S')}
          {item(<SaveAll className="w-4 h-4" />, 'Save As...', onSaveAs)}

          <div className="my-1.5 border-t border-border" />

          {item(<Image className="w-4 h-4" />, 'Download as PNG (all slides)', onExportPng)}

          <div className="my-1.5 border-t border-border" />

          {item(<Settings className="w-4 h-4" />, 'Presentation Settings', onSettings)}
          {item(<X className="w-4 h-4" />, 'Close Presentation', onClose)}
        </div>
      )}
    </div>
  );
}
