import { useMemo } from 'react';
import type { SlideData } from '@/data/slides';

interface SlideThumbnailPreviewProps {
  slide: SlideData;
}

const THUMB_W = 192;
const THUMB_H = 108;
const CANVAS_W = 960;
const CANVAS_H = 540;

/**
 * Renders a miniature CSS-based preview of slide objects.
 * Much lighter than canvas-based thumbnails for sidebar use.
 */
export function SlideThumbnailPreview({ slide }: SlideThumbnailPreviewProps) {
  const scale = THUMB_W / CANVAS_W;

  const elements = useMemo(() => {
    if (!slide?.objects) return [];
    return slide.objects.map((obj) => {
      if (obj.type === 'shape') {
        const isCircle = obj.shapeType === 'circle';
        return (
          <div
            key={obj.id}
            style={{
              position: 'absolute',
              left: obj.x * scale,
              top: obj.y * scale,
              width: obj.width * scale,
              height: obj.height * scale,
              backgroundColor: obj.fill ?? '#3b82f6',
              border: `${Math.max(1, (obj.strokeWidth ?? 2) * scale)}px solid ${obj.stroke ?? '#1e40af'}`,
              borderRadius: isCircle ? '50%' : 0,
            }}
          />
        );
      }

      const fontSize = (obj.fontSize ?? (obj.type === 'title' ? 44 : obj.type === 'subtitle' ? 28 : 22)) * scale;
      return (
        <div
          key={obj.id}
          style={{
            position: 'absolute',
            left: obj.x * scale,
            top: obj.y * scale,
            width: obj.width * scale,
            fontSize: Math.max(4, fontSize),
            fontWeight: obj.type === 'title' ? 700 : 400,
            color: obj.color ?? '#1a1a2e',
            textAlign: obj.align ?? (obj.type === 'title' ? 'center' : 'left'),
            lineHeight: 1.2,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {obj.text || (obj.type === 'title' ? 'Untitled' : '')}
        </div>
      );
    });
  }, [slide?.objects, scale]);

  return (
    <div
      className="relative w-full h-full bg-white"
      style={{ width: '100%', aspectRatio: '16/9' }}
    >
      <div style={{ position: 'relative', width: THUMB_W, height: THUMB_H, transform: `scale(${1})`, transformOrigin: 'top left' }}>
        {elements}
      </div>
    </div>
  );
}
