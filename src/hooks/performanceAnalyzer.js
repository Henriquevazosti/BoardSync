import { useEffect, useRef, useCallback, useState } from 'react';

// Hook para detectar componentes com problemas de performance
export const usePerformanceAnalyzer = (componentName, initialProps = {}) => {
  const [performanceIssues, setPerformanceIssues] = useState([]);
  const renderCount = useRef(0);
  const renderTimes = useRef([]);
  const previousProps = useRef(initialProps);
  const mountTime = useRef(performance.now());
  
  // Detectar re-renders desnecessários
  const analyzeRender = useCallback((currentProps = {}) => {
    renderCount.current++;
    const renderStartTime = performance.now();
    
    // Analisar mudanças de props apenas se props foram fornecidas
    const propKeys = Object.keys(currentProps);
    const changedProps = propKeys.filter(
      key => currentProps[key] !== previousProps.current[key]
    );
    
    // Detectar re-render sem mudança de props (apenas se props foram fornecidas)
    if (renderCount.current > 1 && propKeys.length > 0 && changedProps.length === 0) {
      setPerformanceIssues(prev => {
        const newIssue = {
          type: 'unnecessary-render',
          message: `Re-render desnecessário detectado no ${componentName}`,
          timestamp: Date.now(),
          severity: 'warning'
        };
        
        // Evitar duplicatas recentes (últimos 5 segundos)
        const recent = prev.filter(issue => 
          issue.type === 'unnecessary-render' && 
          (Date.now() - issue.timestamp) < 5000
        );
        
        if (recent.length === 0) {
          return [...prev, newIssue];
        }
        return prev;
      });
    }
    
    // Medir tempo de render
    requestAnimationFrame(() => {
      const renderTime = performance.now() - renderStartTime;
      renderTimes.current.push(renderTime);
      
      // Manter apenas os últimos 10 renders
      if (renderTimes.current.length > 10) {
        renderTimes.current.shift();
      }
      
      // Detectar renders lentos
      if (renderTime > 16) {
        setPerformanceIssues(prev => {
          const newIssue = {
            type: 'slow-render',
            message: `Render lento detectado no ${componentName}: ${renderTime.toFixed(2)}ms`,
            timestamp: Date.now(),
            severity: renderTime > 33 ? 'error' : 'warning',
            data: { renderTime }
          };
          
          // Evitar spam de issues similares
          const recentSlow = prev.filter(issue => 
            issue.type === 'slow-render' && 
            (Date.now() - issue.timestamp) < 3000
          );
          
          if (recentSlow.length < 3) {
            return [...prev, newIssue];
          }
          return prev;
        });
      }
    });
    
    if (propKeys.length > 0) {
      previousProps.current = currentProps;
    }
  }, [componentName]);
  
  // Limpar issues antigos
  useEffect(() => {
    const cleanup = setInterval(() => {
      const oneMinuteAgo = Date.now() - 60000;
      setPerformanceIssues(prev => 
        prev.filter(issue => issue.timestamp > oneMinuteAgo)
      );
    }, 30000); // Limpar a cada 30 segundos
    
    return () => clearInterval(cleanup);
  }, []);
  
  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      if (performance.memory) {
        const componentLifetime = performance.now() - mountTime.current;
        
        // Alertar para componentes que ficaram muito tempo montados
        if (componentLifetime > 60000 && renderCount.current > 100) {
          console.warn(`🚨 Componente ${componentName} teve muitos re-renders:`, {
            lifetime: `${(componentLifetime / 1000).toFixed(2)}s`,
            renderCount: renderCount.current,
            avgRenderTime: renderTimes.current.length > 0 
              ? (renderTimes.current.reduce((a, b) => a + b) / renderTimes.current.length).toFixed(2) + 'ms'
              : 'N/A'
          });
        }
      }
    };
  }, [componentName]);
  
  return {
    performanceIssues,
    renderCount: renderCount.current,
    averageRenderTime: renderTimes.current.length > 0 
      ? renderTimes.current.reduce((a, b) => a + b) / renderTimes.current.length
      : 0,
    analyzeRender
  };
};

// Hook para otimizações automáticas
export const useAutoOptimization = (componentName, threshold = 16) => {
  const [shouldOptimize, setShouldOptimize] = useState(false);
  const consecutiveSlowRenders = useRef(0);
  const optimizationApplied = useRef(false);
  
  const reportRenderTime = useCallback((renderTime) => {
    if (renderTime > threshold) {
      consecutiveSlowRenders.current++;
      
      // Aplicar otimizações após 3 renders lentos consecutivos
      if (consecutiveSlowRenders.current >= 3 && !optimizationApplied.current) {
        setShouldOptimize(true);
        optimizationApplied.current = true;
        
        console.log(`🔧 Otimizações automáticas ativadas para ${componentName}`);
      }
    } else {
      consecutiveSlowRenders.current = 0;
    }
  }, [componentName, threshold]);
  
  return {
    shouldOptimize,
    reportRenderTime,
    resetOptimization: useCallback(() => {
      setShouldOptimize(false);
      optimizationApplied.current = false;
      consecutiveSlowRenders.current = 0;
    }, [])
  };
};

// Hook para monitoramento de bundle size
export const useBundleAnalyzer = () => {
  const [bundleInfo, setBundleInfo] = useState(null);
  
  useEffect(() => {
    // Analisar recursos carregados
    const analyzeBundle = () => {
      try {
        const resources = performance.getEntriesByType('resource');
        const jsResources = resources.filter(resource => 
          resource.name.includes('.js') || resource.name.includes('.jsx')
        );
        
        const totalSize = jsResources.reduce((total, resource) => {
          return total + (resource.transferSize || resource.encodedBodySize || 0);
        }, 0);
        
        const largestResources = jsResources
          .map(resource => ({
            name: resource.name.split('/').pop(),
            size: resource.transferSize || resource.encodedBodySize || 0,
            loadTime: resource.responseEnd - resource.requestStart
          }))
          .filter(resource => resource.size > 0)
          .sort((a, b) => b.size - a.size)
          .slice(0, 5);
        
        setBundleInfo({
          totalJSSize: Math.round(totalSize / 1024), // KB
          resourceCount: jsResources.length,
          largestResources,
          recommendations: generateRecommendations(totalSize, largestResources)
        });
      } catch (error) {
        console.warn('Erro ao analisar bundle:', error);
      }
    };
    
    // Aguardar carregamento completo
    if (document.readyState === 'complete') {
      analyzeBundle();
    } else {
      const handleLoad = () => analyzeBundle();
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);
  
  return bundleInfo;
};

// Gerar recomendações de otimização
const generateRecommendations = (totalSize, largestResources) => {
  const recommendations = [];
  
  try {
    // Bundle muito grande
    if (totalSize > 1024 * 1024) { // 1MB
      recommendations.push({
        type: 'bundle-size',
        message: 'Bundle JavaScript muito grande. Considere code splitting.',
        severity: 'warning'
      });
    }
    
    // Recursos individuais grandes
    largestResources.forEach(resource => {
      if (resource.size > 500 * 1024) { // 500KB
        recommendations.push({
          type: 'large-resource',
          message: `Arquivo ${resource.name} muito grande (${Math.round(resource.size / 1024)}KB)`,
          severity: 'warning'
        });
      }
    });
    
    // Muitos recursos
    if (largestResources.length > 10) {
      recommendations.push({
        type: 'many-resources',
        message: 'Muitos arquivos JavaScript. Considere bundling.',
        severity: 'info'
      });
    }
  } catch (error) {
    console.warn('Erro ao gerar recomendações:', error);
  }
  
  return recommendations;
};
