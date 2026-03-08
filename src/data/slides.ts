export interface SlideObject {
  id: string;
  type: 'title' | 'subtitle' | 'body';
  text: string;
}

export interface SlideData {
  id: string;
  name: string;
  objects: SlideObject[];
}

/** Helper to get the first title object's text for sidebar display */
export function getSlideName(slide: SlideData): string {
  return slide.name || slide.objects.find((o) => o.type === 'title')?.text || 'Untitled';
}

/** Migrate old title/content format to object-based */
function toObjects(title: string, content: string): SlideObject[] {
  return [
    { id: crypto.randomUUID(), type: 'title', text: title },
    { id: crypto.randomUUID(), type: 'body', text: content },
  ];
}

export const slides: SlideData[] = [
  {
    id: '1',
    name: 'Welcome to Lade Slides',
    objects: toObjects(
      'Welcome to Lade Slides',
      'A simple, clean presentation viewer built with React and TypeScript. Use the buttons below or arrow keys to navigate.'
    ),
  },
  {
    id: '2',
    name: 'Why Lade Slides?',
    objects: toObjects(
      'Why Lade Slides?',
      'Presentations should be easy to build and pleasant to view. Lade Slides focuses on simplicity and clarity above all else.'
    ),
  },
  {
    id: '3',
    name: 'Keyboard Navigation',
    objects: toObjects(
      'Keyboard Navigation',
      "Press the Right Arrow key to go forward and the Left Arrow key to go back. It's that simple."
    ),
  },
  {
    id: '4',
    name: 'Built with Modern Tools',
    objects: toObjects(
      'Built with Modern Tools',
      'This app is powered by Vite, React 18, TypeScript, and Tailwind CSS — a fast, type-safe, and beautiful stack.'
    ),
  },
  {
    id: '5',
    name: "What's Next?",
    objects: toObjects(
      "What's Next?",
      'Future versions will add slide editing, themes, canvas rendering, and export to PDF and PowerPoint. Stay tuned!'
    ),
  },
];
