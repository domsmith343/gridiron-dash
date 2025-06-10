/**
 * Image optimization utilities for sports assets
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
  blur?: boolean;
  blurRadius?: number;
}

/**
 * Generate optimized image URL
 */
export function getOptimizedImageUrl(
  src: string, 
  options: ImageOptimizationOptions = {}
): string {
  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    blur = false,
    blurRadius = 10
  } = options;

  // If it's an external URL, use a service like Cloudinary or return as-is
  if (src.startsWith('http')) {
    // For demo purposes, return original URL
    // In production, you'd integrate with an image service
    return src;
  }

  // Build query parameters
  const params = new URLSearchParams();
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  if (quality !== 80) params.append('q', quality.toString());
  if (format !== 'webp') params.append('f', format);
  if (blur) params.append('blur', blurRadius.toString());

  const queryString = params.toString();
  return queryString ? `${src}?${queryString}` : src;
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(
  src: string,
  breakpoints: number[] = [320, 640, 768, 1024, 1280, 1536]
): string {
  return breakpoints
    .map(width => `${getOptimizedImageUrl(src, { width })} ${width}w`)
    .join(', ');
}

/**
 * Generate sizes attribute based on breakpoints
 */
export function generateSizes(
  breakpointSizes: Record<number, string> = {
    320: '100vw',
    768: '50vw',
    1024: '33vw',
    1280: '25vw'
  }
): string {
  const sortedBreakpoints = Object.keys(breakpointSizes)
    .map(Number)
    .sort((a, b) => b - a);

  const mediaQueries = sortedBreakpoints
    .slice(0, -1)
    .map(bp => `(min-width: ${bp}px) ${breakpointSizes[bp]}`);

  const defaultSize = breakpointSizes[sortedBreakpoints[sortedBreakpoints.length - 1]];
  
  return [...mediaQueries, defaultSize].join(', ');
}

/**
 * Player avatar fallback generator
 */
export function getPlayerAvatarUrl(
  playerName: string,
  customUrl?: string,
  options: ImageOptimizationOptions = {}
): string {
  if (customUrl) {
    return getOptimizedImageUrl(customUrl, options);
  }

  // Generate initials for fallback
  const initials = playerName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase();

  // Use ui-avatars.com as fallback
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&size=${options.width || 128}`;
  
  return fallbackUrl;
}

/**
 * Team logo URL generator with fallbacks
 */
export function getTeamLogoUrl(
  teamCode: string,
  size: 'small' | 'medium' | 'large' = 'medium',
  options: ImageOptimizationOptions = {}
): string {
  const sizeMap = {
    small: 32,
    medium: 64,
    large: 128
  };

  const width = options.width || sizeMap[size];
  
  // In a real app, you'd have team logo assets
  // For now, return a placeholder
  const logoSrc = `/images/teams/${teamCode.toLowerCase()}-logo.png`;
  
  return getOptimizedImageUrl(logoSrc, { ...options, width });
}

/**
 * Lazy loading image component props generator
 */
export function getLazyImageProps(
  src: string,
  alt: string,
  options: ImageOptimizationOptions & {
    priority?: boolean;
    placeholder?: 'blur' | 'empty';
  } = {}
) {
  const {
    priority = false,
    placeholder = 'empty',
    blur = placeholder === 'blur',
    ...imageOptions
  } = options;

  return {
    src: getOptimizedImageUrl(src, imageOptions),
    alt,
    loading: priority ? 'eager' : 'lazy' as const,
    srcSet: generateSrcSet(src),
    sizes: generateSizes(),
    style: blur ? { filter: 'blur(10px)' } : undefined,
    onLoad: blur ? (e: Event) => {
      const img = e.target as HTMLImageElement;
      img.style.filter = 'none';
    } : undefined,
  };
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, options: ImageOptimizationOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = getOptimizedImageUrl(src, options);
  });
}

/**
 * Preload multiple images
 */
export async function preloadImages(
  sources: Array<{ src: string; options?: ImageOptimizationOptions }>
): Promise<void> {
  const promises = sources.map(({ src, options }) => preloadImage(src, options));
  await Promise.all(promises);
}

/**
 * Check if browser supports WebP format
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

/**
 * Get optimal image format based on browser support
 */
export async function getOptimalFormat(): Promise<'webp' | 'jpg'> {
  try {
    const webpSupported = await supportsWebP();
    return webpSupported ? 'webp' : 'jpg';
  } catch {
    return 'jpg';
  }
}
