import { useState, useEffect, useRef, useCallback } from 'react';

// Hook para monitoramento de performance em tempo real
export const usePerformanceTracker = (componentName = 'Component') => {
  const [performanceData, setPerformanceData] = useState({
    renderCount: 0,
    averageRenderTime: 0,
    lastRenderTime: 0,
    memoryUsage: null,
    fps: 0,
    isSlowRender: false
  });

  const renderStartTime = useRef(null);
  const renderTimes = useRef([]);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  // Iniciar medição de render
  const startRender = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  // Finalizar medição de render
  const endRender = useCallback(() => {
    if (renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current;
      renderTimes.current.push(renderTime);
      
      // Manter apenas os últimos 10 renders para média
      if (renderTimes.current.length > 10) {
        renderTimes.current.shift();
      }

      const averageTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
      const isSlowRender = renderTime > 16; // Mais de 16ms é considerado lento (60fps)

      setPerformanceData(prev => ({
        ...prev,
        renderCount: prev.renderCount + 1,
        averageRenderTime: averageTime,
        lastRenderTime: renderTime,
        isSlowRender
      }));

      // Log para renders lentos
      if (isSlowRender) {
        console.warn(`🐌 ${componentName}: Render lento detectado (${renderTime.toFixed(2)}ms)`);
      }

      renderStartTime.current = null;
    }
  }, [componentName]);

  // Calcular FPS
  useEffect(() => {
    let animationId;

    const calculateFPS = () => {
      frameCount.current++;
      const now = performance.now();
      
      if (now >= lastTime.current + 1000) {
        const fps = Math.round((frameCount.current * 1000) / (now - lastTime.current));
        
        setPerformanceData(prev => ({
          ...prev,
          fps
        }));

        frameCount.current = 0;
        lastTime.current = now;
      }

      animationId = requestAnimationFrame(calculateFPS);
    };

    animationId = requestAnimationFrame(calculateFPS);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  // Monitorar uso de memória (se disponível)
  useEffect(() => {
    const updateMemoryUsage = () => {
      if (performance.memory) {
        setPerformanceData(prev => ({
          ...prev,
          memoryUsage: {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
          }
        }));
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000); // A cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  return {
    performanceData,
    startRender,
    endRender
  };
};

// Hook para detectar renders desnecessários
export const useRenderTracker = (componentName, props = {}) => {
  const renderCount = useRef(0);
  const previousProps = useRef(props);

  renderCount.current++;

  useEffect(() => {
    const changedProps = Object.keys(props).filter(
      key => props[key] !== previousProps.current[key]
    );

    if (changedProps.length > 0) {
      console.log(`🔄 ${componentName} re-renderizou (${renderCount.current}):`, {
        changedProps,
        newValues: changedProps.reduce((acc, key) => {
          acc[key] = props[key];
          return acc;
        }, {}),
        oldValues: changedProps.reduce((acc, key) => {
          acc[key] = previousProps.current[key];
          return acc;
        }, {})
      });
    } else if (renderCount.current > 1) {
      console.warn(`⚠️ ${componentName}: Re-render sem mudança de props detectado!`);
    }

    previousProps.current = props;
  });

  return renderCount.current;
};

// Hook para medir performance de operações
export const useOperationTimer = () => {
  const timers = useRef(new Map());

  const startTimer = useCallback((operationName) => {
    timers.current.set(operationName, performance.now());
  }, []);

  const endTimer = useCallback((operationName, shouldLog = true) => {
    const startTime = timers.current.get(operationName);
    if (startTime) {
      const duration = performance.now() - startTime;
      timers.current.delete(operationName);
      
      if (shouldLog) {
        if (duration > 100) {
          console.warn(`🐌 Operação lenta: ${operationName} levou ${duration.toFixed(2)}ms`);
        } else {
          console.log(`⚡ ${operationName}: ${duration.toFixed(2)}ms`);
        }
      }
      
      return duration;
    }
    return null;
  }, []);

  return { startTimer, endTimer };
};

// Hook para detectar vazamentos de memória
export const useMemoryLeakDetector = (componentName) => {
  const mountTime = useRef(performance.now());
  const initialMemory = useRef(null);

  useEffect(() => {
    if (performance.memory) {
      initialMemory.current = performance.memory.usedJSHeapSize;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (performance.memory && initialMemory.current) {
        const memoryDiff = performance.memory.usedJSHeapSize - initialMemory.current;
        const timeAlive = performance.now() - mountTime.current;
        
        if (memoryDiff > 5 * 1024 * 1024) { // 5MB de diferença
          console.warn(`🚨 Possível vazamento de memória em ${componentName}:`, {
            memoryIncrease: `${(memoryDiff / 1024 / 1024).toFixed(2)}MB`,
            timeAlive: `${(timeAlive / 1000).toFixed(2)}s`
          });
        }
      }
    };
  }, [componentName]);
};

// Hook para lazy loading com performance tracking
export const useLazyComponent = (importFunction, componentName) => {
  const [Component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadStartTime = useRef(null);

  useEffect(() => {
    loadStartTime.current = performance.now();
    
    importFunction()
      .then((module) => {
        const loadTime = performance.now() - loadStartTime.current;
        console.log(`📦 ${componentName} carregado em ${loadTime.toFixed(2)}ms`);
        
        setComponent(() => module.default || module);
        setLoading(false);
      })
      .catch((err) => {
        console.error(`❌ Erro ao carregar ${componentName}:`, err);
        setError(err);
        setLoading(false);
      });
  }, [importFunction, componentName]);

  return { Component, loading, error };
};

// Hook para debounce com performance tracking
export const usePerformanceDebounce = (callback, delay, operationName) => {
  const timeoutRef = useRef();
  const callCount = useRef(0);
  const lastExecution = useRef(0);

  return useCallback((...args) => {
    callCount.current++;
    
    clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      const now = performance.now();
      const timeSinceLastCall = now - lastExecution.current;
      
      console.log(`🎯 ${operationName}: Executado após ${callCount.current} chamadas (${timeSinceLastCall.toFixed(2)}ms desde última execução)`);
      
      callback(...args);
      lastExecution.current = now;
      callCount.current = 0;
    }, delay);
  }, [callback, delay, operationName]);
};
