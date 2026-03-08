import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Slide, SlideObject } from '@/store/types';
import { usePresentationStore } from '@/store/presentationStore';
import { RotateCw } from 'lucide-react';

interface InteractiveSlideEditorProps {
  slide: Slide;
  scale: number;
}

/**
 * Interactive slide editor that renders slide objects with selection,
 * dragging, resizing, and inline text editing.
 */
export function InteractiveSlideEditor({ slide, scale }: InteractiveSlideEditorProps) {
  const { selectedObjectIds, selectObjects, clearSelection, updateObject, deleteObject, moveObject, rotateObject, duplicateObject, bringToFront, sendToBack } = usePresentationStore();
  const [dragState, setDragState] = useState<{
    objectId: string;
    startX: number;
    startY: number;
    startObjX: number;
    startObjY: number;
  } | null>(null);
  const [resizeState, setResizeState] = useState<{
    objectId: string;
    handle: string;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    startObjX: number;
    startObjY: number;
  } | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [rotateState, setRotateState] = useState<{
    objectId: string;
    centerX: number;
    centerY: number;
    startAngle: number;
    startRotation: number;
  } | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const GRID_SIZE = 10;

  const snap = (val: number) => snapToGrid ? Math.round(val / GRID_SIZE) * GRID_SIZE : Math.round(val);

  const bgStyle = getBackgroundStyle(slide.background);

  // Handle clicking on empty canvas area
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      clearSelection();
      setEditingTextId(null);
    }
  }, [clearSelection]);

  // Handle clicking on an object
  const handleObjectMouseDown = useCallback((e: React.MouseEvent, obj: SlideObject) => {
    e.stopPropagation();
    if (obj.locked) return;

    selectObjects([obj.id]);

    // Start drag
    setDragState({
      objectId: obj.id,
      startX: e.clientX / scale,
      startY: e.clientY / scale,
      startObjX: obj.position.x,
      startObjY: obj.position.y,
    });
  }, [selectObjects, scale]);

  // Handle resize handle mouse down
  const handleResizeMouseDown = useCallback((e: React.MouseEvent, obj: SlideObject, handle: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (obj.locked) return;

    setResizeState({
      objectId: obj.id,
      handle,
      startX: e.clientX / scale,
      startY: e.clientY / scale,
      startW: obj.size.width,
      startH: obj.size.height,
      startObjX: obj.position.x,
      startObjY: obj.position.y,
    });
  }, [scale]);

  // Rotation handle
  const handleRotateMouseDown = useCallback((e: React.MouseEvent, obj: SlideObject) => {
    e.stopPropagation();
    e.preventDefault();
    if (obj.locked) return;

    const rect = (e.target as HTMLElement).closest('[data-object-wrapper]')?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);

    setRotateState({
      objectId: obj.id,
      centerX,
      centerY,
      startAngle,
      startRotation: obj.rotation,
    });
  }, []);

  // Mouse move handler for drag/resize/rotate
  useEffect(() => {
    if (!dragState && !resizeState && !rotateState) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (dragState) {
        const dx = e.clientX / scale - dragState.startX;
        const dy = e.clientY / scale - dragState.startY;
        updateObject(slide.id, dragState.objectId, {
          position: {
            x: snap(dragState.startObjX + dx),
            y: snap(dragState.startObjY + dy),
          },
        });
      }
      if (resizeState) {
        const dx = e.clientX / scale - resizeState.startX;
        const dy = e.clientY / scale - resizeState.startY;
        const h = resizeState.handle;
        let newW = resizeState.startW;
        let newH = resizeState.startH;
        let newX = resizeState.startObjX;
        let newY = resizeState.startObjY;

        if (h.includes('e')) newW = Math.max(20, resizeState.startW + dx);
        if (h.includes('w')) { newW = Math.max(20, resizeState.startW - dx); newX = resizeState.startObjX + dx; }
        if (h.includes('s')) newH = Math.max(20, resizeState.startH + dy);
        if (h.includes('n')) { newH = Math.max(20, resizeState.startH - dy); newY = resizeState.startObjY + dy; }

        // Shift = maintain aspect ratio (corner handles only)
        if (e.shiftKey && (h === 'nw' || h === 'ne' || h === 'sw' || h === 'se')) {
          const aspect = resizeState.startW / resizeState.startH;
          if (Math.abs(dx) > Math.abs(dy)) {
            newH = newW / aspect;
          } else {
            newW = newH * aspect;
          }
        }

        updateObject(slide.id, resizeState.objectId, {
          size: { width: snap(Math.max(20, newW)), height: snap(Math.max(20, newH)) },
          position: { x: snap(newX), y: snap(newY) },
        });
      }
      if (rotateState) {
        const currentAngle = Math.atan2(e.clientY - rotateState.centerY, e.clientX - rotateState.centerX) * (180 / Math.PI);
        let newRotation = rotateState.startRotation + (currentAngle - rotateState.startAngle);
        // Snap to 15-degree increments when holding Shift
        if (e.shiftKey) {
          newRotation = Math.round(newRotation / 15) * 15;
        }
        rotateObject(slide.id, rotateState.objectId, newRotation);
      }
    };

    const handleMouseUp = () => {
      setDragState(null);
      setResizeState(null);
      setRotateState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, resizeState, rotateState, scale, slide.id, updateObject, rotateObject]);

  // Double-click to edit text
  const handleDoubleClick = useCallback((e: React.MouseEvent, obj: SlideObject) => {
    e.stopPropagation();
    if (obj.properties.type === 'text') {
      setEditingTextId(obj.id);
    }
  }, []);

  // Handle keyboard on selected objects (delete, arrow nudge, layer ordering, duplicate)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingTextId) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (selectedObjectIds.length === 0) return;

      const step = e.shiftKey ? 10 : 1;

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          selectedObjectIds.forEach((id) => deleteObject(slide.id, id));
          break;
        case 'ArrowUp':
          e.preventDefault();
          selectedObjectIds.forEach((id) => moveObject(slide.id, id, 0, -step));
          break;
        case 'ArrowDown':
          e.preventDefault();
          selectedObjectIds.forEach((id) => moveObject(slide.id, id, 0, step));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          selectedObjectIds.forEach((id) => moveObject(slide.id, id, -step, 0));
          break;
        case 'ArrowRight':
          e.preventDefault();
          selectedObjectIds.forEach((id) => moveObject(slide.id, id, step, 0));
          break;
        case ']':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            selectedObjectIds.forEach((id) => e.shiftKey ? bringToFront(slide.id, id) : usePresentationStore.getState().bringForward(slide.id, id));
          }
          break;
        case '[':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            selectedObjectIds.forEach((id) => e.shiftKey ? sendToBack(slide.id, id) : usePresentationStore.getState().sendBackward(slide.id, id));
          }
          break;
        case 'd':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            selectedObjectIds.forEach((id) => duplicateObject(slide.id, id));
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectIds, editingTextId, slide.id, deleteObject, moveObject, duplicateObject, bringToFront, sendToBack]);

  const sortedObjects = [...slide.objects].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      className="w-full h-full relative"
      style={bgStyle}
      onClick={handleCanvasClick}
    >
      {sortedObjects.map((obj) => {
        if (!obj.visible) return null;
        const isSelected = selectedObjectIds.includes(obj.id);
        const isEditing = editingTextId === obj.id;

        return (
          <div
            key={obj.id}
            data-object-wrapper
            className={cn(
              "absolute group",
              isSelected && "ring-2 ring-lade-teal",
              !obj.locked && "cursor-move"
            )}
            style={{
              left: obj.position.x,
              top: obj.position.y,
              width: obj.size.width,
              height: obj.size.height,
              transform: `rotate(${obj.rotation}deg)`,
              zIndex: obj.zIndex,
              opacity: obj.opacity,
            }}
            onMouseDown={(e) => handleObjectMouseDown(e, obj)}
            onDoubleClick={(e) => handleDoubleClick(e, obj)}
          >
            {/* Object content */}
            <ObjectRenderer obj={obj} isEditing={isEditing} slideId={slide.id} onStopEditing={() => setEditingTextId(null)} />

            {/* Selection handles + rotation */}
            {isSelected && !obj.locked && (
              <>
                <SelectionHandles obj={obj} onResizeStart={handleResizeMouseDown} />
                {/* Rotation handle */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center z-50"
                  style={{ top: -36 }}
                >
                  <div className="w-px h-4 bg-lade-teal" />
                  <div
                    className="w-5 h-5 rounded-full bg-white border-2 border-lade-teal flex items-center justify-center cursor-grab hover:bg-lade-teal/10"
                    onMouseDown={(e) => handleRotateMouseDown(e, obj)}
                  >
                    <RotateCw className="w-3 h-3 text-lade-teal" />
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}

      {/* Empty slide placeholder */}
      {slide.objects.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[48px] font-light text-[#ccc]">Click to add title</p>
          <p className="text-[28px] font-light text-[#ddd] mt-4">Click to add subtitle</p>
        </div>
      )}
    </div>
  );
}

/** Renders object content based on type */
function ObjectRenderer({ obj, isEditing, slideId, onStopEditing }: {
  obj: SlideObject;
  isEditing: boolean;
  slideId: string;
  onStopEditing: () => void;
}) {
  const { updateObject } = usePresentationStore();

  if (obj.properties.type === 'text') {
    if (isEditing) {
      return (
        <EditableText
          obj={obj}
          slideId={slideId}
          onStopEditing={onStopEditing}
        />
      );
    }
    return (
      <div
        className="w-full h-full overflow-hidden pointer-events-none"
        style={{
          fontFamily: obj.properties.fontFamily,
          fontSize: obj.properties.fontSize,
          fontWeight: obj.properties.fontWeight,
          fontStyle: obj.properties.fontStyle,
          textDecoration: obj.properties.textDecoration === 'none' ? undefined : obj.properties.textDecoration,
          textAlign: obj.properties.textAlign,
          color: obj.properties.color,
          lineHeight: obj.properties.lineHeight,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {obj.properties.content}
      </div>
    );
  }

  if (obj.properties.type === 'shape') {
    return <ShapeContent properties={obj.properties} width={obj.size.width} height={obj.size.height} />;
  }

  if (obj.properties.type === 'image') {
    return (
      <img
        src={obj.properties.src}
        alt={obj.properties.alt}
        className="w-full h-full pointer-events-none"
        style={{
          objectFit: obj.properties.objectFit,
          filter: `brightness(${obj.properties.filters.brightness}%) contrast(${obj.properties.filters.contrast}%) grayscale(${obj.properties.filters.grayscale}%) blur(${obj.properties.filters.blur}px) sepia(${obj.properties.filters.sepia}%)`,
        }}
        draggable={false}
      />
    );
  }

  return null;
}

/** Inline editable text area */
function EditableText({ obj, slideId, onStopEditing }: {
  obj: SlideObject;
  slideId: string;
  onStopEditing: () => void;
}) {
  const { updateObject } = usePresentationStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const props = obj.properties as import('@/store/types').TextProperties;

  useEffect(() => {
    textareaRef.current?.focus();
    textareaRef.current?.select();
  }, []);

  const handleBlur = () => {
    onStopEditing();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateObject(slideId, obj.id, {
      properties: { ...props, content: e.target.value },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onStopEditing();
    }
    e.stopPropagation();
  };

  return (
    <textarea
      ref={textareaRef}
      value={props.content}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="w-full h-full resize-none border-none outline-none bg-transparent p-0"
      style={{
        fontFamily: props.fontFamily,
        fontSize: props.fontSize,
        fontWeight: props.fontWeight,
        fontStyle: props.fontStyle,
        textDecoration: props.textDecoration === 'none' ? undefined : props.textDecoration,
        textAlign: props.textAlign,
        color: props.color,
        lineHeight: props.lineHeight,
      }}
    />
  );
}

/** Shape content renderer */
function ShapeContent({ properties, width, height }: { properties: any; width: number; height: number }) {
  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: properties.fillColor,
    opacity: properties.fillOpacity / 100,
    border: properties.borderWidth > 0 ? `${properties.borderWidth}px solid ${properties.borderColor}` : 'none',
  };

  switch (properties.shape) {
    case 'circle':
      return <div style={{ ...style, borderRadius: '50%' }} />;
    case 'triangle':
      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          <polygon
            points={`${width / 2},0 ${width},${height} 0,${height}`}
            fill={properties.fillColor}
            fillOpacity={properties.fillOpacity / 100}
            stroke={properties.borderColor}
            strokeWidth={properties.borderWidth}
          />
        </svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon
            points="50,5 63,35 95,35 70,57 80,90 50,70 20,90 30,57 5,35 37,35"
            fill={properties.fillColor}
            fillOpacity={properties.fillOpacity / 100}
            stroke={properties.borderColor}
            strokeWidth={properties.borderWidth}
          />
        </svg>
      );
    case 'arrow':
      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          <polygon
            points={`0,${height * 0.3} ${width * 0.65},${height * 0.3} ${width * 0.65},0 ${width},${height / 2} ${width * 0.65},${height} ${width * 0.65},${height * 0.7} 0,${height * 0.7}`}
            fill={properties.fillColor}
            fillOpacity={properties.fillOpacity / 100}
            stroke={properties.borderColor}
            strokeWidth={properties.borderWidth}
          />
        </svg>
      );
    case 'hexagon':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon
            points="50,3 93,25 93,75 50,97 7,75 7,25"
            fill={properties.fillColor}
            fillOpacity={properties.fillOpacity / 100}
            stroke={properties.borderColor}
            strokeWidth={properties.borderWidth}
          />
        </svg>
      );
    case 'line':
      return (
        <div className="w-full h-full flex items-center">
          <div style={{ width: '100%', height: properties.borderWidth || 3, backgroundColor: properties.borderColor || properties.fillColor }} />
        </div>
      );
    default: // rectangle
      return <div style={{ ...style, borderRadius: properties.borderRadius || 0 }} />;
  }
}

/** Resize handles around selected object */
function SelectionHandles({ obj, onResizeStart }: {
  obj: SlideObject;
  onResizeStart: (e: React.MouseEvent, obj: SlideObject, handle: string) => void;
}) {
  const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
  const cursorMap: Record<string, string> = {
    nw: 'nw-resize', n: 'n-resize', ne: 'ne-resize', e: 'e-resize',
    se: 'se-resize', s: 's-resize', sw: 'sw-resize', w: 'w-resize',
  };
  const posMap: Record<string, React.CSSProperties> = {
    nw: { top: -4, left: -4 },
    n: { top: -4, left: '50%', transform: 'translateX(-50%)' },
    ne: { top: -4, right: -4 },
    e: { top: '50%', right: -4, transform: 'translateY(-50%)' },
    se: { bottom: -4, right: -4 },
    s: { bottom: -4, left: '50%', transform: 'translateX(-50%)' },
    sw: { bottom: -4, left: -4 },
    w: { top: '50%', left: -4, transform: 'translateY(-50%)' },
  };

  return (
    <>
      {handles.map((h) => (
        <div
          key={h}
          className="absolute w-2 h-2 bg-white border border-[#20B2AA] rounded-sm z-50"
          style={{ cursor: cursorMap[h], ...posMap[h] }}
          onMouseDown={(e) => onResizeStart(e, obj, h)}
        />
      ))}
    </>
  );
}

function getBackgroundStyle(bg: Slide['background']): React.CSSProperties {
  switch (bg.type) {
    case 'gradient':
      return {
        background: `linear-gradient(${bg.gradientDirection || '135deg'}, ${bg.gradientFrom || bg.value}, ${bg.gradientTo || bg.value})`,
      };
    case 'image':
      return { backgroundImage: `url(${bg.value})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    case 'color':
    default:
      return { backgroundColor: bg.value };
  }
}