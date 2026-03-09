import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

const SLIDE_W = 1920;
const SLIDE_H = 1080;

export interface PNGExportOptions {
  scale: 1 | 2 | 4;
  slideIndices: number[];
  asZip: boolean;
  presentationName: string;
}

export async function exportToPNG(
  renderSlide: (index: number) => HTMLElement | null,
  options: PNGExportOptions,
  onProgress?: (current: number, total: number) => void,
): Promise<void> {
  const { scale, slideIndices, asZip, presentationName } = options;
  const total = slideIndices.length;

  if (!asZip && total === 1) {
    onProgress?.(1, 1);
    const el = renderSlide(slideIndices[0]);
    if (!el) return;
    const canvas = await html2canvas(el, {
      width: SLIDE_W,
      height: SLIDE_H,
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });
    canvas.toBlob((blob) => {
      if (blob) saveAs(blob, `${presentationName}-slide-${slideIndices[0] + 1}.png`);
    }, 'image/png');
    return;
  }

  const zip = new JSZip();

  for (let i = 0; i < total; i++) {
    onProgress?.(i + 1, total);
    const el = renderSlide(slideIndices[i]);
    if (!el) continue;

    const canvas = await html2canvas(el, {
      width: SLIDE_W,
      height: SLIDE_H,
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const dataUrl = canvas.toDataURL('image/png');
    const base64 = dataUrl.split(',')[1];
    zip.file(`slide-${slideIndices[i] + 1}.png`, base64, { base64: true });
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${presentationName}-slides.zip`);
}
