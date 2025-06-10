import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function for merging Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Create variant-based class names for components
 */
export function createVariantClasses<T extends Record<string, string>>(
  baseClasses: string,
  variants: T
) {
  return (variant: keyof T) => cn(baseClasses, variants[variant]);
}

/**
 * Conditional class application
 */
export function conditionalClass(
  condition: boolean,
  trueClass: string,
  falseClass: string = ''
) {
  return condition ? trueClass : falseClass;
}

/**
 * Size-based class generation
 */
export function sizeClasses(size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') {
  const sizeMap = {
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
    xl: 'text-xl px-8 py-4',
  };
  return sizeMap[size];
}

/**
 * Color variant classes
 */
export function colorVariantClasses(color: string, intensity: number = 500) {
  return {
    background: `bg-${color}-${intensity}`,
    text: `text-${color}-${intensity}`,
    border: `border-${color}-${intensity}`,
    ring: `ring-${color}-${intensity}`,
    hover: `hover:bg-${color}-${intensity + 100}`,
  };
}

/**
 * Responsive class builder
 */
export function responsiveClasses(classes: {
  base?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
}) {
  return cn(
    classes.base,
    classes.sm && `sm:${classes.sm}`,
    classes.md && `md:${classes.md}`,
    classes.lg && `lg:${classes.lg}`,
    classes.xl && `xl:${classes.xl}`,
    classes['2xl'] && `2xl:${classes['2xl']}`
  );
}

/**
 * Focus-visible classes for accessibility
 */
export function focusClasses(color: string = 'blue') {
  return `focus:outline-none focus-visible:ring-2 focus-visible:ring-${color}-500 focus-visible:ring-offset-2`;
}

/**
 * Disabled state classes
 */
export function disabledClasses() {
  return 'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';
}

/**
 * Animation classes
 */
export function animationClasses(animation: 'fade' | 'slide' | 'scale' | 'spin') {
  const animations = {
    fade: 'transition-opacity duration-200',
    slide: 'transition-transform duration-200',
    scale: 'transition-transform duration-200 hover:scale-105',
    spin: 'animate-spin',
  };
  return animations[animation];
}

/**
 * State-based classes
 */
export function stateClasses(state: 'default' | 'loading' | 'error' | 'success') {
  const states = {
    default: '',
    loading: 'opacity-50 pointer-events-none',
    error: 'border-red-300 text-red-600',
    success: 'border-green-300 text-green-600',
  };
  return states[state];
}
