// ── Slide Transition types ──

export type TransitionType =
  | 'none' | 'fade'
  | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down'
  | 'push-left' | 'push-right' | 'push-up' | 'push-down'
  | 'wipe-left' | 'wipe-right' | 'wipe-up' | 'wipe-down'
  | 'zoom-in' | 'zoom-out'
  | 'rotate'
  | 'flip-h' | 'flip-v'
  | 'cube' | 'curtain-open' | 'curtain-close';

export type EasingType = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';

export interface SlideTransition {
  type: TransitionType;
  duration: number; // seconds
  easing: EasingType;
}

export const DEFAULT_TRANSITION: SlideTransition = {
  type: 'none',
  duration: 0.5,
  easing: 'ease-in-out',
};

export const TRANSITION_OPTIONS: { value: TransitionType; label: string; group: string }[] = [
  { value: 'none', label: 'None', group: 'Basic' },
  { value: 'fade', label: 'Fade', group: 'Basic' },
  { value: 'slide-left', label: 'Slide Left', group: 'Slide' },
  { value: 'slide-right', label: 'Slide Right', group: 'Slide' },
  { value: 'slide-up', label: 'Slide Up', group: 'Slide' },
  { value: 'slide-down', label: 'Slide Down', group: 'Slide' },
  { value: 'push-left', label: 'Push Left', group: 'Push' },
  { value: 'push-right', label: 'Push Right', group: 'Push' },
  { value: 'push-up', label: 'Push Up', group: 'Push' },
  { value: 'push-down', label: 'Push Down', group: 'Push' },
  { value: 'wipe-left', label: 'Wipe Left', group: 'Wipe' },
  { value: 'wipe-right', label: 'Wipe Right', group: 'Wipe' },
  { value: 'wipe-up', label: 'Wipe Up', group: 'Wipe' },
  { value: 'wipe-down', label: 'Wipe Down', group: 'Wipe' },
  { value: 'zoom-in', label: 'Zoom In', group: 'Zoom' },
  { value: 'zoom-out', label: 'Zoom Out', group: 'Zoom' },
  { value: 'rotate', label: 'Rotate', group: 'Special' },
  { value: 'flip-h', label: 'Flip Horizontal', group: 'Special' },
  { value: 'flip-v', label: 'Flip Vertical', group: 'Special' },
  { value: 'cube', label: 'Cube', group: 'Special' },
  { value: 'curtain-open', label: 'Curtain Open', group: 'Special' },
  { value: 'curtain-close', label: 'Curtain Close', group: 'Special' },
];

export const EASING_OPTIONS: { value: EasingType; label: string; css: string }[] = [
  { value: 'linear', label: 'Linear', css: 'linear' },
  { value: 'ease-in', label: 'Ease In', css: 'cubic-bezier(0.4, 0, 1, 1)' },
  { value: 'ease-out', label: 'Ease Out', css: 'cubic-bezier(0, 0, 0.2, 1)' },
  { value: 'ease-in-out', label: 'Ease In-Out', css: 'cubic-bezier(0.4, 0, 0.2, 1)' },
];

// ── Object Animation types ──

export type AnimationCategory = 'entrance' | 'emphasis' | 'exit';
export type StartTrigger = 'onClick' | 'withPrevious' | 'afterPrevious' | 'auto';

export interface ObjectAnimation {
  id: string;
  type: AnimationCategory;
  effect: string;
  direction?: string;
  startTrigger: StartTrigger;
  delay: number;
  duration: number;
  easing: EasingType;
  repeat: number; // 0 = infinite loop
  order: number;
}

export interface SlideAnimations {
  [objectId: string]: ObjectAnimation[];
}

export const ENTRANCE_EFFECTS: { value: string; label: string; directions?: string[] }[] = [
  { value: 'fadeIn', label: 'Fade In' },
  { value: 'flyIn', label: 'Fly In', directions: ['left', 'right', 'top', 'bottom'] },
  { value: 'zoomIn', label: 'Zoom In' },
  { value: 'bounceIn', label: 'Bounce In' },
  { value: 'rotateIn', label: 'Rotate In' },
  { value: 'wipeIn', label: 'Wipe In', directions: ['left', 'right', 'top', 'bottom'] },
  { value: 'slideIn', label: 'Slide In', directions: ['left', 'right', 'top', 'bottom'] },
  { value: 'growIn', label: 'Grow In' },
];

export const EMPHASIS_EFFECTS: { value: string; label: string }[] = [
  { value: 'pulse', label: 'Pulse' },
  { value: 'shake', label: 'Shake' },
  { value: 'spin', label: 'Spin' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'colorFlash', label: 'Color Flash' },
  { value: 'growShrink', label: 'Grow/Shrink' },
  { value: 'teeter', label: 'Teeter' },
];

export const EXIT_EFFECTS: { value: string; label: string; directions?: string[] }[] = [
  { value: 'fadeOut', label: 'Fade Out' },
  { value: 'flyOut', label: 'Fly Out', directions: ['left', 'right', 'top', 'bottom'] },
  { value: 'zoomOut', label: 'Zoom Out' },
  { value: 'collapse', label: 'Collapse' },
  { value: 'rotateOut', label: 'Rotate Out' },
  { value: 'wipeOut', label: 'Wipe Out', directions: ['left', 'right', 'top', 'bottom'] },
  { value: 'slideOut', label: 'Slide Out', directions: ['left', 'right', 'top', 'bottom'] },
];

export function createObjectAnimation(
  type: AnimationCategory,
  effect: string,
  order: number,
  direction?: string,
): ObjectAnimation {
  return {
    id: crypto.randomUUID(),
    type,
    effect,
    direction,
    startTrigger: 'onClick',
    delay: 0,
    duration: 0.5,
    easing: 'ease-in-out',
    repeat: 1,
    order,
  };
}

// ── CSS keyframe generators for presentation mode ──

export function getTransitionStyles(
  transition: SlideTransition,
  phase: 'enter' | 'exit',
): React.CSSProperties {
  const dur = `${transition.duration}s`;
  const ease = EASING_OPTIONS.find(e => e.value === transition.easing)?.css ?? 'ease';
  const base: React.CSSProperties = {
    transition: `all ${dur} ${ease}`,
    position: 'absolute',
    inset: 0,
  };

  if (transition.type === 'none') return { ...base };

  if (transition.type === 'fade') {
    return { ...base, opacity: phase === 'enter' ? 1 : 0 };
  }

  const slideMap: Record<string, [string, string]> = {
    'slide-left': ['-100%,0', '100%,0'],
    'slide-right': ['100%,0', '-100%,0'],
    'slide-up': ['0,-100%', '0,100%'],
    'slide-down': ['0,100%', '0,-100%'],
    'push-left': ['-100%,0', '100%,0'],
    'push-right': ['100%,0', '-100%,0'],
    'push-up': ['0,-100%', '0,100%'],
    'push-down': ['0,100%', '0,-100%'],
  };

  if (slideMap[transition.type]) {
    const [, exitTo] = slideMap[transition.type];
    if (phase === 'enter') return { ...base, transform: 'translate(0,0)' };
    return { ...base, transform: `translate(${exitTo})` };
  }

  if (transition.type === 'zoom-in') {
    return { ...base, transform: phase === 'enter' ? 'scale(1)' : 'scale(0.3)', opacity: phase === 'enter' ? 1 : 0 };
  }
  if (transition.type === 'zoom-out') {
    return { ...base, transform: phase === 'enter' ? 'scale(1)' : 'scale(1.5)', opacity: phase === 'enter' ? 1 : 0 };
  }
  if (transition.type === 'rotate') {
    return { ...base, transform: phase === 'enter' ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0)', opacity: phase === 'enter' ? 1 : 0 };
  }
  if (transition.type === 'flip-h') {
    return { ...base, transform: phase === 'enter' ? 'rotateY(0deg)' : 'rotateY(90deg)', opacity: phase === 'enter' ? 1 : 0 };
  }
  if (transition.type === 'flip-v') {
    return { ...base, transform: phase === 'enter' ? 'rotateX(0deg)' : 'rotateX(90deg)', opacity: phase === 'enter' ? 1 : 0 };
  }

  // Wipe uses clip-path
  const wipeMap: Record<string, [string, string]> = {
    'wipe-left': ['inset(0 0 0 0)', 'inset(0 0 0 100%)'],
    'wipe-right': ['inset(0 0 0 0)', 'inset(0 100% 0 0)'],
    'wipe-up': ['inset(0 0 0 0)', 'inset(0 0 100% 0)'],
    'wipe-down': ['inset(0 0 0 0)', 'inset(100% 0 0 0)'],
  };
  if (wipeMap[transition.type]) {
    const [show, hide] = wipeMap[transition.type];
    return { ...base, clipPath: phase === 'enter' ? show : hide };
  }

  // Curtain & cube fallback to fade
  return { ...base, opacity: phase === 'enter' ? 1 : 0 };
}

export function getAnimationKeyframes(anim: ObjectAnimation): Keyframe[] {
  const dir = anim.direction ?? 'left';
  switch (anim.effect) {
    case 'fadeIn': return [{ opacity: 0 }, { opacity: 1 }];
    case 'fadeOut': return [{ opacity: 1 }, { opacity: 0 }];
    case 'flyIn': {
      const m: Record<string, string> = { left: '-120%,0', right: '120%,0', top: '0,-120%', bottom: '0,120%' };
      return [{ transform: `translate(${m[dir]})`, opacity: 0 }, { transform: 'translate(0,0)', opacity: 1 }];
    }
    case 'flyOut': {
      const m: Record<string, string> = { left: '-120%,0', right: '120%,0', top: '0,-120%', bottom: '0,120%' };
      return [{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${m[dir]})`, opacity: 0 }];
    }
    case 'zoomIn': return [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }];
    case 'zoomOut': return [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0)', opacity: 0 }];
    case 'bounceIn': return [
      { transform: 'scale(0)', opacity: 0, offset: 0 },
      { transform: 'scale(1.15)', opacity: 1, offset: 0.6 },
      { transform: 'scale(0.9)', offset: 0.8 },
      { transform: 'scale(1)', offset: 1 },
    ];
    case 'rotateIn': return [{ transform: 'rotate(-180deg) scale(0)', opacity: 0 }, { transform: 'rotate(0) scale(1)', opacity: 1 }];
    case 'rotateOut': return [{ transform: 'rotate(0) scale(1)', opacity: 1 }, { transform: 'rotate(180deg) scale(0)', opacity: 0 }];
    case 'growIn': return [{ transform: 'scale(0.3)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }];
    case 'slideIn': {
      const m: Record<string, string> = { left: '-100%,0', right: '100%,0', top: '0,-100%', bottom: '0,100%' };
      return [{ transform: `translate(${m[dir]})` }, { transform: 'translate(0,0)' }];
    }
    case 'slideOut': {
      const m: Record<string, string> = { left: '-100%,0', right: '100%,0', top: '0,-100%', bottom: '0,100%' };
      return [{ transform: 'translate(0,0)' }, { transform: `translate(${m[dir]})` }];
    }
    case 'wipeIn': return [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }];
    case 'wipeOut': return [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 0 100%)' }];
    case 'collapse': return [{ transform: 'scaleY(1)', opacity: 1 }, { transform: 'scaleY(0)', opacity: 0 }];
    // Emphasis
    case 'pulse': return [
      { transform: 'scale(1)', offset: 0 },
      { transform: 'scale(1.1)', offset: 0.5 },
      { transform: 'scale(1)', offset: 1 },
    ];
    case 'shake': return [
      { transform: 'translateX(0)', offset: 0 },
      { transform: 'translateX(-10px)', offset: 0.2 },
      { transform: 'translateX(10px)', offset: 0.4 },
      { transform: 'translateX(-10px)', offset: 0.6 },
      { transform: 'translateX(10px)', offset: 0.8 },
      { transform: 'translateX(0)', offset: 1 },
    ];
    case 'spin': return [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }];
    case 'bounce': return [
      { transform: 'translateY(0)', offset: 0 },
      { transform: 'translateY(-20px)', offset: 0.4 },
      { transform: 'translateY(0)', offset: 0.6 },
      { transform: 'translateY(-10px)', offset: 0.8 },
      { transform: 'translateY(0)', offset: 1 },
    ];
    case 'colorFlash': return [
      { filter: 'brightness(1)', offset: 0 },
      { filter: 'brightness(1.5) saturate(2)', offset: 0.5 },
      { filter: 'brightness(1)', offset: 1 },
    ];
    case 'growShrink': return [
      { transform: 'scale(1)', offset: 0 },
      { transform: 'scale(1.3)', offset: 0.5 },
      { transform: 'scale(1)', offset: 1 },
    ];
    case 'teeter': return [
      { transform: 'rotate(0deg)', offset: 0 },
      { transform: 'rotate(5deg)', offset: 0.25 },
      { transform: 'rotate(-5deg)', offset: 0.75 },
      { transform: 'rotate(0deg)', offset: 1 },
    ];
    default: return [{ opacity: 1 }, { opacity: 1 }];
  }
}
