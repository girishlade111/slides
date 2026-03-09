import React from 'react';
import { Stage, Layer, Rect, Text, Circle, Line, Path, Transformer, Image as KonvaImage } from 'react-konva';
import type { SlideData, SlideObject, SlideBackground } from '@/data/slides';
import { useSlidesStore } from '@/store/useSlidesStore';
import { getShapePath, isLineShape } from '@/lib/shapePaths';
import type Konva from 'konva';
import { useRef, useEffect, useImperativeHandle, forwardRef, useState, useCallback } from 'react';
import useImage from 'use-image';

const CANVAS_W = 960;
const CANVAS_H = 540;
const SNAP_THRESHOLD = 5;

export interface KonvaSlideCanvasHandle {
  getStage: () => Konva.Stage | null;
}

interface KonvaSlideCanvasProps {
  slide: SlideData;
  readOnly?: boolean;
}

interface GuideLine {
  points: number[];
  orientation: 'h' | 'v';
}

function getDash(style?: string, strokeWidth?: number): number[] | undefined {
  const sw = strokeWidth ?? 2;
  if (style === 'dashed') return [sw * 4, sw * 2];
  if (style === 'dotted') return [sw, sw * 2];
  return undefined;
}

export const KonvaSlideCanvas = forwardRef<KonvaSlideCanvasHandle, KonvaSlideCanvasProps>(
  function KonvaSlideCanvas({ slide, readOnly = false }, ref) {
    const { selectedObjectId, selectedObjectIds, setSelectedObjectId, toggleObjectSelection, setObjectPosition, updateObjectStyle } = useSlidesStore();
    const stageRef = useRef<Konva.Stage>(null);
    const transformerRef = useRef<Konva.Transformer>(null);
    const nodeRefs = useRef<Record<string, Konva.Node>>({});
    const [guides, setGuides] = useState<GuideLine[]>([]);

    useImperativeHandle(ref, () => ({
      getStage: () => stageRef.current,
    }));

    useEffect(() => {
      if (readOnly || !transformerRef.current) return;
      const ids = selectedObjectIds.length > 0 ? selectedObjectIds : selectedObjectId ? [selectedObjectId] : [];
      const nodes = ids.map(id => nodeRefs.current[id]).filter(Boolean);
      transformerRef.current.nodes(nodes);
      transformerRef.current.getLayer()?.batchDraw();
    }, [selectedObjectId, selectedObjectIds, slide?.objects, readOnly]);

    if (!slide) return null;

    const getSmartGuides = (dragId: string, x: number, y: number, w: number, h: number): GuideLine[] => {
      const lines: GuideLine[] = [];
      const others = slide.objects.filter(o => o.id !== dragId);
      const dragCx = x + w / 2;
      const dragCy = y + h / 2;
      const dragRight = x + w;
      const dragBottom = y + h;

      // Canvas center guides
      if (Math.abs(dragCx - CANVAS_W / 2) < SNAP_THRESHOLD)
        lines.push({ points: [CANVAS_W / 2, 0, CANVAS_W / 2, CANVAS_H], orientation: 'v' });
      if (Math.abs(dragCy - CANVAS_H / 2) < SNAP_THRESHOLD)
        lines.push({ points: [0, CANVAS_H / 2, CANVAS_W, CANVAS_H / 2], orientation: 'h' });

      // Canvas edge guides
      if (Math.abs(x) < SNAP_THRESHOLD) lines.push({ points: [0, 0, 0, CANVAS_H], orientation: 'v' });
      if (Math.abs(dragRight - CANVAS_W) < SNAP_THRESHOLD) lines.push({ points: [CANVAS_W, 0, CANVAS_W, CANVAS_H], orientation: 'v' });
      if (Math.abs(y) < SNAP_THRESHOLD) lines.push({ points: [0, 0, CANVAS_W, 0], orientation: 'h' });
      if (Math.abs(dragBottom - CANVAS_H) < SNAP_THRESHOLD) lines.push({ points: [0, CANVAS_H, CANVAS_W, CANVAS_H], orientation: 'h' });

      for (const other of others) {
        const oCx = other.x + other.width / 2;
        const oCy = other.y + other.height / 2;
        const oRight = other.x + other.width;
        const oBottom = other.y + other.height;

        // Vertical guides (x alignment)
        if (Math.abs(x - other.x) < SNAP_THRESHOLD)
          lines.push({ points: [other.x, Math.min(y, other.y), other.x, Math.max(dragBottom, oBottom)], orientation: 'v' });
        if (Math.abs(dragRight - oRight) < SNAP_THRESHOLD)
          lines.push({ points: [oRight, Math.min(y, other.y), oRight, Math.max(dragBottom, oBottom)], orientation: 'v' });
        if (Math.abs(dragCx - oCx) < SNAP_THRESHOLD)
          lines.push({ points: [oCx, Math.min(y, other.y), oCx, Math.max(dragBottom, oBottom)], orientation: 'v' });
        if (Math.abs(x - oRight) < SNAP_THRESHOLD)
          lines.push({ points: [oRight, Math.min(y, other.y), oRight, Math.max(dragBottom, oBottom)], orientation: 'v' });
        if (Math.abs(dragRight - other.x) < SNAP_THRESHOLD)
          lines.push({ points: [other.x, Math.min(y, other.y), other.x, Math.max(dragBottom, oBottom)], orientation: 'v' });

        // Horizontal guides (y alignment)
        if (Math.abs(y - other.y) < SNAP_THRESHOLD)
          lines.push({ points: [Math.min(x, other.x), other.y, Math.max(dragRight, oRight), other.y], orientation: 'h' });
        if (Math.abs(dragBottom - oBottom) < SNAP_THRESHOLD)
          lines.push({ points: [Math.min(x, other.x), oBottom, Math.max(dragRight, oRight), oBottom], orientation: 'h' });
        if (Math.abs(dragCy - oCy) < SNAP_THRESHOLD)
          lines.push({ points: [Math.min(x, other.x), oCy, Math.max(dragRight, oRight), oCy], orientation: 'h' });
        if (Math.abs(y - oBottom) < SNAP_THRESHOLD)
          lines.push({ points: [Math.min(x, other.x), oBottom, Math.max(dragRight, oRight), oBottom], orientation: 'h' });
        if (Math.abs(dragBottom - other.y) < SNAP_THRESHOLD)
          lines.push({ points: [Math.min(x, other.x), other.y, Math.max(dragRight, oRight), other.y], orientation: 'h' });
      }
      return lines;
    };

    const handleDragMove = (objectId: string, e: Konva.KonvaEventObject<DragEvent>) => {
      if (readOnly) return;
      const node = e.target;
      const obj = slide.objects.find(o => o.id === objectId);
      if (!obj) return;
      const newGuides = getSmartGuides(objectId, node.x(), node.y(), obj.width, obj.height);
      setGuides(newGuides);
    };

    const handleDragEnd = (objectId: string, e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target;
      setObjectPosition(slide.id, objectId, Math.round(node.x()), Math.round(node.y()));
      setGuides([]);
    };

    const handleTransformEnd = (objectId: string, e: Konva.KonvaEventObject<Event>) => {
      const node = e.target;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      updateObjectStyle(slide.id, objectId, {
        x: Math.round(node.x()),
        y: Math.round(node.y()),
        width: Math.round(Math.max(20, node.width() * scaleX)),
        height: Math.round(Math.max(20, node.height() * scaleY)),
      });
    };

    const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (readOnly) return;
      if (e.target === e.target.getStage()) {
        useSlidesStore.getState().clearSelection();
      }
    };

    const refSetter = (id: string) => (node: Konva.Node | null) => {
      if (node) nodeRefs.current[id] = node;
      else delete nodeRefs.current[id];
    };

    const commonEvents = (id: string) => readOnly ? {} : ({
      onClick: (e: Konva.KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true;
        const nativeEvt = e.evt;
        if (nativeEvt.shiftKey) {
          toggleObjectSelection(id);
        } else {
          setSelectedObjectId(id);
        }
      },
      onTap: (e: Konva.KonvaEventObject<Event>) => { e.cancelBubble = true; setSelectedObjectId(id); },
      onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => handleDragMove(id, e),
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => handleDragEnd(id, e),
      onTransformEnd: (e: Konva.KonvaEventObject<Event>) => handleTransformEnd(id, e),
    });

    const shadowProps = (obj: { shadow?: { enabled: boolean; color: string; blur: number; offsetX: number; offsetY: number } }) => {
      if (!obj.shadow?.enabled) return {};
      return {
        shadowColor: obj.shadow.color,
        shadowBlur: obj.shadow.blur,
        shadowOffsetX: obj.shadow.offsetX,
        shadowOffsetY: obj.shadow.offsetY,
        shadowEnabled: true,
      };
    };

    const renderShape = (obj: SlideData['objects'][number]) => {
      const shapeType = obj.shapeType ?? 'rectangle';
      const fill = obj.fill ?? '#60A5FA';
      const stroke = obj.stroke ?? '#1E40AF';
      const sw = obj.strokeWidth ?? 2;
      const dash = getDash(obj.strokeStyle, sw);
      const opacity = obj.fillOpacity ?? 1;
      const rotation = obj.rotation ?? 0;
      const sharedProps = {
        draggable: !readOnly,
        rotation,
        opacity,
        ...shadowProps(obj),
        ...commonEvents(obj.id),
      };

      if (isLineShape(shapeType)) {
        let points: number[];
        if (shapeType === 'elbow-connector') {
          points = [0, 0, obj.width / 2, 0, obj.width / 2, obj.height, obj.width, obj.height];
        } else {
          points = [0, 0, obj.width, obj.height];
        }
        return (
          <Line
            key={obj.id}
            ref={refSetter(obj.id) as React.LegacyRef<Konva.Line>}
            x={obj.x}
            y={obj.y}
            points={points}
            stroke={stroke}
            strokeWidth={sw}
            dash={dash}
            hitStrokeWidth={12}
            {...sharedProps}
          />
        );
      }

      const pathData = getShapePath(shapeType, obj.width, obj.height);
      if (pathData) {
        return (
          <Path
            key={obj.id}
            ref={refSetter(obj.id) as React.LegacyRef<Konva.Path>}
            x={obj.x}
            y={obj.y}
            data={pathData}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
            dash={dash}
            width={obj.width}
            height={obj.height}
            {...sharedProps}
          />
        );
      }

      if (shapeType === 'circle') {
        return (
          <Circle
            key={obj.id}
            ref={refSetter(obj.id) as React.LegacyRef<Konva.Circle>}
            x={obj.x + obj.width / 2}
            y={obj.y + obj.height / 2}
            radius={Math.min(obj.width, obj.height) / 2}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
            dash={dash}
            {...sharedProps}
          />
        );
      }

      const cornerRadius = (shapeType === 'rounded-rectangle' || shapeType === 'start-end') ? Math.min(obj.width, obj.height) * 0.25 : 0;

      return (
        <Rect
          key={obj.id}
          ref={refSetter(obj.id) as React.LegacyRef<Konva.Rect>}
          x={obj.x}
          y={obj.y}
          width={obj.width}
          height={obj.height}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
          cornerRadius={cornerRadius}
          dash={dash}
          {...sharedProps}
        />
      );
    };

    return (
      <Stage
        ref={stageRef}
        width={CANVAS_W}
        height={CANVAS_H}
        onClick={handleStageClick}
        style={{ background: '#ffffff', borderRadius: readOnly ? '0' : '8px', boxShadow: readOnly ? 'none' : '0 4px 24px rgba(0,0,0,0.12)' }}
      >
        <Layer>
          <SlideBackgroundLayer background={slide.background} readOnly={readOnly} />
        </Layer>

        <Layer>
          {slide.objects.map((obj) => {
            if (obj.type === 'shape') {
              return renderShape(obj);
            }

            if (obj.type === 'image' && obj.src) {
              return (
                <SlideImageObject
                  key={obj.id}
                  obj={obj}
                  readOnly={readOnly}
                  refSetter={refSetter}
                  commonEvents={commonEvents}
                  shadowProps={shadowProps}
                />
              );
            }

            const fontSize = obj.fontSize ?? (obj.type === 'title' ? 44 : obj.type === 'subtitle' ? 28 : 22);
            const isBold = obj.fontWeight === 'bold' || obj.type === 'title';
            const isItalic = obj.fontStyle === 'italic';
            const fontStyleStr = `${isBold ? 'bold' : ''}${isItalic ? ' italic' : ''}`.trim() || 'normal';
            const decoration = obj.textDecoration && obj.textDecoration !== 'none' ? obj.textDecoration : '';

            let displayText = obj.text || (obj.type === 'title' ? 'Untitled' : 'Text...');
            if (obj.listStyle === 'bullet') {
              displayText = displayText.split('\n').map((line) => `• ${line}`).join('\n');
            } else if (obj.listStyle === 'numbered') {
              displayText = displayText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n');
            }

            return (
              <React.Fragment key={obj.id}>
                {obj.backgroundColor && obj.backgroundColor !== 'transparent' && (
                  <Rect x={obj.x} y={obj.y} width={obj.width} height={obj.height} fill={obj.backgroundColor} listening={false} />
                )}
                <Text
                  ref={refSetter(obj.id) as React.LegacyRef<Konva.Text>}
                  x={obj.x}
                  y={obj.y}
                  width={obj.width}
                  text={displayText}
                  fontSize={fontSize}
                  fontFamily={obj.fontFamily ?? 'Inter, system-ui, sans-serif'}
                  fontStyle={fontStyleStr}
                  textDecoration={decoration}
                  fill={obj.color ?? '#1a1a2e'}
                  align={obj.align === 'justify' ? 'left' : (obj.align ?? (obj.type === 'title' ? 'center' : 'left'))}
                  lineHeight={obj.lineHeight ?? 1.15}
                  wrap="word"
                  draggable={!readOnly}
                  padding={4}
                  {...commonEvents(obj.id)}
                />
              </React.Fragment>
            );
          })}

          {!readOnly && (
            <Transformer
              ref={transformerRef}
              rotateEnabled={true}
              boundBoxFunc={(_oldBox, newBox) => {
                if (newBox.width < 20 || newBox.height < 20) return _oldBox;
                return newBox;
              }}
              borderStroke="hsl(174, 80%, 41%)"
              borderStrokeWidth={2}
              anchorStroke="hsl(174, 80%, 41%)"
              anchorFill="#ffffff"
              anchorSize={8}
              anchorCornerRadius={2}
            />
          )}
        </Layer>

        {/* Smart guides layer */}
        {!readOnly && guides.length > 0 && (
          <Layer>
            {guides.map((guide, i) => (
              <Line
                key={`guide-${i}`}
                points={guide.points}
                stroke="hsl(346, 84%, 61%)"
                strokeWidth={1}
                dash={[4, 4]}
                listening={false}
              />
            ))}
          </Layer>
        )}
      </Stage>
    );
  }
);

// Separate component for image rendering (uses hooks)
interface SlideImageObjectProps {
  obj: SlideObject;
  readOnly: boolean;
  refSetter: (id: string) => (node: Konva.Node | null) => void;
  commonEvents: (id: string) => Record<string, unknown>;
  shadowProps: (obj: { shadow?: { enabled: boolean; color: string; blur: number; offsetX: number; offsetY: number } }) => Record<string, unknown>;
}

function SlideImageObject({ obj, readOnly, refSetter, commonEvents, shadowProps }: SlideImageObjectProps) {
  const [image] = useImage(obj.src ?? '', 'anonymous');
  
  const border = obj.border ?? { enabled: false, color: '#1E40AF', width: 2 };

  if (!image) return null;

  return (
    <React.Fragment>
      {/* Border background */}
      {border.enabled && (
        <Rect
          x={obj.x - border.width}
          y={obj.y - border.width}
          width={obj.width + border.width * 2}
          height={obj.height + border.width * 2}
          fill={border.color}
          cornerRadius={(obj.cornerRadius ?? 0) + border.width}
          rotation={obj.rotation ?? 0}
          listening={false}
        />
      )}
      <KonvaImage
        ref={refSetter(obj.id) as React.LegacyRef<Konva.Image>}
        image={image}
        x={obj.x}
        y={obj.y}
        width={obj.width}
        height={obj.height}
        rotation={obj.rotation ?? 0}
        opacity={obj.imgOpacity ?? 1}
        cornerRadius={obj.cornerRadius ?? 0}
        draggable={!readOnly}
        {...shadowProps(obj)}
        {...commonEvents(obj.id)}
      />
    </React.Fragment>
  );
}

// Background layer component
function SlideBackgroundLayer({ background, readOnly }: { background?: SlideBackground; readOnly: boolean }) {
  const cr = readOnly ? 0 : 8;

  if (!background || background.type === 'color') {
    return <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill={background?.color ?? '#ffffff'} cornerRadius={cr} listening={false} />;
  }

  if (background.type === 'gradient' && background.gradient) {
    const { stops, type: gType, angle } = background.gradient;
    // Use a canvas-rendered gradient via Konva sceneFunc
    return (
      <Rect
        x={0} y={0} width={CANVAS_W} height={CANVAS_H}
        cornerRadius={cr}
        listening={false}
        sceneFunc={(context, shape) => {
          const ctx = context._context;
          let grad: CanvasGradient;
          if (gType === 'radial') {
            grad = ctx.createRadialGradient(CANVAS_W / 2, CANVAS_H / 2, 0, CANVAS_W / 2, CANVAS_H / 2, Math.max(CANVAS_W, CANVAS_H) / 2);
          } else {
            const a = gType === 'diagonal-lr' ? 135 : gType === 'diagonal-rl' ? 225 : angle;
            const rad = (a * Math.PI) / 180;
            const cx = CANVAS_W / 2, cy = CANVAS_H / 2;
            const len = Math.max(CANVAS_W, CANVAS_H);
            grad = ctx.createLinearGradient(
              cx - Math.cos(rad) * len / 2, cy - Math.sin(rad) * len / 2,
              cx + Math.cos(rad) * len / 2, cy + Math.sin(rad) * len / 2
            );
          }
          stops.forEach((s) => {
            try { grad.addColorStop(s.position / 100, s.color); } catch {}
          });
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.rect(0, 0, CANVAS_W, CANVAS_H);
          ctx.fill();
          context.fillStrokeShape(shape);
        }}
      />
    );
  }

  if (background.type === 'image' && background.image) {
    return <BackgroundImage src={background.image.src} opacity={background.image.opacity} readOnly={readOnly} />;
  }

  if (background.type === 'pattern' && background.pattern) {
    // Render pattern via sceneFunc
    const { type: pType, color: pColor, backgroundColor: pBg, scale: pScale } = background.pattern;
    return (
      <React.Fragment>
        <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill={pBg} cornerRadius={cr} listening={false} />
        <Rect
          x={0} y={0} width={CANVAS_W} height={CANVAS_H}
          cornerRadius={cr}
          listening={false}
          sceneFunc={(context, shape) => {
            const ctx = context._context;
            const s = 20 * pScale;
            ctx.save();
            ctx.strokeStyle = pColor;
            ctx.fillStyle = pColor;
            ctx.lineWidth = 1;
            if (pType === 'dots') {
              for (let x = s / 2; x < CANVAS_W; x += s) {
                for (let y = s / 2; y < CANVAS_H; y += s) {
                  ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
                }
              }
            } else if (pType === 'grid') {
              for (let x = 0; x < CANVAS_W; x += s) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke(); }
              for (let y = 0; y < CANVAS_H; y += s) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke(); }
            } else if (pType === 'horizontal-stripes') {
              for (let y = 0; y < CANVAS_H; y += s) { ctx.fillRect(0, y, CANVAS_W, 2); }
            } else if (pType === 'vertical-stripes') {
              for (let x = 0; x < CANVAS_W; x += s) { ctx.fillRect(x, 0, 2, CANVAS_H); }
            } else if (pType === 'diagonal-stripes') {
              ctx.beginPath();
              for (let i = -CANVAS_H; i < CANVAS_W + CANVAS_H; i += s) {
                ctx.moveTo(i, 0); ctx.lineTo(i + CANVAS_H, CANVAS_H);
              }
              ctx.stroke();
            } else if (pType === 'checkerboard') {
              for (let x = 0; x < CANVAS_W; x += s) {
                for (let y = 0; y < CANVAS_H; y += s) {
                  if (((x / s) + (y / s)) % 2 === 0) ctx.fillRect(x, y, s, s);
                }
              }
            }
            ctx.restore();
            context.fillStrokeShape(shape);
          }}
        />
      </React.Fragment>
    );
  }

  return <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill="#ffffff" cornerRadius={cr} listening={false} />;
}

function BackgroundImage({ src, opacity, readOnly }: { src: string; opacity: number; readOnly: boolean }) {
  const [image] = useImage(src, 'anonymous');
  if (!image) return <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill="#ffffff" cornerRadius={readOnly ? 0 : 8} listening={false} />;
  return (
    <KonvaImage
      image={image}
      x={0} y={0}
      width={CANVAS_W} height={CANVAS_H}
      opacity={opacity / 100}
      listening={false}
    />
  );
}
