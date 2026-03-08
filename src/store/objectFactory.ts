import { SlideObject, TextProperties, ShapeProperties, ImageProperties } from './types';

/**
 * Factory functions to create slide objects with sensible defaults
 */

export function createTextObject(overrides: Partial<{
  x: number; y: number; width: number; height: number; content: string; fontSize: number;
}> = {}): SlideObject {
  return {
    id: crypto.randomUUID(),
    type: 'text',
    position: { x: overrides.x ?? 200, y: overrides.y ?? 200 },
    size: { width: overrides.width ?? 600, height: overrides.height ?? 100 },
    rotation: 0,
    zIndex: Date.now(),
    locked: false,
    visible: true,
    opacity: 1,
    properties: {
      type: 'text',
      content: overrides.content ?? 'Type your text here',
      fontFamily: 'Inter, sans-serif',
      fontSize: overrides.fontSize ?? 32,
      fontWeight: 400,
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'left',
      color: '#1F2937',
      lineHeight: 1.4,
      letterSpacing: 0,
    } as TextProperties,
  };
}

export function createShapeObject(
  shape: ShapeProperties['shape'] = 'rectangle',
  overrides: Partial<{ x: number; y: number; width: number; height: number; fillColor: string }> = {}
): SlideObject {
  return {
    id: crypto.randomUUID(),
    type: 'shape',
    position: { x: overrides.x ?? 300, y: overrides.y ?? 200 },
    size: { width: overrides.width ?? 300, height: overrides.height ?? 200 },
    rotation: 0,
    zIndex: Date.now(),
    locked: false,
    visible: true,
    opacity: 1,
    properties: {
      type: 'shape',
      shape,
      fillColor: overrides.fillColor ?? '#20B2AA',
      fillOpacity: 100,
      borderColor: '#000000',
      borderWidth: 0,
      borderRadius: shape === 'rectangle' ? 8 : 0,
    } as ShapeProperties,
  };
}

export function createImageObject(
  src: string,
  overrides: Partial<{ x: number; y: number; width: number; height: number }> = {}
): SlideObject {
  return {
    id: crypto.randomUUID(),
    type: 'image',
    position: { x: overrides.x ?? 300, y: overrides.y ?? 150 },
    size: { width: overrides.width ?? 500, height: overrides.height ?? 400 },
    rotation: 0,
    zIndex: Date.now(),
    locked: false,
    visible: true,
    opacity: 1,
    properties: {
      type: 'image',
      src,
      alt: 'Uploaded image',
      objectFit: 'contain',
      filters: {
        brightness: 100,
        contrast: 100,
        grayscale: 0,
        blur: 0,
        sepia: 0,
      },
    } as ImageProperties,
  };
}