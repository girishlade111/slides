import PptxGenJS from 'pptxgenjs';
import type { Presentation, ShapeProperties } from '@/store/types';

const PX_TO_INCHES = 1 / 96;

function hexColor(color: string): string {
  // Strip '#' and handle common formats
  if (color.startsWith('#')) return color.slice(1).toUpperCase();
  if (color.startsWith('rgb')) {
    const m = color.match(/\d+/g);
    if (m && m.length >= 3) {
      return m.slice(0, 3).map(v => parseInt(v).toString(16).padStart(2, '0')).join('').toUpperCase();
    }
  }
  return '000000';
}

function mapShape(shape: string): keyof typeof PptxGenJS.ShapeType | null {
  const map: Record<string, string> = {
    rectangle: 'rect',
    circle: 'ellipse',
    triangle: 'triangle',
    star: 'star5',
    hexagon: 'hexagon',
    line: 'line',
    arrow: 'rightArrow',
  };
  return (map[shape] || null) as any;
}

export async function exportToPPTX(presentation: Presentation): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.title = presentation.name;
  pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 inches (≈1920x1080 at 144dpi)

  for (const slide of presentation.slides) {
    const pptxSlide = pptx.addSlide();

    // Background
    if (slide.background.type === 'color') {
      pptxSlide.background = { color: hexColor(slide.background.value) };
    } else if (slide.background.type === 'gradient' && slide.background.gradientFrom && slide.background.gradientTo) {
      pptxSlide.background = { color: hexColor(slide.background.gradientFrom) };
    }

    // Notes
    if (slide.notes) {
      pptxSlide.addNotes(slide.notes);
    }

    // Objects sorted by zIndex
    const sorted = [...slide.objects].sort((a, b) => a.zIndex - b.zIndex);

    for (const obj of sorted) {
      if (!obj.visible) continue;

      const x = obj.position.x * PX_TO_INCHES;
      const y = obj.position.y * PX_TO_INCHES;
      const w = obj.size.width * PX_TO_INCHES;
      const h = obj.size.height * PX_TO_INCHES;
      const rotate = obj.rotation || 0;

      if (obj.properties.type === 'text') {
        const p = obj.properties;
        pptxSlide.addText(p.content, {
          x, y, w, h, rotate,
          fontSize: Math.round(p.fontSize * 0.75), // px to pt
          color: hexColor(p.color),
          fontFace: p.fontFamily,
          bold: p.fontWeight >= 700,
          italic: p.fontStyle === 'italic',
          underline: { style: p.textDecoration === 'underline' ? 'sng' : 'none' } as any,
          strike: p.textDecoration === 'line-through' ? 'sngStrike' : undefined,
          align: p.textAlign === 'justify' ? 'justify' : p.textAlign,
          transparency: Math.round((1 - obj.opacity) * 100),
        });
      }

      if (obj.properties.type === 'shape') {
        const p = obj.properties as ShapeProperties;
        const shapeName = mapShape(p.shape);
        if (!shapeName) continue;

        pptxSlide.addShape((pptx as any).ShapeType?.[shapeName] || shapeName, {
          x, y, w, h, rotate,
          fill: { color: hexColor(p.fillColor), transparency: Math.round((1 - p.fillOpacity / 100) * 100) },
          line: p.borderWidth > 0 ? { color: hexColor(p.borderColor), width: p.borderWidth } : undefined,
          rectRadius: p.borderRadius ? p.borderRadius * PX_TO_INCHES : undefined,
        } as any);
      }

      if (obj.properties.type === 'image') {
        const p = obj.properties;
        try {
          pptxSlide.addImage({
            data: p.src, // base64 data URL
            x, y, w, h,
            rounding: false,
            transparency: Math.round((1 - obj.opacity) * 100),
          } as any);
        } catch {
          // Skip images that can't be embedded
        }
      }
    }
  }

  await pptx.writeFile({ fileName: `${presentation.name || 'presentation'}.pptx` });
}
