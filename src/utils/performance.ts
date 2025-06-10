/**
 * Performance monitoring utilities for development and production
 */

interface PerformanceMark {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private marks: Map<string, PerformanceMark> = new Map();
  private enabled: boolean;

  constructor(enabled = process.env.NODE_ENV === 'development') {
    this.enabled = enabled;
  }

  /**
   * Start measuring performance for a specific operation
   */
  mark(name: string, metadata?: Record<string, any>): void {
    if (!this.enabled) return;

    const mark: PerformanceMark = {
      name,
      startTime: performance.now(),
      metadata
    };

    this.marks.set(name, mark);

    // Use browser Performance API if available
    if (typeof window !== 'undefined' && window.performance?.mark) {
      window.performance.mark(`${name}-start`);
    }
  }

  /**
   * End measuring and calculate duration
   */
  measure(name: string): number | null {
    if (!this.enabled) return null;

    const mark = this.marks.get(name);
    if (!mark) {
      console.warn(`Performance mark "${name}" not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - mark.startTime;

    mark.endTime = endTime;
    mark.duration = duration;

    // Use browser Performance API if available
    if (typeof window !== 'undefined' && window.performance?.measure) {
      try {
        window.performance.measure(name, `${name}-start`);
      } catch (e) {
        // Silently handle errors (mark might not exist)
      }
    }

    // Log slow operations
    if (duration > 100) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`, mark.metadata);
    }

    return duration;
  }

  /**
   * Get performance data for a specific mark
   */
  getPerformanceData(name: string): PerformanceMark | null {
    return this.marks.get(name) || null;
  }

  /**
   * Get all performance marks
   */
  getAllMarks(): PerformanceMark[] {
    return Array.from(this.marks.values());
  }

  /**
   * Clear all marks
   */
  clear(): void {
    this.marks.clear();
    
    if (typeof window !== 'undefined' && window.performance?.clearMarks) {
      window.performance.clearMarks();
      window.performance.clearMeasures();
    }
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const marks = this.getAllMarks().filter(mark => mark.duration !== undefined);
    
    if (marks.length === 0) {
      return 'No performance data available';
    }

    const totalTime = marks.reduce((sum, mark) => sum + (mark.duration || 0), 0);
    const avgTime = totalTime / marks.length;
    const slowestMark = marks.reduce((slowest, current) => 
      (current.duration || 0) > (slowest.duration || 0) ? current : slowest
    );

    return `
Performance Report:
==================
Total operations: ${marks.length}
Total time: ${totalTime.toFixed(2)}ms
Average time: ${avgTime.toFixed(2)}ms
Slowest operation: ${slowestMark.name} (${slowestMark.duration?.toFixed(2)}ms)

Operations:
${marks.map(mark => `  - ${mark.name}: ${mark.duration?.toFixed(2)}ms`).join('\n')}
    `.trim();
  }
}

// Create global instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * HOC for measuring component render performance
 */
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const PerformanceWrappedComponent = (props: P) => {
    React.useEffect(() => {
      performanceMonitor.mark(`${displayName}-mount`);
      return () => {
        performanceMonitor.measure(`${displayName}-mount`);
      };
    }, []);

    React.useEffect(() => {
      performanceMonitor.mark(`${displayName}-render`);
      performanceMonitor.measure(`${displayName}-render`);
    });

    return React.createElement(WrappedComponent, props);
  };

  PerformanceWrappedComponent.displayName = `withPerformanceMonitoring(${displayName})`;
  
  return PerformanceWrappedComponent;
}

/**
 * Hook for measuring render performance
 */
export function usePerformanceMonitoring(componentName: string, dependencies?: React.DependencyList) {
  React.useEffect(() => {
    performanceMonitor.mark(`${componentName}-mount`);
    return () => {
      performanceMonitor.measure(`${componentName}-mount`);
    };
  }, [componentName]);

  React.useEffect(() => {
    performanceMonitor.mark(`${componentName}-render`);
    performanceMonitor.measure(`${componentName}-render`);
  }, dependencies);
}

/**
 * Decorator for measuring function execution time
 */
export function measurePerformance(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const methodName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      performanceMonitor.mark(methodName);
      try {
        const result = originalMethod.apply(this, args);
        
        // Handle async functions
        if (result && typeof result.then === 'function') {
          return result.finally(() => {
            performanceMonitor.measure(methodName);
          });
        }
        
        performanceMonitor.measure(methodName);
        return result;
      } catch (error) {
        performanceMonitor.measure(methodName);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Measure async function performance
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  performanceMonitor.mark(name, metadata);
  try {
    const result = await fn();
    performanceMonitor.measure(name);
    return result;
  } catch (error) {
    performanceMonitor.measure(name);
    throw error;
  }
}

/**
 * Measure synchronous function performance
 */
export function measureSync<T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, any>
): T {
  performanceMonitor.mark(name, metadata);
  try {
    const result = fn();
    performanceMonitor.measure(name);
    return result;
  } catch (error) {
    performanceMonitor.measure(name);
    throw error;
  }
}

/**
 * Web Vitals monitoring
 */
export function initWebVitals() {
  if (typeof window === 'undefined') return;

  // Monitor Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        
        if (lastEntry) {
          console.log('LCP:', lastEntry.startTime);
          performanceMonitor.mark('LCP', { value: lastEntry.startTime });
        }
      });
      
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      // Monitor First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = (entry as any).processingStart - entry.startTime;
          console.log('FID:', fid);
          performanceMonitor.mark('FID', { value: fid });
        }
      });
      
      fidObserver.observe({ type: 'first-input', buffered: true });

      // Monitor Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        console.log('CLS:', clsValue);
        performanceMonitor.mark('CLS', { value: clsValue });
      });
      
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.warn('Web Vitals monitoring failed:', e);
    }
  }
}

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  // Initialize after page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWebVitals);
  } else {
    initWebVitals();
  }
}
