import { useState, useRef, useEffect } from 'react';
import type { SlideData } from '@/data/slides';

interface SlideViewProps {
  slide: SlideData;
  onUpdate: (updates: Partial<Pick<SlideData, 'title' | 'content'>>) => void;
}

export function SlideView({ slide, onUpdate }: SlideViewProps) {
  const [editingField, setEditingField] = useState<'title' | 'content' | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingField]);

  // Reset editing when slide changes
  useEffect(() => {
    setEditingField(null);
  }, [slide.id]);

  const startEdit = (field: 'title' | 'content') => {
    setEditingField(field);
    setEditValue(slide[field]);
  };

  const commitEdit = () => {
    if (editingField && editValue.trim()) {
      onUpdate({ [editingField]: editValue.trim() });
    }
    setEditingField(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && editingField === 'title') {
      e.preventDefault();
      commitEdit();
    }
    if (e.key === 'Escape') {
      setEditingField(null);
    }
    // Stop arrow keys from navigating slides while editing
    e.stopPropagation();
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-8 py-12 text-center">
      {editingField === 'title' ? (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="text-4xl font-bold text-foreground mb-6 bg-transparent border-b-2 border-primary outline-none text-center w-full max-w-2xl"
        />
      ) : (
        <h1
          onClick={() => startEdit('title')}
          className="text-4xl font-bold text-foreground mb-6 cursor-text hover:bg-muted/50 rounded-lg px-3 py-1 transition-colors"
        >
          {slide.title}
        </h1>
      )}

      {editingField === 'content' ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          rows={4}
          className="text-lg text-muted-foreground max-w-2xl leading-relaxed bg-transparent border-2 border-primary rounded-lg outline-none text-center w-full resize-none p-2"
        />
      ) : (
        <p
          onClick={() => startEdit('content')}
          className="text-lg text-muted-foreground max-w-2xl leading-relaxed cursor-text hover:bg-muted/50 rounded-lg px-3 py-1 transition-colors"
        >
          {slide.content}
        </p>
      )}
    </div>
  );
}
