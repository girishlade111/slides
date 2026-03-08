import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Circle, Line, RegularPolygon, Star, Arrow, Transformer } from 'react-konva';
import Konva from 'konva';
import type { Slide, SlideObject, TextProperties, ShapeProperties, ImageProperties } from '@/store/types';
import { usePresentationStore } from '@/store/presentationStore';

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const GRID_SIZE = 10;

interface KonvaSlideCanvasProps {
  slide: Slide;
  width: number;
  height: number;
  snapToGrid?: boolean;
}

/**
 * Konva.js-powered slide canvas editor with:
 * - Background layer (color/gradient/image)
 * - Objects layer (text, shapes, images sorted by zIndex)
 * - Selection layer (Transformer handles for resize/rotate)
 * - Snap-to-grid, Shift+aspect-ratio-lock
 */
export function KonvaSlideCanvas({ slide, width, height, snapToGrid = true }: KonvaSlideCanvasProps) {
  const {
    selectedObjectIds,
    selectObjects,
    clearSelection,
    updateObject,
  } = usePresentationStore();

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const nodeRefs = useRef<Record<string, Konva.Node>>({});
  const [loadedImages, setLoadedImages] = useState<Record<string, HTMLImageElement>>({});

  // Compute scale to fit canvas in container
  const scaleX = width / CANVAS_WIDTH;
  const scaleY = height / CANVAS_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  const snap = (val: number) => snapToGrid ? Math.round(val / GRID_SIZE) * GRID_SIZE : Math.round(val);

  // Load images for image objects
  useEffect(() => {
    const imageObjs = slide.objects.filter((o) => o.properties.type === 'image') as Array<SlideObject & { properties: ImageProperties }>;
    imageObjs.forEach((obj) => {
      if (!loadedImages[obj.id] || loadedImages[obj.id].src !== obj.properties.src) {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = obj.properties.src;
        img.onload = () => {
          setLoadedImages((prev) => ({ ...prev, [obj.id]: img }));
        };
      }
    });
  }, [slide.objects]);

  // Update transformer when selection changes
  useEffect(() => {
    if (!transformerRef.current || !layerRef.current) return;
    const nodes = selectedObjectIds
      .map((id) => nodeRefs.current[id])
      .filter(Boolean);
    transformerRef.current.nodes(nodes);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedObjectIds, slide.objects]);

  // Click on empty stage = clear selection
  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      clearSelection();
    }
  }, [clearSelection]);

  // Click on object = select
  const handleObjectClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>, objId: string) => {
    e.cancelBubble = true;
    const obj = slide.objects.find((o) => o.id === objId);
    if (obj?.locked) return;
    selectObjects([objId]);
  }, [selectObjects, slide.objects]);

  // Drag end = update position with snap
  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>, objId: string) => {
    const node = e.target;
    updateObject(slide.id, objId, {
      position: {
        x: snap(node.x()),
        y: snap(node.y()),
      },
    });
  }, [slide.id, updateObject, snapToGrid]);

  // Transform end = update size, rotation, position
  const handleTransformEnd = useCallback((e: Konva.KonvaEventObject<Event>, objId: string) => {
    const node = e.target;
    const scaleXNode = node.scaleX();
    const scaleYNode = node.scaleY();

    // Reset scale and apply to width/height
    node.scaleX(1);
    node.scaleY(1);

    updateObject(slide.id, objId, {
      position: { x: snap(node.x()), y: snap(node.y()) },
      size: {
        width: snap(Math.max(20, node.width() * scaleXNode)),
        height: snap(Math.max(20, node.height() * scaleYNode)),
      },
      rotation: Math.round(node.rotation()),
    });
  }, [slide.id, updateObject, snapToGrid]);

  // Double-click text = enter edit mode via HTML overlay
  const [editingText, setEditingText] = useState<{ id: string; node: Konva.Text } | null>(null);

  const handleTextDblClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>, obj: SlideObject) => {
    if (obj.properties.type !== 'text') return;
    const textNode = e.target as Konva.Text;
    setEditingText({ id: obj.id, node: textNode });
  }, []);

  // Render background
  const renderBackground = () => {
    const bg = slide.background;
    if (bg.type === 'gradient') {
      return (
        <Rect
          x={0} y={0}
          width={CANVAS_WIDTH} height={CANVAS_HEIGHT}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: CANVAS_WIDTH, y: CANVAS_HEIGHT }}
          fillLinearGradientColorStops={[0, bg.gradientFrom || bg.value, 1, bg.gradientTo || bg.value]}
          listening={false}
        />
      );
    }
    if (bg.type === 'image') {
      // For image backgrounds we'd need to load the image
      return <Rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#ffffff" listening={false} />;
    }
    return <Rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill={bg.value} listening={false} />;
  };

  // Render a single object
  const renderObject = (obj: SlideObject) => {
    const { properties } = obj;
    const commonProps = {
      x: obj.position.x,
      y: obj.position.y,
      width: obj.size.width,
      height: obj.size.height,
      rotation: obj.rotation,
      opacity: obj.opacity,
      draggable: !obj.locked,
      visible: obj.visible,
      onClick: (e: Konva.KonvaEventObject<MouseEvent>) => handleObjectClick(e, obj.id),
      onTap: (e: Konva.KonvaEventObject<Event>) => { e.cancelBubble = true; selectObjects([obj.id]); },
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => handleDragEnd(e, obj.id),
      onTransformEnd: (e: Konva.KonvaEventObject<Event>) => handleTransformEnd(e, obj.id),
      ref: (node: Konva.Node | null) => {
        if (node) nodeRefs.current[obj.id] = node;
        else delete nodeRefs.current[obj.id];
      },
    };

    if (properties.type === 'text') {
      const tp = properties as TextProperties;
      return (
        <Text
          key={obj.id}
          {...commonProps}
          text={tp.content}
          fontSize={tp.fontSize}
          fontFamily={tp.fontFamily}
          fontStyle={tp.fontStyle === 'italic' ? 'italic' : 'normal'}
          fontVariant={tp.fontWeight >= 600 ? 'bold' : 'normal'}
          textDecoration={tp.textDecoration === 'none' ? '' : tp.textDecoration}
          align={tp.textAlign}
          fill={tp.color}
          lineHeight={tp.lineHeight}
          letterSpacing={tp.letterSpacing}
          wrap="word"
          onDblClick={(e) => handleTextDblClick(e, obj)}
          onDblTap={(e) => handleTextDblClick(e as any, obj)}
        />
      );
    }

    if (properties.type === 'shape') {
      const sp = properties as ShapeProperties;
      return renderShape(obj, sp, commonProps);
    }

    if (properties.type === 'image') {
      const img = loadedImages[obj.id];
      if (!img) return <Rect key={obj.id} {...commonProps} fill="#f0f0f0" stroke="#ccc" strokeWidth={1} />;
      return (
        <KonvaImage
          key={obj.id}
          {...commonProps}
          image={img}
        />
      );
    }

    return null;
  };

  const renderShape = (obj: SlideObject, sp: ShapeProperties, commonProps: any) => {
    const fill = sp.fillColor;
    const fillOpacity = sp.fillOpacity / 100;
    const stroke = sp.borderWidth > 0 ? sp.borderColor : undefined;
    const strokeWidth = sp.borderWidth;

    switch (sp.shape) {
      case 'circle':
        return (
          <Circle
            key={obj.id}
            {...commonProps}
            // Override x/y to be center
            x={obj.position.x + obj.size.width / 2}
            y={obj.position.y + obj.size.height / 2}
            radiusX={obj.size.width / 2}
            radiusY={obj.size.height / 2}
            width={undefined}
            height={undefined}
            radius={Math.min(obj.size.width, obj.size.height) / 2}
            fill={fill}
            opacity={fillOpacity * obj.opacity}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        );
      case 'triangle':
        return (
          <RegularPolygon
            key={obj.id}
            {...commonProps}
            x={obj.position.x + obj.size.width / 2}
            y={obj.position.y + obj.size.height / 2}
            sides={3}
            radius={Math.min(obj.size.width, obj.size.height) / 2}
            fill={fill}
            opacity={fillOpacity * obj.opacity}
            stroke={stroke}
            strokeWidth={strokeWidth}
            width={undefined}
            height={undefined}
          />
        );
      case 'star':
        return (
          <Star
            key={obj.id}
            {...commonProps}
            x={obj.position.x + obj.size.width / 2}
            y={obj.position.y + obj.size.height / 2}
            numPoints={5}
            innerRadius={Math.min(obj.size.width, obj.size.height) / 4}
            outerRadius={Math.min(obj.size.width, obj.size.height) / 2}
            fill={fill}
            opacity={fillOpacity * obj.opacity}
            stroke={stroke}
            strokeWidth={strokeWidth}
            width={undefined}
            height={undefined}
          />
        );
      case 'hexagon':
        return (
          <RegularPolygon
            key={obj.id}
            {...commonProps}
            x={obj.position.x + obj.size.width / 2}
            y={obj.position.y + obj.size.height / 2}
            sides={6}
            radius={Math.min(obj.size.width, obj.size.height) / 2}
            fill={fill}
            opacity={fillOpacity * obj.opacity}
            stroke={stroke}
            strokeWidth={strokeWidth}
            width={undefined}
            height={undefined}
          />
        );
      case 'arrow':
        return (
          <Arrow
            key={obj.id}
            {...commonProps}
            points={[0, obj.size.height / 2, obj.size.width, obj.size.height / 2]}
            fill={fill}
            stroke={stroke || fill}
            strokeWidth={strokeWidth || 4}
            pointerLength={20}
            pointerWidth={20}
            width={undefined}
            height={undefined}
          />
        );
      case 'line':
        return (
          <Line
            key={obj.id}
            {...commonProps}
            points={[0, 0, obj.size.width, 0]}
            stroke={stroke || fill}
            strokeWidth={strokeWidth || 3}
            width={undefined}
            height={undefined}
          />
        );
      default: // rectangle
        return (
          <Rect
            key={obj.id}
            {...commonProps}
            fill={fill}
            opacity={fillOpacity * obj.opacity}
            stroke={stroke}
            strokeWidth={strokeWidth}
            cornerRadius={sp.borderRadius || 0}
          />
        );
    }
  };

  const sortedObjects = [...slide.objects].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="relative" style={{ width, height }}>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scaleX={scale}
        scaleY={scale}
        offsetX={-(width / scale - CANVAS_WIDTH) / 2}
        offsetY={-(height / scale - CANVAS_HEIGHT) / 2}
        onClick={handleStageClick}
        onTap={() => clearSelection()}
      >
        {/* Background layer */}
        <Layer>
          {renderBackground()}
        </Layer>

        {/* Objects layer */}
        <Layer ref={layerRef}>
          {sortedObjects.map((obj) => renderObject(obj))}

          {/* Transformer (selection handles) */}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              // Minimum size constraint
              if (newBox.width < 20 || newBox.height < 20) return oldBox;
              return newBox;
            }}
            rotateEnabled
            rotationSnaps={[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345]}
            borderStroke="hsl(174, 42%, 41%)"
            borderStrokeWidth={2}
            anchorStroke="hsl(174, 42%, 41%)"
            anchorFill="#ffffff"
            anchorSize={10}
            anchorCornerRadius={2}
            keepRatio={false}
            enabledAnchors={['top-left', 'top-center', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right']}
          />
        </Layer>
      </Stage>

      {/* Inline text editing overlay */}
      {editingText && (() => {
        const obj = slide.objects.find((o) => o.id === editingText.id);
        if (!obj || obj.properties.type !== 'text') return null;
        const tp = obj.properties as TextProperties;
        const stageBox = stageRef.current?.container().getBoundingClientRect();
        if (!stageBox) return null;

        // Calculate position of text node in screen coordinates
        const absPos = editingText.node.getAbsolutePosition();
        const stageScale = scale;
        const offsetX = -(width / scale - CANVAS_WIDTH) / 2;
        const offsetY = -(height / scale - CANVAS_HEIGHT) / 2;

        const screenX = (absPos.x - offsetX) * stageScale + stageBox.left;
        const screenY = (absPos.y - offsetY) * stageScale + stageBox.top;
        const screenW = obj.size.width * stageScale;
        const screenH = obj.size.height * stageScale;

        return (
          <textarea
            autoFocus
            className="absolute border-2 border-lade-teal outline-none bg-white/95 resize-none z-50"
            style={{
              left: screenX - stageBox.left,
              top: screenY - stageBox.top,
              width: screenW,
              height: screenH,
              fontFamily: tp.fontFamily,
              fontSize: tp.fontSize * stageScale,
              fontWeight: tp.fontWeight,
              fontStyle: tp.fontStyle,
              textAlign: tp.textAlign,
              color: tp.color,
              lineHeight: tp.lineHeight,
              padding: 0,
              margin: 0,
              overflow: 'hidden',
              transformOrigin: 'top left',
            }}
            defaultValue={tp.content}
            onBlur={(e) => {
              updateObject(slide.id, obj.id, {
                properties: { ...tp, content: e.target.value },
              });
              setEditingText(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                // Save and close
                updateObject(slide.id, obj.id, {
                  properties: { ...tp, content: (e.target as HTMLTextAreaElement).value },
                });
                setEditingText(null);
              }
              e.stopPropagation();
            }}
          />
        );
      })()}

      {/* Empty slide placeholder */}
      {slide.objects.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-4xl font-light text-muted-foreground/40">Click to add title</p>
          <p className="text-xl font-light text-muted-foreground/30 mt-2">Use Insert tab to add objects</p>
        </div>
      )}
    </div>
  );
}
