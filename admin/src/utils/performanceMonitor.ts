interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface PerformanceReport {
  totalDuration: number;
  metrics: PerformanceMetric[];
  slowestOperation: PerformanceMetric | null;
  averageDuration: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private completedMetrics: PerformanceMetric[] = [];
  private maxMetrics = 100; // Keep last 100 metrics

  start(name: string, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata
    };
    
    this.metrics.set(name, metric);
  }

  end(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    const completedMetric: PerformanceMetric = {
      ...metric,
      endTime,
      duration
    };

    // Move to completed metrics
    this.completedMetrics.push(completedMetric);
    this.metrics.delete(name);

    // Keep only the last N metrics
    if (this.completedMetrics.length > this.maxMetrics) {
      this.completedMetrics.shift();
    }

    // Log slow operations in development
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`, completedMetric);
    }

    return duration;
  }

  measure<T>(name: string, operation: () => T, metadata?: Record<string, any>): T {
    this.start(name, metadata);
    try {
      const result = operation();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  async measureAsync<T>(
    name: string, 
    operation: () => Promise<T>, 
    metadata?: Record<string, any>
  ): Promise<T> {
    this.start(name, metadata);
    try {
      const result = await operation();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  getReport(): PerformanceReport {
    const totalDuration = this.completedMetrics.reduce((sum, metric) => sum + (metric.duration || 0), 0);
    const averageDuration = this.completedMetrics.length > 0 ? totalDuration / this.completedMetrics.length : 0;
    
    const slowestOperation = this.completedMetrics.reduce((slowest, current) => {
      if (!slowest || (current.duration || 0) > (slowest.duration || 0)) {
        return current;
      }
      return slowest;
    }, null as PerformanceMetric | null);

    return {
      totalDuration,
      metrics: [...this.completedMetrics],
      slowestOperation,
      averageDuration
    };
  }

  getMetricsByName(name: string): PerformanceMetric[] {
    return this.completedMetrics.filter(metric => metric.name === name);
  }

  clear(): void {
    this.metrics.clear();
    this.completedMetrics = [];
  }

  // Get performance insights
  getInsights(): {
    slowOperations: PerformanceMetric[];
    frequentOperations: { name: string; count: number; averageDuration: number }[];
    recommendations: string[];
  } {
    const slowOperations = this.completedMetrics
      .filter(metric => (metric.duration || 0) > 500)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0));

    // Group by operation name
    const operationGroups = this.completedMetrics.reduce((groups, metric) => {
      if (!groups[metric.name]) {
        groups[metric.name] = [];
      }
      groups[metric.name].push(metric);
      return groups;
    }, {} as Record<string, PerformanceMetric[]>);

    const frequentOperations = Object.entries(operationGroups)
      .map(([name, metrics]) => ({
        name,
        count: metrics.length,
        averageDuration: metrics.reduce((sum, m) => sum + (m.duration || 0), 0) / metrics.length
      }))
      .sort((a, b) => b.count - a.count);

    const recommendations: string[] = [];

    // Generate recommendations
    if (slowOperations.length > 0) {
      recommendations.push(`Consider optimizing ${slowOperations[0].name} - it's taking ${slowOperations[0].duration?.toFixed(2)}ms on average`);
    }

    const apiCalls = frequentOperations.filter(op => op.name.includes('api') || op.name.includes('fetch'));
    if (apiCalls.length > 0 && apiCalls[0].count > 10) {
      recommendations.push('Consider implementing request caching or debouncing for frequent API calls');
    }

    if (frequentOperations.some(op => op.averageDuration > 200)) {
      recommendations.push('Some operations are consistently slow - consider performance optimization');
    }

    return {
      slowOperations,
      frequentOperations,
      recommendations
    };
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const start = (name: string, metadata?: Record<string, any>) => {
    performanceMonitor.start(name, metadata);
  };

  const end = (name: string) => {
    return performanceMonitor.end(name);
  };

  const measure = <T>(name: string, operation: () => T, metadata?: Record<string, any>) => {
    return performanceMonitor.measure(name, operation, metadata);
  };

  const measureAsync = <T>(
    name: string, 
    operation: () => Promise<T>, 
    metadata?: Record<string, any>
  ) => {
    return performanceMonitor.measureAsync(name, operation, metadata);
  };

  const getReport = () => {
    return performanceMonitor.getReport();
  };

  const getInsights = () => {
    return performanceMonitor.getInsights();
  };

  return {
    start,
    end,
    measure,
    measureAsync,
    getReport,
    getInsights
  };
}

// Performance decorator for class methods
export function performanceDecorator(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const metricName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      return performanceMonitor.measure(metricName, () => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}

// Web Vitals monitoring (if available)
export class WebVitalsMonitor {
  static init() {
    if (typeof window === 'undefined') return;

    // Monitor Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          if (lastEntry && lastEntry.startTime > 2500) {
            console.warn(`Slow LCP detected: ${lastEntry.startTime.toFixed(2)}ms`);
          }
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('Failed to initialize LCP monitoring:', error);
      }
    }

    // Monitor First Input Delay (FID)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.processingStart - entry.startTime > 100) {
              console.warn(`Slow FID detected: ${(entry.processingStart - entry.startTime).toFixed(2)}ms`);
            }
          });
        });
        
        observer.observe({ entryTypes: ['first-input'] });
      } catch (error) {
        console.warn('Failed to initialize FID monitoring:', error);
      }
    }
  }

  static measureCLS() {
    if (typeof window === 'undefined') return;

    let clsValue = 0;
    let clsEntries: any[] = [];

    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              clsEntries.push(entry);
            }
          });

          if (clsValue > 0.1) {
            console.warn(`High CLS detected: ${clsValue.toFixed(4)}`);
          }
        });

        observer.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('Failed to initialize CLS monitoring:', error);
      }
    }

    return () => clsValue;
  }
}