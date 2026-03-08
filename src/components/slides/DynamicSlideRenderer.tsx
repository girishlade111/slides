import React from 'react';
import { MSSlideLayout } from '@/components/slides/MSSlideLayout';
import type { Slide } from '@/store/types';

interface DynamicSlideRendererProps {
  slide: Slide;
}

/**
 * Renders a slide from store data (background, objects).
 * Used for dynamically created slides (not showcase components).
 */
export function DynamicSlideRenderer({ slide }: DynamicSlideRendererProps) {
  const bgStyle = getBackgroundStyle(slide.background);

  return (
    <div className="w-full h-full relative" style={bgStyle}>
      {slide.objects.map((obj) => (
        <div
          key={obj.id}
          className="absolute"
          style={{
            left: obj.position.x,
            top: obj.position.y,
            width: obj.size.width,
            height: obj.size.height,
            transform: `rotate(${obj.rotation}deg)`,
            zIndex: obj.zIndex,
            opacity: obj.opacity,
            display: obj.visible ? 'block' : 'none',
          }}
        >
          {obj.properties.type === 'text' && (
            <div
              style={{
                fontFamily: obj.properties.fontFamily,
                fontSize: obj.properties.fontSize,
                fontWeight: obj.properties.fontWeight,
                fontStyle: obj.properties.fontStyle,
                textDecoration: obj.properties.textDecoration === 'none' ? undefined : obj.properties.textDecoration,
                textAlign: obj.properties.textAlign,
                color: obj.properties.color,
                lineHeight: obj.properties.lineHeight,
                letterSpacing: obj.properties.letterSpacing,
                width: '100%',
                height: '100%',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {obj.properties.content}
            </div>
          )}
          {obj.properties.type === 'shape' && (
            <ShapeRenderer properties={obj.properties} width={obj.size.width} height={obj.size.height} />
          )}
          {obj.properties.type === 'image' && (
            <img
              src={obj.properties.src}
              alt={obj.properties.alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: obj.properties.objectFit,
                filter: `brightness(${obj.properties.filters.brightness}%) contrast(${obj.properties.filters.contrast}%) grayscale(${obj.properties.filters.grayscale}%) blur(${obj.properties.filters.blur}px) sepia(${obj.properties.filters.sepia}%)`,
              }}
            />
          )}
        </div>
      ))}

      {/* Show placeholder text for empty slides */}
      {slide.objects.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slide-gray-400">
          <p className="text-3xl font-light">Click to add title</p>
          <p className="text-xl font-light mt-4 opacity-60">Click to add subtitle</p>
        </div>
      )}
    </div>
  );
}

function ShapeRenderer({ properties, width, height }: { properties: any; width: number; height: number }) {
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
        <div style={{ width: '100%', height: '100%' }}>
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            <polygon
              points={`${width / 2},0 ${width},${height} 0,${height}`}
              fill={properties.fillColor}
              fillOpacity={properties.fillOpacity / 100}
              stroke={properties.borderColor}
              strokeWidth={properties.borderWidth}
            />
          </svg>
        </div>
      );
    case 'line':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '100%', height: properties.borderWidth || 2, backgroundColor: properties.borderColor || properties.fillColor }} />
        </div>
      );
    default:
      return <div style={{ ...style, borderRadius: properties.borderRadius || 0 }} />;
  }
}

function getBackgroundStyle(bg: Slide['background']): React.CSSProperties {
  switch (bg.type) {
    case 'gradient':
      return {
        background: `linear-gradient(${bg.gradientDirection || '135deg'}, ${bg.gradientFrom || bg.value}, ${bg.gradientTo || bg.value})`,
      };
    case 'image':
      return {
        backgroundImage: `url(${bg.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    case 'color':
    default:
      return { backgroundColor: bg.value };
  }
}