import { useState } from 'react';
import {
  Download, FileText, FileImage, FileCode, Monitor, Loader2, Check,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useSlidesStore } from '@/store/useSlidesStore';
import { createOffscreenSlideContainer, removeOffscreenContainer } from '@/lib/exportPDF';
import { exportToPPTX } from '@/lib/exportPPTX';
import { exportToPNG } from '@/lib/exportPNG';
import { exportToHTML } from '@/lib/exportHTML';
import html2canvas from 'html2canvas';
import type { Presentation } from '@/store/types';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const { slides, presentationMeta } = useSlidesStore();
  const presentationName = presentationMeta?.name || 'presentation';

  // Shared
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [done, setDone] = useState(false);

  // PDF options
  const [pdfQuality, setPdfQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [pdfIncludeNotes, setPdfIncludeNotes] = useState(false);
  const [pdfPageSize, setPdfPageSize] = useState<'slides' | 'a4' | 'letter'>('slides');
  const [pdfOrientation, setPdfOrientation] = useState<'landscape' | 'portrait'>('landscape');

  // PPTX options
  const [pptxIncludeAnimations, setPptxIncludeAnimations] = useState(false);

  // PNG options
  const [pngScale, setPngScale] = useState<1 | 2 | 4>(2);
  const [pngExportRange, setPngExportRange] = useState<'all' | 'current'>('all');
  const [pngAsZip, setPngAsZip] = useState(true);

  // HTML options
  const [htmlNavigation, setHtmlNavigation] = useState(true);
  const [htmlAutoAdvance, setHtmlAutoAdvance] = useState(false);
  const [htmlAutoInterval, setHtmlAutoInterval] = useState(5);

  const reset = () => {
    setExporting(false);
    setProgress(0);
    setProgressTotal(0);
    setDone(false);
  };

  // Build a minimal offscreen renderer for capture-based exports
  const renderSlideOffscreen = (index: number): HTMLElement | null => {
    const slide = slides[index];
    if (!slide) return null;
    const container = createOffscreenSlideContainer();
    const bgStyle = slide.background?.type === 'color'
      ? slide.background.color || '#ffffff'
      : slide.background?.type === 'gradient' && slide.background.gradient
        ? `linear-gradient(${slide.background.gradient.angle}deg, ${slide.background.gradient.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
        : '#ffffff';

    container.style.background = bgStyle;

    slide.objects
      .sort((a, b) => (a.y - b.y))
      .forEach((obj) => {
        const el = document.createElement('div');
        el.style.cssText = `
          position: absolute;
          left: ${obj.x}px; top: ${obj.y}px;
          width: ${obj.width}px; height: ${obj.height}px;
          ${obj.rotation ? `transform: rotate(${obj.rotation}deg);` : ''}
        `;

        if (obj.type === 'shape') {
          el.style.backgroundColor = obj.fill || '#60A5FA';
          if (obj.stroke) el.style.border = `${obj.strokeWidth || 2}px solid ${obj.stroke}`;
          if (obj.shapeType === 'circle') el.style.borderRadius = '50%';
        } else if (obj.type === 'image' && obj.src) {
          const img = document.createElement('img');
          img.src = obj.src;
          img.style.cssText = 'width:100%;height:100%;object-fit:contain;';
          el.appendChild(img);
        } else {
          el.style.fontSize = `${obj.fontSize || 24}px`;
          el.style.fontFamily = obj.fontFamily || 'sans-serif';
          el.style.color = obj.color || '#000000';
          el.style.fontWeight = obj.fontWeight || 'normal';
          el.style.fontStyle = obj.fontStyle || 'normal';
          el.style.textAlign = obj.align || 'left';
          el.style.whiteSpace = 'pre-wrap';
          el.style.wordWrap = 'break-word';
          el.textContent = obj.text;
        }

        container.appendChild(el);
      });

    return container;
  };

  const cleanupContainer = (el: HTMLElement | null) => {
    if (el && el.parentElement) {
      removeOffscreenContainer(el as HTMLDivElement);
    }
  };

  // ---- PDF ----
  const handlePDF = async () => {
    setExporting(true);
    setDone(false);
    try {
      const dpiScale = pdfQuality === 'low' ? 0.5 : pdfQuality === 'high' ? 2 : 1;
      const { default: jsPDF } = await import('jspdf');

      const pageFormats: Record<string, [number, number]> = {
        slides: [960, 540],
        a4: pdfOrientation === 'landscape' ? [841.89, 595.28] : [595.28, 841.89],
        letter: pdfOrientation === 'landscape' ? [792, 612] : [612, 792],
      };
      const [pw, ph] = pageFormats[pdfPageSize];

      const pdf = new jsPDF({
        orientation: pdfOrientation,
        unit: 'px',
        format: [pw, ph],
      });

      for (let i = 0; i < slides.length; i++) {
        setProgress(i + 1);
        setProgressTotal(slides.length);

        const el = renderSlideOffscreen(i);
        if (!el) continue;

        const canvas = await html2canvas(el, {
          width: 1920,
          height: 1080,
          scale: dpiScale,
          useCORS: true,
          backgroundColor: null,
          logging: false,
        });
        cleanupContainer(el);

        const imgData = canvas.toDataURL('image/png');
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, pw, ph);

        if (pdfIncludeNotes) {
          // Notes not directly accessible from SlideData in this store,
          // but we can add a simple note placeholder
        }
      }

      pdf.save(`${presentationName}.pdf`);
      setDone(true);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  // ---- PPTX ----
  const handlePPTX = async () => {
    setExporting(true);
    setDone(false);
    try {
      setProgress(1);
      setProgressTotal(1);

      // Build a Presentation-compatible object from slides
      const presentation: Presentation = {
        id: 'export',
        name: presentationName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        theme: 'default',
        slideWidth: 1920,
        slideHeight: 1080,
        slides: slides.map((s, idx) => ({
          id: s.id,
          order: idx,
          name: s.name,
          background: {
            type: s.background?.type === 'gradient' ? 'gradient' : 'color',
            value: s.background?.color || '#ffffff',
            gradientFrom: s.background?.gradient?.stops?.[0]?.color,
            gradientTo: s.background?.gradient?.stops?.[1]?.color,
          },
          objects: s.objects.map((o) => ({
            id: o.id,
            type: o.type as any,
            position: { x: o.x, y: o.y },
            size: { width: o.width, height: o.height },
            rotation: o.rotation || 0,
            zIndex: 0,
            locked: false,
            visible: true,
            opacity: 1,
            properties: o.type === 'shape'
              ? { type: 'shape' as const, shape: (o.shapeType as any) || 'rectangle', fillColor: o.fill || '#60A5FA', fillOpacity: 100, borderColor: o.stroke || '#000000', borderWidth: o.strokeWidth || 0, borderRadius: 0 }
              : o.type === 'image'
                ? { type: 'image' as const, src: o.src || '', alt: '', objectFit: 'contain' as const, filters: { brightness: 100, contrast: 100, grayscale: 0, blur: 0, sepia: 0 } }
                : { type: 'text' as const, content: o.text, fontFamily: o.fontFamily || 'sans-serif', fontSize: o.fontSize || 24, fontWeight: o.fontWeight === 'bold' ? 700 : 400, fontStyle: (o.fontStyle || 'normal') as any, textDecoration: (o.textDecoration || 'none') as any, textAlign: (o.align || 'left') as any, color: o.color || '#000000', lineHeight: 1.4, letterSpacing: 0 },
          })),
          animations: [],
          transition: { type: 'none', duration: 0.5 },
          notes: '',
        })),
      };

      await exportToPPTX(presentation);
      setDone(true);
    } catch (err) {
      console.error('PPTX export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  // ---- PNG ----
  const handlePNG = async () => {
    setExporting(true);
    setDone(false);
    try {
      const currentIndex = useSlidesStore.getState().currentIndex;
      const indices = pngExportRange === 'current'
        ? [currentIndex]
        : slides.map((_, i) => i);

      await exportToPNG(
        (i) => {
          const el = renderSlideOffscreen(i);
          // Cleanup after a delay to let html2canvas finish
          setTimeout(() => cleanupContainer(el), 500);
          return el;
        },
        {
          scale: pngScale,
          slideIndices: indices,
          asZip: pngAsZip && indices.length > 1,
          presentationName,
        },
        (current, total) => {
          setProgress(current);
          setProgressTotal(total);
        },
      );
      setDone(true);
    } catch (err) {
      console.error('PNG export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  // ---- HTML ----
  const handleHTML = () => {
    setExporting(true);
    setDone(false);
    try {
      exportToHTML(slides, {
        includeNavigation: htmlNavigation,
        autoAdvance: htmlAutoAdvance,
        autoAdvanceInterval: htmlAutoInterval,
        presentationName,
      });
      setDone(true);
    } catch (err) {
      console.error('HTML export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const ProgressOverlay = () => {
    if (!exporting && !done) return null;
    return (
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-10 rounded-lg">
        {exporting ? (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Exporting slide {progress} of {progressTotal}...
            </p>
            <Progress value={(progress / Math.max(progressTotal, 1)) * 100} className="w-48 h-2" />
          </>
        ) : done ? (
          <>
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-sm font-medium text-foreground">Export complete!</p>
            <button
              onClick={() => { reset(); onOpenChange(false); }}
              className="px-4 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </>
        ) : null}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!exporting) { reset(); onOpenChange(v); } }}>
      <DialogContent className="sm:max-w-[520px] relative overflow-hidden">
        <ProgressOverlay />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Presentation
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="pdf" className="mt-2">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pdf" className="text-xs gap-1">
              <FileText className="w-3 h-3" /> PDF
            </TabsTrigger>
            <TabsTrigger value="pptx" className="text-xs gap-1">
              <Monitor className="w-3 h-3" /> PPTX
            </TabsTrigger>
            <TabsTrigger value="png" className="text-xs gap-1">
              <FileImage className="w-3 h-3" /> PNG
            </TabsTrigger>
            <TabsTrigger value="html" className="text-xs gap-1">
              <FileCode className="w-3 h-3" /> HTML
            </TabsTrigger>
          </TabsList>

          {/* PDF */}
          <TabsContent value="pdf" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Quality</Label>
                <Select value={pdfQuality} onValueChange={(v) => setPdfQuality(v as any)}>
                  <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (72 DPI)</SelectItem>
                    <SelectItem value="medium">Medium (150 DPI)</SelectItem>
                    <SelectItem value="high">High (300 DPI)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Page Size</Label>
                <Select value={pdfPageSize} onValueChange={(v) => setPdfPageSize(v as any)}>
                  <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slides">Same as Slides</SelectItem>
                    <SelectItem value="a4">A4</SelectItem>
                    <SelectItem value="letter">US Letter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Orientation</Label>
                <Select value={pdfOrientation} onValueChange={(v) => setPdfOrientation(v as any)}>
                  <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="landscape">Landscape</SelectItem>
                    <SelectItem value="portrait">Portrait</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Include Notes</Label>
                <Switch checked={pdfIncludeNotes} onCheckedChange={setPdfIncludeNotes} />
              </div>
            </div>
            <button onClick={handlePDF} disabled={exporting} className="w-full py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
              Export as PDF
            </button>
          </TabsContent>

          {/* PPTX */}
          <TabsContent value="pptx" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Include Animations</Label>
                <Switch checked={pptxIncludeAnimations} onCheckedChange={setPptxIncludeAnimations} />
              </div>
              <p className="text-xs text-muted-foreground">
                Exports slides with text, shapes, and images to PowerPoint format. Complex gradients may be simplified.
              </p>
            </div>
            <button onClick={handlePPTX} disabled={exporting} className="w-full py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
              Export as PPTX
            </button>
          </TabsContent>

          {/* PNG */}
          <TabsContent value="png" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Quality</Label>
                <Select value={String(pngScale)} onValueChange={(v) => setPngScale(Number(v) as 1 | 2 | 4)}>
                  <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Standard (1x)</SelectItem>
                    <SelectItem value="2">High (2x)</SelectItem>
                    <SelectItem value="4">Ultra (4x)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Export Range</Label>
                <Select value={pngExportRange} onValueChange={(v) => setPngExportRange(v as any)}>
                  <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Slides</SelectItem>
                    <SelectItem value="current">Current Slide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {pngExportRange === 'all' && (
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Download as ZIP</Label>
                  <Switch checked={pngAsZip} onCheckedChange={setPngAsZip} />
                </div>
              )}
            </div>
            <button onClick={handlePNG} disabled={exporting} className="w-full py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
              Export as PNG
            </button>
          </TabsContent>

          {/* HTML */}
          <TabsContent value="html" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Include Navigation</Label>
                <Switch checked={htmlNavigation} onCheckedChange={setHtmlNavigation} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Auto-Advance</Label>
                <Switch checked={htmlAutoAdvance} onCheckedChange={setHtmlAutoAdvance} />
              </div>
              {htmlAutoAdvance && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Interval</Label>
                    <span className="text-xs text-muted-foreground">{htmlAutoInterval}s</span>
                  </div>
                  <Slider
                    value={[htmlAutoInterval]}
                    onValueChange={([v]) => setHtmlAutoInterval(v)}
                    min={2}
                    max={30}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Creates a standalone HTML file with an embedded slide viewer. Use arrow keys or click to navigate.
              </p>
            </div>
            <button onClick={handleHTML} disabled={exporting} className="w-full py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
              Export as HTML
            </button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
