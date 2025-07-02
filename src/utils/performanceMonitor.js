// Performance monitoring utilities
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  // Marcar início de operação
  mark(name) {
    if (!this.isEnabled) return;
    
    performance.mark(`${name}-start`);
    this.metrics.set(name, {
      start: performance.now(),
      name
    });
  }

  // Medir fim de operação
  measure(name) {
    if (!this.isEnabled) return;
    
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`);
      return;
    }

    const end = performance.now();
    const duration = end - metric.start;
    
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    this.metrics.set(name, {
      ...metric,
      end,
      duration
    });

    console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  // Obter todas as métricas
  getMetrics() {
    return Array.from(this.metrics.values());
  }

  // Limpar métricas
  clear() {
    this.metrics.clear();
    performance.clearMarks();
    performance.clearMeasures();
  }

  // Monitorar renderização de componente
  monitorComponent(componentName, renderFunction) {
    if (!this.isEnabled) return renderFunction();
    
    this.mark(`render-${componentName}`);
    const result = renderFunction();
    this.measure(`render-${componentName}`);
    
    return result;
  }

  // Monitorar operações assíncronas
  async monitorAsync(operationName, asyncFunction) {
    if (!this.isEnabled) return await asyncFunction();
    
    this.mark(`async-${operationName}`);
    try {
      const result = await asyncFunction();
      this.measure(`async-${operationName}`);
      return result;
    } catch (error) {
      this.measure(`async-${operationName}`);
      throw error;
    }
  }

  // Detectar memory leaks
  checkMemoryUsage() {
    if (!this.isEnabled || !performance.memory) return;
    
    const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
    const usagePercent = (usedJSHeapSize / totalJSHeapSize) * 100;
    
    console.log(`🧠 Memory Usage: ${(usedJSHeapSize / 1024 / 1024).toFixed(2)}MB (${usagePercent.toFixed(1)}%)`);
    
    if (usagePercent > 80) {
      console.warn('⚠️ High memory usage detected!');
    }
    
    return { usedJSHeapSize, totalJSHeapSize, usagePercent };
  }

  // Analisar Core Web Vitals
  analyzeCoreWebVitals() {
    if (!this.isEnabled) return;
    
    // LCP (Largest Contentful Paint)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log(`🎨 LCP: ${lastEntry.startTime.toFixed(2)}ms`);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // FID (First Input Delay)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        console.log(`⚡ FID: ${entry.processingStart - entry.startTime}ms`);
      });
    }).observe({ entryTypes: ['first-input'] });

    // CLS (Cumulative Layout Shift)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          console.log(`📐 CLS: ${entry.value.toFixed(4)}`);
        }
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  // Relatório de performance
  generateReport() {
    if (!this.isEnabled) return null;
    
    const metrics = this.getMetrics();
    const memoryUsage = this.checkMemoryUsage();
    
    const report = {
      timestamp: new Date().toISOString(),
      metrics: metrics.map(m => ({
        name: m.name,
        duration: m.duration,
        category: m.name.includes('render') ? 'rendering' : 
                 m.name.includes('async') ? 'async' : 'other'
      })),
      memory: memoryUsage,
      slowOperations: metrics
        .filter(m => m.duration > 16) // > 16ms (60fps threshold)
        .sort((a, b) => b.duration - a.duration),
      recommendations: this.generateRecommendations(metrics)
    };
    
    console.log('📊 Performance Report:', report);
    return report;
  }

  // Gerar recomendações
  generateRecommendations(metrics) {
    const recommendations = [];
    
    // Renderizações lentas
    const slowRenders = metrics.filter(m => 
      m.name.includes('render') && m.duration > 16
    );
    
    if (slowRenders.length > 0) {
      recommendations.push({
        type: 'slow-rendering',
        message: `${slowRenders.length} componentes renderizando lentamente`,
        components: slowRenders.map(m => m.name),
        suggestion: 'Considere usar React.memo() ou otimizar re-renders'
      });
    }
    
    // Operações assíncronas lentas
    const slowAsync = metrics.filter(m => 
      m.name.includes('async') && m.duration > 100
    );
    
    if (slowAsync.length > 0) {
      recommendations.push({
        type: 'slow-async',
        message: `${slowAsync.length} operações assíncronas lentas`,
        operations: slowAsync.map(m => m.name),
        suggestion: 'Considere usar debouncing, caching ou paginação'
      });
    }
    
    return recommendations;
  }
}

// Instância global
export const performanceMonitor = new PerformanceMonitor();

// Hook React para monitoramento
export const usePerformanceMonitoring = (componentName) => {
  const renderStart = performance.now();
  
  React.useEffect(() => {
    const renderTime = performance.now() - renderStart;
    if (renderTime > 16) {
      console.warn(`🐌 Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  });
  
  return {
    mark: (name) => performanceMonitor.mark(`${componentName}-${name}`),
    measure: (name) => performanceMonitor.measure(`${componentName}-${name}`)
  };
};

// Decorator para funções
export const withPerformanceMonitoring = (name) => (target, propertyKey, descriptor) => {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args) {
    performanceMonitor.mark(`method-${name}`);
    const result = originalMethod.apply(this, args);
    performanceMonitor.measure(`method-${name}`);
    return result;
  };
  
  return descriptor;
};

// Utilitários de performance
export const performanceUtils = {
  // Simular scroll suave
  smoothScroll: (element, to, duration = 300) => {
    const start = element.scrollTop;
    const change = to - start;
    const startTime = performance.now();
    
    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeInOutQuad = progress < 0.5 
        ? 2 * progress * progress 
        : -1 + (4 - 2 * progress) * progress;
      
      element.scrollTop = start + change * easeInOutQuad;
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };
    
    requestAnimationFrame(animateScroll);
  },
  
  // Debounce otimizado
  debounce: (func, wait, immediate = false) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },
  
  // Throttle otimizado
  throttle: (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  // Lazy loading de imagens
  lazyLoadImage: (img, src) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        img.src = src;
        img.classList.add('loaded');
        resolve();
      };
      image.onerror = reject;
      image.src = src;
    });
  }
};

export default performanceMonitor;
