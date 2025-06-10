/**
 * Advanced accessibility service with live announcements and keyboard navigation
 */

export interface AccessibilitySettings {
  reduceMotion: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'xl';
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
}

export type AnnouncementPriority = 'polite' | 'assertive' | 'off';

class AccessibilityService {
  private liveRegion: HTMLElement | null = null;
  private settings: AccessibilitySettings;
  private focusHistory: HTMLElement[] = [];
  private keyboardNavigationMap: Map<string, () => void> = new Map();

  constructor() {
    this.settings = this.getStoredSettings();
    this.init();
  }

  /**
   * Initialize accessibility service
   */
  private init(): void {
    if (typeof window === 'undefined') return;

    this.createLiveRegion();
    this.setupKeyboardNavigation();
    this.applySettings();
    this.detectPreferences();
  }

  /**
   * Create ARIA live region for announcements
   */
  private createLiveRegion(): void {
    if (!document.body) return;

    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.setAttribute('aria-relevant', 'text');
    this.liveRegion.style.position = 'absolute';
    this.liveRegion.style.left = '-10000px';
    this.liveRegion.style.width = '1px';
    this.liveRegion.style.height = '1px';
    this.liveRegion.style.overflow = 'hidden';
    
    document.body.appendChild(this.liveRegion);
  }

  /**
   * Announce message to screen readers
   */
  announce(message: string, priority: AnnouncementPriority = 'polite'): void {
    if (!this.liveRegion || !message.trim()) return;

    this.liveRegion.setAttribute('aria-live', priority);
    
    // Clear and set new message
    this.liveRegion.textContent = '';
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = message;
      }
    }, 10);
  }

  /**
   * Setup global keyboard navigation
   */
  private setupKeyboardNavigation(): void {
    document.addEventListener('keydown', this.handleGlobalKeydown.bind(this));
    
    // Common keyboard shortcuts
    this.keyboardNavigationMap.set('Alt+1', () => this.skipToMainContent());
    this.keyboardNavigationMap.set('Alt+2', () => this.skipToNavigation());
    this.keyboardNavigationMap.set('Escape', () => this.handleEscape());
    this.keyboardNavigationMap.set('F6', () => this.cycleFocusableRegions());
  }

  /**
   * Handle global keyboard events
   */
  private handleGlobalKeydown(event: KeyboardEvent): void {
    const key = this.getKeyCombo(event);
    const handler = this.keyboardNavigationMap.get(key);
    
    if (handler) {
      event.preventDefault();
      handler();
      return;
    }

    // Handle roving tabindex for complex widgets
    if (event.target instanceof HTMLElement) {
      this.handleRovingTabindex(event);
    }
  }

  /**
   * Get keyboard combination string
   */
  private getKeyCombo(event: KeyboardEvent): string {
    const parts: string[] = [];
    
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');
    if (event.metaKey) parts.push('Meta');
    
    parts.push(event.key);
    
    return parts.join('+');
  }

  /**
   * Handle roving tabindex for keyboard navigation
   */
  private handleRovingTabindex(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const container = target.closest('[role="tablist"], [role="radiogroup"], [role="listbox"], [role="grid"]');
    
    if (!container) return;

    const items = Array.from(container.querySelectorAll('[role="tab"], [role="radio"], [role="option"], [role="gridcell"]')) as HTMLElement[];
    const currentIndex = items.indexOf(target);
    
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (currentIndex - 1 + items.length) % items.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = items.length - 1;
        break;
      default:
        return;
    }

    if (nextIndex !== currentIndex) {
      event.preventDefault();
      
      // Update tabindex
      items.forEach((item, index) => {
        item.setAttribute('tabindex', index === nextIndex ? '0' : '-1');
      });
      
      items[nextIndex].focus();
    }
  }

  /**
   * Skip to main content
   */
  private skipToMainContent(): void {
    const main = document.querySelector('main, [role="main"]') as HTMLElement;
    if (main) {
      main.focus();
      this.announce('Skipped to main content');
    }
  }

  /**
   * Skip to navigation
   */
  private skipToNavigation(): void {
    const nav = document.querySelector('nav, [role="navigation"]') as HTMLElement;
    if (nav) {
      nav.focus();
      this.announce('Skipped to navigation');
    }
  }

  /**
   * Handle escape key
   */
  private handleEscape(): void {
    // Close any open modals, dropdowns, etc.
    const openModal = document.querySelector('[role="dialog"][aria-hidden="false"]') as HTMLElement;
    if (openModal) {
      const closeButton = openModal.querySelector('[aria-label*="close"], [data-dismiss]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
      return;
    }

    // Return focus to previous element
    this.restoreFocus();
  }

  /**
   * Cycle through focusable regions
   */
  private cycleFocusableRegions(): void {
    const regions = Array.from(document.querySelectorAll('main, nav, aside, [role="region"], [role="complementary"]')) as HTMLElement[];
    const currentRegion = regions.find(region => region.contains(document.activeElement));
    
    if (currentRegion) {
      const currentIndex = regions.indexOf(currentRegion);
      const nextIndex = (currentIndex + 1) % regions.length;
      regions[nextIndex].focus();
      this.announce(`Moved to ${this.getRegionLabel(regions[nextIndex])}`);
    }
  }

  /**
   * Get accessible label for region
   */
  private getRegionLabel(region: HTMLElement): string {
    const label = region.getAttribute('aria-label') || 
                  region.getAttribute('aria-labelledby') ||
                  region.tagName.toLowerCase();
    return label;
  }

  /**
   * Store focus for later restoration
   */
  storeFocus(): void {
    if (document.activeElement instanceof HTMLElement) {
      this.focusHistory.push(document.activeElement);
    }
  }

  /**
   * Restore previously stored focus
   */
  restoreFocus(): void {
    const previousElement = this.focusHistory.pop();
    if (previousElement && document.contains(previousElement)) {
      previousElement.focus();
    }
  }

  /**
   * Trap focus within container
   */
  trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    
    if (focusableElements.length === 0) return () => {};

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }

  /**
   * Get all focusable elements within container
   */
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter(element => this.isVisible(element as HTMLElement)) as HTMLElement[];
  }

  /**
   * Check if element is visible
   */
  private isVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  }

  /**
   * Detect user preferences
   */
  private detectPreferences(): void {
    if (typeof window === 'undefined') return;

    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      this.settings.reduceMotion = true;
    }

    // Detect high contrast preference
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    if (prefersHighContrast) {
      this.settings.highContrast = true;
    }

    this.applySettings();
  }

  /**
   * Apply accessibility settings
   */
  private applySettings(): void {
    const root = document.documentElement;

    if (this.settings.reduceMotion) {
      root.classList.add('reduce-motion');
    }

    if (this.settings.highContrast) {
      root.classList.add('high-contrast');
    }

    if (this.settings.fontSize !== 'normal') {
      root.classList.add(`font-size-${this.settings.fontSize}`);
    }

    if (this.settings.screenReaderOptimized) {
      root.classList.add('screen-reader-optimized');
    }
  }

  /**
   * Get stored accessibility settings
   */
  private getStoredSettings(): AccessibilitySettings {
    try {
      const stored = localStorage.getItem('accessibility-settings');
      return stored ? JSON.parse(stored) : this.getDefaultSettings();
    } catch {
      return this.getDefaultSettings();
    }
  }

  /**
   * Get default accessibility settings
   */
  private getDefaultSettings(): AccessibilitySettings {
    return {
      reduceMotion: false,
      highContrast: false,
      fontSize: 'normal',
      screenReaderOptimized: false,
      keyboardNavigation: true,
    };
  }

  /**
   * Update accessibility settings
   */
  updateSettings(newSettings: Partial<AccessibilitySettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    
    try {
      localStorage.setItem('accessibility-settings', JSON.stringify(this.settings));
    } catch {
      console.warn('Failed to save accessibility settings');
    }

    this.applySettings();
  }

  /**
   * Get current settings
   */
  getSettings(): AccessibilitySettings {
    return { ...this.settings };
  }

  /**
   * Create accessible description for complex widgets
   */
  createDescription(element: HTMLElement, description: string): void {
    const descriptionId = `desc-${Math.random().toString(36).substr(2, 9)}`;
    
    const descElement = document.createElement('div');
    descElement.id = descriptionId;
    descElement.className = 'sr-only';
    descElement.textContent = description;
    
    element.parentNode?.insertBefore(descElement, element.nextSibling);
    element.setAttribute('aria-describedby', descriptionId);
  }

  /**
   * Cleanup service
   */
  destroy(): void {
    if (this.liveRegion) {
      this.liveRegion.remove();
    }
    
    document.removeEventListener('keydown', this.handleGlobalKeydown);
  }
}

// Create singleton instance
export const accessibilityService = new AccessibilityService();

/**
 * React hook for accessibility service
 */
export function useAccessibility() {
  return {
    announce: accessibilityService.announce.bind(accessibilityService),
    storeFocus: accessibilityService.storeFocus.bind(accessibilityService),
    restoreFocus: accessibilityService.restoreFocus.bind(accessibilityService),
    trapFocus: accessibilityService.trapFocus.bind(accessibilityService),
    getFocusableElements: accessibilityService.getFocusableElements.bind(accessibilityService),
    updateSettings: accessibilityService.updateSettings.bind(accessibilityService),
    getSettings: accessibilityService.getSettings.bind(accessibilityService),
    createDescription: accessibilityService.createDescription.bind(accessibilityService),
  };
}
