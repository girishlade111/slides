import React from 'react';
import { Stage, Layer, Rect, Text, Circle, Line, Path, Transformer, Image as KonvaImage, Group } from 'react-konva';
import type { SlideData, SlideObject } from '@/data/slides';
import { useSlidesStore } from '@/store/useSlidesStore';
import { getShapePath, isLineShape } from '@/lib/shapePaths';
import type Konva from 'konva';
import { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import useImage from 'use-image';

const CANVAS_W = 960;
const CANVAS_H = 540;

export interface KonvaSlideCanvasHandle {
  getStage: () => Konva.Stage | null;
}

interface KonvaSlideCanvasProps {
  slide: SlideData;
  readOnly?: boolean;
}

function getDash(style?: string, strokeWidth?: number): number[] | undefined {
  const sw = strokeWidth ?? 2;
  if (style === 'dashed') return [sw * 4, sw * 2];
  if (style === 'dotted') return [sw, sw * 2];
  return undefined;
}

export const KonvaSlideCanvas = forwardRef<KonvaSlideCanvasHandle, KonvaSlideCanvasProps>(
  function KonvaSlideCanvas({ slide, readOnly = false }, ref) {
    const { selectedObjectId, setSelectedObjectId, setObjectPosition, updateObjectStyle } = useSlidesStore();
    const stageRef = useRef<Konva.Stage>(null);
    const transformerRef = useRef<Konva.Transformer>(null);
    const nodeRefs = useRef<Record<string, Konva.Node>>({});

    useImperativeHandle(ref, () => ({
      getStage: () => stageRef.current,
    }));

    useEffect(() => {
      if (readOnly || !transformerRef.current) return;
      const node = selectedObjectId ? nodeRefs.current[selectedObjectId] : null;
      transformerRef.current.nodes(node ? [node] : []);
      transformerRef.current.getLayer()?.batchDraw();
    }, [selectedObjectId, slide?.objects, readOnly]);

    if (!slide) return null;

    const handleDragEnd = (objectId: string, e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target;
      setObjectPosition(slide.id, objectId, Math.round(node.x()), Math.round(node.y()));
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
        setSelectedObjectId(null);
      }
    };

    const refSetter = (id: string) => (node: Konva.Node | null) => {
      if (node) nodeRefs.current[id] = node;
      else delete nodeRefs.current[id];
    };

    const commonEvents = (id: string) => readOnly ? {} : ({
      onClick: (e: Konva.KonvaEventObject<MouseEvent>) => { e.cancelBubble = true; setSelectedObjectId(id); },
      onTap: (e: Konva.KonvaEventObject<Event>) => { e.cancelBubble = true; setSelectedObjectId(id); },
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

      // Line types
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

      // Path-based shapes
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

      // Circle / Ellipse
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

      // Rounded rect types
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
          <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill="#ffffff" cornerRadius={readOnly ? 0 : 8} listening={false} />
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
      </Stage>
    );
  }
);
