// SVG path data generators for various shape types.
// All paths are generated for a given width (w) and height (h).

import type { ShapeType } from '@/data/slides';

export function getShapePath(shapeType: ShapeType, w: number, h: number): string | null {
  switch (shapeType) {
    case 'triangle':
      return `M ${w / 2} 0 L ${w} ${h} L 0 ${h} Z`;
    case 'diamond':
    case 'decision':
      return `M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z`;
    case 'pentagon':
      return polygon(5, w, h);
    case 'hexagon':
      return polygon(6, w, h);
    case 'octagon':
      return polygon(8, w, h);
    case 'star':
      return star(5, w, h);
    case 'heart':
      return `M ${w / 2} ${h * 0.3} C ${w * 0.15} ${-h * 0.1}, ${-w * 0.1} ${h * 0.4}, ${w / 2} ${h} C ${w * 1.1} ${h * 0.4}, ${w * 0.85} ${-h * 0.1}, ${w / 2} ${h * 0.3} Z`;
    case 'cloud':
      return `M ${w * 0.25} ${h * 0.6} A ${w * 0.2} ${h * 0.25} 0 1 1 ${w * 0.4} ${h * 0.35} A ${w * 0.18} ${h * 0.2} 0 1 1 ${w * 0.6} ${h * 0.3} A ${w * 0.2} ${h * 0.22} 0 1 1 ${w * 0.8} ${h * 0.45} A ${w * 0.15} ${h * 0.2} 0 1 1 ${w * 0.75} ${h * 0.7} L ${w * 0.25} ${h * 0.7} A ${w * 0.15} ${h * 0.15} 0 1 1 ${w * 0.25} ${h * 0.6} Z`;
    case 'arrow-right':
      return `M 0 ${h * 0.3} L ${w * 0.6} ${h * 0.3} L ${w * 0.6} 0 L ${w} ${h / 2} L ${w * 0.6} ${h} L ${w * 0.6} ${h * 0.7} L 0 ${h * 0.7} Z`;
    case 'arrow-left':
      return `M ${w} ${h * 0.3} L ${w * 0.4} ${h * 0.3} L ${w * 0.4} 0 L 0 ${h / 2} L ${w * 0.4} ${h} L ${w * 0.4} ${h * 0.7} L ${w} ${h * 0.7} Z`;
    case 'arrow-up':
      return `M ${w * 0.3} ${h} L ${w * 0.3} ${h * 0.4} L 0 ${h * 0.4} L ${w / 2} 0 L ${w} ${h * 0.4} L ${w * 0.7} ${h * 0.4} L ${w * 0.7} ${h} Z`;
    case 'arrow-down':
      return `M ${w * 0.3} 0 L ${w * 0.3} ${h * 0.6} L 0 ${h * 0.6} L ${w / 2} ${h} L ${w} ${h * 0.6} L ${w * 0.7} ${h * 0.6} L ${w * 0.7} 0 Z`;
    case 'double-arrow':
      return `M 0 ${h / 2} L ${w * 0.2} 0 L ${w * 0.2} ${h * 0.3} L ${w * 0.8} ${h * 0.3} L ${w * 0.8} 0 L ${w} ${h / 2} L ${w * 0.8} ${h} L ${w * 0.8} ${h * 0.7} L ${w * 0.2} ${h * 0.7} L ${w * 0.2} ${h} Z`;
    case 'curved-arrow':
      return `M ${w * 0.1} ${h * 0.8} Q ${w * 0.1} ${h * 0.2} ${w * 0.6} ${h * 0.2} L ${w * 0.6} 0 L ${w} ${h * 0.3} L ${w * 0.6} ${h * 0.6} L ${w * 0.6} ${h * 0.4} Q ${w * 0.3} ${h * 0.4} ${w * 0.3} ${h * 0.8} Z`;
    case 'document':
      return `M 0 0 L ${w} 0 L ${w} ${h * 0.85} Q ${w * 0.75} ${h * 0.75} ${w / 2} ${h * 0.85} Q ${w * 0.25} ${h * 0.95} 0 ${h * 0.85} Z`;
    case 'database':
      return `M 0 ${h * 0.15} A ${w / 2} ${h * 0.15} 0 0 1 ${w} ${h * 0.15} L ${w} ${h * 0.85} A ${w / 2} ${h * 0.15} 0 0 1 0 ${h * 0.85} Z M 0 ${h * 0.15} A ${w / 2} ${h * 0.15} 0 0 0 ${w} ${h * 0.15}`;
    case 'manual-input':
      return `M 0 ${h * 0.25} L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
    case 'speech-bubble':
      return `M ${w * 0.1} 0 L ${w * 0.9} 0 Q ${w} 0 ${w} ${h * 0.1} L ${w} ${h * 0.65} Q ${w} ${h * 0.75} ${w * 0.9} ${h * 0.75} L ${w * 0.35} ${h * 0.75} L ${w * 0.15} ${h} L ${w * 0.2} ${h * 0.75} L ${w * 0.1} ${h * 0.75} Q 0 ${h * 0.75} 0 ${h * 0.65} L 0 ${h * 0.1} Q 0 0 ${w * 0.1} 0 Z`;
    case 'thought-bubble':
      return `M ${w * 0.5} ${h * 0.05} Q ${w * 0.75} ${-h * 0.05} ${w * 0.85} ${h * 0.15} Q ${w * 1.05} ${h * 0.25} ${w * 0.9} ${h * 0.45} Q ${w * 1.0} ${h * 0.6} ${w * 0.8} ${h * 0.7} Q ${w * 0.65} ${h * 0.82} ${w * 0.45} ${h * 0.75} Q ${w * 0.25} ${h * 0.82} ${w * 0.15} ${h * 0.65} Q ${-w * 0.05} ${h * 0.5} ${w * 0.1} ${h * 0.3} Q ${w * 0.05} ${h * 0.1} ${w * 0.3} ${h * 0.05} Q ${w * 0.4} ${h * 0.02} ${w * 0.5} ${h * 0.05} Z`;
    case 'rectangular-callout':
      return `M 0 0 L ${w} 0 L ${w} ${h * 0.75} L ${w * 0.35} ${h * 0.75} L ${w * 0.15} ${h} L ${w * 0.25} ${h * 0.75} L 0 ${h * 0.75} Z`;
    case 'banner':
      return `M 0 ${h * 0.2} L ${w * 0.1} 0 L ${w * 0.1} ${h * 0.1} L ${w * 0.9} ${h * 0.1} L ${w * 0.9} 0 L ${w} ${h * 0.2} L ${w * 0.9} ${h * 0.4} L ${w * 0.9} ${h * 0.3} L ${w * 0.1} ${h * 0.3} L ${w * 0.1} ${h * 0.4} Z`;
    case 'ribbon':
      return `M ${w * 0.15} 0 L ${w * 0.85} 0 L ${w} ${h * 0.4} L ${w * 0.85} ${h * 0.35} L ${w * 0.85} ${h} L ${w * 0.5} ${h * 0.8} L ${w * 0.15} ${h} L ${w * 0.15} ${h * 0.35} L 0 ${h * 0.4} Z`;
    case 'rounded-rectangle':
    case 'start-end':
    case 'process':
      return null; // Use Konva Rect with cornerRadius
    case 'line':
    case 'connector-line':
    case 'elbow-connector':
      return null; // Use Konva Line
    default:
      return null;
  }
}

function polygon(sides: number, w: number, h: number): string {
  const cx = w / 2, cy = h / 2;
  const rx = w / 2, ry = h / 2;
  const pts = Array.from({ length: sides }, (_, i) => {
    const a = (Math.PI * 2 * i) / sides - Math.PI / 2;
    return `${cx + rx * Math.cos(a)} ${cy + ry * Math.sin(a)}`;
  });
  return `M ${pts.join(' L ')} Z`;
}

function star(points: number, w: number, h: number): string {
  const cx = w / 2, cy = h / 2;
  const outerR = Math.min(w, h) / 2;
  const innerR = outerR * 0.4;
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = (Math.PI * i) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push(`${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`);
  }
  return `M ${pts.join(' L ')} Z`;
}

// Returns true if shape should use Path rendering
export function isPathShape(shapeType: string): boolean {
  return getShapePath(shapeType as ShapeType, 100, 100) !== null;
}

// Returns true if shape is a line type
export function isLineShape(shapeType: string): boolean {
  return shapeType === 'line' || shapeType === 'connector-line' || shapeType === 'elbow-connector';
}
