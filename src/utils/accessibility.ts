/**
 * Accessibility utilities for improved user experience
 */

export interface AriaAttributes {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-selected'?: boolean;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean;
  'aria-live'?: 'off' | 'assertive' | 'polite';
  'aria-busy'?: boolean;
  role?: string;
}

/**
 * Generate ARIA attributes for screen readers
 */
export function generateAriaAttributes(config: {
  label?: string;
  labelledBy?: string;
  describedBy?: string;
  expanded?: boolean;
  hidden?: boolean;
  selected?: boolean;
  current?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean;
  live?: 'off' | 'assertive' | 'polite';
  busy?: boolean;
  role?: string;
}): AriaAttributes {
  const attrs: AriaAttributes = {};
  
  if (config.label) attrs['aria-label'] = config.label;
  if (config.labelledBy) attrs['aria-labelledby'] = config.labelledBy;
  if (config.describedBy) attrs['aria-describedby'] = config.describedBy;
  if (config.expanded !== undefined) attrs['aria-expanded'] = config.expanded;
  if (config.hidden !== undefined) attrs['aria-hidden'] = config.hidden;
  if (config.selected !== undefined) attrs['aria-selected'] = config.selected;
  if (config.current !== undefined) attrs['aria-current'] = config.current;
  if (config.live) attrs['aria-live'] = config.live;
  if (config.busy !== undefined) attrs['aria-busy'] = config.busy;
  if (config.role) attrs.role = config.role;
  
  return attrs;
}

/**
 * Create skip navigation link
 */
export function createSkipLink(targetId: string, text = 'Skip to main content') {
  return {
    href: `#${targetId}`,
    className: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-md z-50',
    children: text
  };
}

/**
 * Generate keyboard navigation handlers
 */
export function createKeyboardNavigation(config: {
  onEnter?: () => void;
  onSpace?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
}) {
  return (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        config.onEnter?.();
        break;
      case ' ':
        event.preventDefault();
        config.onSpace?.();
        break;
      case 'Escape':
        event.preventDefault();
        config.onEscape?.();
        break;
      case 'ArrowUp':
        event.preventDefault();
        config.onArrowUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        config.onArrowDown?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        config.onArrowLeft?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        config.onArrowRight?.();
        break;
      case 'Home':
        event.preventDefault();
        config.onHome?.();
        break;
      case 'End':
        event.preventDefault();
        config.onEnd?.();
        break;
    }
  };
}

/**
 * Announce screen reader messages
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  if (typeof document === 'undefined') return;
  
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Manage focus trap for modals and dialogs
 */
export class FocusTrap {
  private container: HTMLElement;
  private previousFocus: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
  }

  activate() {
    this.previousFocus = document.activeElement as HTMLElement;
    this.updateFocusableElements();
    
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }
    
    document.addEventListener('keydown', this.handleKeyDown);
  }

  deactivate() {
    document.removeEventListener('keydown', this.handleKeyDown);
    
    if (this.previousFocus) {
      this.previousFocus.focus();
    }
  }

  private updateFocusableElements() {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');
    
    this.focusableElements = Array.from(
      this.container.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;
    
    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];
    
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  };
}

/**
 * Generate unique IDs for accessibility
 */
let idCounter = 0;
export function generateId(prefix = 'component'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Screen reader only styles
 */
export const srOnlyStyles = 'sr-only';
export const srOnlyFocusableStyles = 'sr-only focus:not-sr-only';
