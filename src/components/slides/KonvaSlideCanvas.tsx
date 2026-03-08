import { Stage, Layer, Rect, Text, Transformer } from 'react-konva';
import type { SlideData } from '@/data/slides';
import { useSlidesStore } from '@/store/useSlidesStore';
import type Konva from 'konva';
import { useRef, useEffect } from 'react';

const CANVAS_W = 960;
const CANVAS_H = 540;

interface KonvaSlideCanvasProps {
  slide: SlideData;
}

export function KonvaSlideCanvas({ slide }: KonvaSlideCanvasProps) {
  const { selectedObjectId, setSelectedObjectId, setObjectPosition } = useSlidesStore();
  const transformerRef = useRef<Konva.Transformer>(null);
  const nodeRefs = useRef<Record<string, Konva.Node>>({});

  // Update transformer when selection changes
  useEffect(() => {
    if (!transformerRef.current) return;
    const node = selectedObjectId ? nodeRefs.current[selectedObjectId] : null;
    transformerRef.current.nodes(node ? [node] : []);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedObjectId, slide?.objects]);

  if (!slide) return null;

  const handleDragEnd = (objectId: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    setObjectPosition(slide.id, objectId, Math.round(node.x()), Math.round(node.y()));
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      setSelectedObjectId(null);
    }
  };

  return (
    <Stage
      width={CANVAS_W}
      height={CANVAS_H}
      onClick={handleStageClick}
      style={{ background: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
    >
      {/* Background */}
      <Layer>
        <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill="#ffffff" cornerRadius={8} listening={false} />
      </Layer>

      {/* Objects */}
      <Layer>
        {slide.objects.map((obj) => {
          const fontSize = obj.fontSize ?? (obj.type === 'title' ? 44 : obj.type === 'subtitle' ? 28 : 22);
          const fontStyle = obj.type === 'title' ? 'bold' : 'normal';

          return (
            <Text
              key={obj.id}
              ref={(node: Konva.Text | null) => {
                if (node) nodeRefs.current[obj.id] = node;
                else delete nodeRefs.current[obj.id];
              }}
              x={obj.x}
              y={obj.y}
              width={obj.width}
              text={obj.text || (obj.type === 'title' ? 'Untitled' : 'Text...')}
              fontSize={fontSize}
              fontFamily={obj.fontFamily ?? 'Inter, system-ui, sans-serif'}
              fontStyle={fontStyle}
              fill={obj.color ?? '#1a1a2e'}
              align={obj.align ?? (obj.type === 'title' ? 'center' : 'left')}
              wrap="word"
              draggable
              onClick={(e) => { e.cancelBubble = true; setSelectedObjectId(obj.id); }}
              onTap={(e) => { e.cancelBubble = true; setSelectedObjectId(obj.id); }}
              onDragEnd={(e) => handleDragEnd(obj.id, e)}
              padding={4}
            />
          );
        })}

        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          enabledAnchors={['middle-left', 'middle-right']}
          boundBoxFunc={(_oldBox, newBox) => {
            if (newBox.width < 50) return _oldBox;
            return newBox;
          }}
          borderStroke="hsl(221, 83%, 53%)"
          borderStrokeWidth={2}
          anchorStroke="hsl(221, 83%, 53%)"
          anchorFill="#ffffff"
          anchorSize={8}
          anchorCornerRadius={2}
        />
      </Layer>
    </Stage>
  );
}
