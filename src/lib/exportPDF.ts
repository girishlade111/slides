import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Presentation } from '@/store/types';

const SLIDE_W = 1920;
const SLIDE_H = 1080;
const PDF_W = 960;
const PDF_H = 540;

/**
 * Export the current presentation to PDF.
 * Renders each slide into a temporary off-screen container,
 * captures it with html2canvas, then adds it to a jsPDF document.
 */
export async function exportToPDF(
  presentation: Presentation,
  renderSlide: (index: number) => HTMLElement | null,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [PDF_W, PDF_H] });

  for (let i = 0; i < presentation.slides.length; i++) {
    onProgress?.(i + 1, presentation.slides.length);

    const el = renderSlide(i);
    if (!el) continue;

    const canvas = await html2canvas(el, {
      width: SLIDE_W,
      height: SLIDE_H,
      scale: 1,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, 0, PDF_W, PDF_H);
  }

  pdf.save(`${presentation.name || 'presentation'}.pdf`);
}

/**
 * Helper: creates a temporary off-screen container, renders a React element
 * into it, captures it, then cleans up.
 */
export function createOffscreenSlideContainer(): HTMLDivElement {
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed; left: -9999px; top: -9999px;
    width: ${SLIDE_W}px; height: ${SLIDE_H}px;
    overflow: hidden; pointer-events: none;
  `;
  document.body.appendChild(container);
  return container;
}

export function removeOffscreenContainer(container: HTMLDivElement): void {
  document.body.removeChild(container);
}
