export interface SlideObject {
  id: string;
  type: 'text' | 'shape' | 'image';
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  opacity: number;
  properties: TextProperties | ShapeProperties | ImageProperties;
}

export interface TextProperties {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  color: string;
  lineHeight: number;
  letterSpacing: number;
}

export interface ShapeProperties {
  type: 'shape';
  shape: 'rectangle' | 'circle' | 'triangle' | 'arrow' | 'star' | 'hexagon' | 'line';
  fillColor: string;
  fillOpacity: number;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
}

export interface ImageProperties {
  type: 'image';
  src: string;
  alt: string;
  objectFit: 'cover' | 'contain' | 'fill';
  filters: {
    brightness: number;
    contrast: number;
    grayscale: number;
    blur: number;
    sepia: number;
  };
}

export interface SlideBackground {
  type: 'color' | 'gradient' | 'image';
  value: string;
  gradientDirection?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export interface SlideTransition {
  type: 'none' | 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'zoom' | 'flip';
  duration: number;
}

export interface SlideAnimation {
  objectId: string;
  type: 'entrance' | 'exit' | 'emphasis';
  effect: string;
  duration: number;
  delay: number;
  order: number;
}

export interface Slide {
  id: string;
  order: number;
  name: string;
  background: SlideBackground;
  objects: SlideObject[];
  animations: SlideAnimation[];
  transition: SlideTransition;
  notes: string;
}

export interface Presentation {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  theme: string;
  slideWidth: number;
  slideHeight: number;
  slides: Slide[];
}

export interface HistoryState {
  past: Presentation[];
  future: Presentation[];
}

export const DEFAULT_SLIDE_BACKGROUND: SlideBackground = {
  type: 'color',
  value: '#ffffff',
};

export const DEFAULT_TRANSITION: SlideTransition = {
  type: 'none',
  duration: 0.5,
};

export function createDefaultSlide(order: number): Slide {
  return {
    id: crypto.randomUUID(),
    order,
    name: `Slide ${order + 1}`,
    background: { ...DEFAULT_SLIDE_BACKGROUND },
    objects: [],
    animations: [],
    transition: { ...DEFAULT_TRANSITION },
    notes: '',
  };
}

export function createDefaultPresentation(): Presentation {
  return {
    id: crypto.randomUUID(),
    name: 'Untitled Presentation',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    theme: 'lade-teal',
    slideWidth: 1920,
    slideHeight: 1080,
    slides: [createDefaultSlide(0)],
  };
}