export interface SlideData {
  id: string;
  title: string;
  content: string;
}

export const slides: SlideData[] = [
  {
    id: '1',
    title: 'Welcome to Lade Slides',
    content:
      'A simple, clean presentation viewer built with React and TypeScript. Use the buttons below or arrow keys to navigate.',
  },
  {
    id: '2',
    title: 'Why Lade Slides?',
    content:
      'Presentations should be easy to build and pleasant to view. Lade Slides focuses on simplicity and clarity above all else.',
  },
  {
    id: '3',
    title: 'Keyboard Navigation',
    content:
      "Press the Right Arrow key to go forward and the Left Arrow key to go back. It's that simple.",
  },
  {
    id: '4',
    title: 'Built with Modern Tools',
    content:
      'This app is powered by Vite, React 18, TypeScript, and Tailwind CSS — a fast, type-safe, and beautiful stack.',
  },
  {
    id: '5',
    title: "What's Next?",
    content:
      'Future versions will add slide editing, themes, canvas rendering, and export to PDF and PowerPoint. Stay tuned!',
  },
];
