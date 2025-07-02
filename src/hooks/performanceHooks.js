import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Hook para debouncing
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook para throttling
export const useThrottle = (value, delay) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= delay) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, delay - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return throttledValue;
};

// Hook para previous value
export const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

// Hook para mounted state
export const useIsMounted = () => {
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  return isMountedRef;
};

// Hook para performance monitoring
export const usePerformanceMonitor = (componentName) => {
  const renderStartTime = useRef(Date.now());
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - renderStartTime.current;
    
    // Desabilitado temporariamente para evitar spam de logs
    // if (process.env.NODE_ENV === 'development') {
    //   console.log(`🔍 ${componentName} - Render #${renderCount.current} took ${renderTime}ms`);
    // }
    
    renderStartTime.current = Date.now();
  });

  return {
    renderCount: renderCount.current,
    startTimer: () => {
      renderStartTime.current = Date.now();
    }
  };
};

// Hook para memoização avançada
export const useDeepMemo = (factory, deps) => {
  const ref = useRef();
  const signalRef = useRef(0);

  if (!ref.current || deps.some((dep, index) => {
    const prevDep = ref.current.deps[index];
    return JSON.stringify(dep) !== JSON.stringify(prevDep);
  })) {
    ref.current = {
      deps,
      value: factory()
    };
    signalRef.current += 1;
  }

  return ref.current.value;
};

// Hook para otimizar arrays grandes
export const useOptimizedArray = (array, itemsPerChunk = 50) => {
  const [visibleChunks, setVisibleChunks] = useState(1);
  const [loading, setLoading] = useState(false);

  const chunkedArray = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < array.length; i += itemsPerChunk) {
      chunks.push(array.slice(i, i + itemsPerChunk));
    }
    return chunks;
  }, [array, itemsPerChunk]);

  const visibleItems = useMemo(() => {
    return chunkedArray.slice(0, visibleChunks).flat();
  }, [chunkedArray, visibleChunks]);

  const loadMore = useCallback(() => {
    if (visibleChunks < chunkedArray.length && !loading) {
      setLoading(true);
      // Simular async loading
      setTimeout(() => {
        setVisibleChunks(prev => prev + 1);
        setLoading(false);
      }, 100);
    }
  }, [visibleChunks, chunkedArray.length, loading]);

  const hasMore = visibleChunks < chunkedArray.length;

  return {
    visibleItems,
    loadMore,
    hasMore,
    loading,
    totalChunks: chunkedArray.length,
    currentChunk: visibleChunks
  };
};

// Hook para intersection observer (lazy loading)
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState(null);
  const elementRef = useRef();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      setEntry(entry);
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options]);

  return {
    ref: elementRef,
    isIntersecting,
    entry
  };
};

// Hook para local storage otimizado
export const useOptimizedLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erro ao ler localStorage para key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      // Debounce localStorage writes
      const timeoutId = setTimeout(() => {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }, 500);

      return () => clearTimeout(timeoutId);
    } catch (error) {
      console.error(`Erro ao salvar no localStorage para key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};
