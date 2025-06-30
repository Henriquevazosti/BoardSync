import React, { useState, useEffect, useRef, memo } from 'react';
import { usePerformanceTracker } from '../../hooks/performanceTracker';
import './PerformanceDashboard.css';

const PerformanceDashboard = memo(({ isVisible = false, onClose }) => {
  const { performanceData } = usePerformanceTracker('App');
  const [isMinimized, setIsMinimized] = useState(false);
  const [history, setHistory] = useState([]);
  const maxHistoryLength = 50;

  // Atualizar histórico de performance
  useEffect(() => {
    if (performanceData.renderCount > 0) {
      setHistory(prev => {
        const newEntry = {
          timestamp: Date.now(),
          ...performanceData
        };
        
        const newHistory = [...prev, newEntry];
        return newHistory.length > maxHistoryLength 
          ? newHistory.slice(-maxHistoryLength)
          : newHistory;
      });
    }
  }, [performanceData]);

  // Calcular estatísticas
  const stats = React.useMemo(() => {
    if (history.length === 0) return null;

    const renderTimes = history.map(h => h.lastRenderTime).filter(t => t > 0);
    const fpsList = history.map(h => h.fps).filter(f => f > 0);

    return {
      avgRenderTime: renderTimes.length > 0 
        ? (renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length).toFixed(2)
        : 0,
      maxRenderTime: renderTimes.length > 0 ? Math.max(...renderTimes).toFixed(2) : 0,
      avgFPS: fpsList.length > 0 
        ? Math.round(fpsList.reduce((a, b) => a + b, 0) / fpsList.length)
        : 0,
      slowRenders: renderTimes.filter(t => t > 16).length
    };
  }, [history]);

  // Status da performance
  const getPerformanceStatus = () => {
    if (!stats) return 'unknown';
    
    if (stats.avgFPS >= 55 && stats.avgRenderTime < 10) return 'excellent';
    if (stats.avgFPS >= 45 && stats.avgRenderTime < 16) return 'good';
    if (stats.avgFPS >= 30 && stats.avgRenderTime < 33) return 'fair';
    return 'poor';
  };

  const performanceStatus = getPerformanceStatus();

  if (!isVisible) return null;

  return (
    <div className={`performance-dashboard ${isMinimized ? 'minimized' : ''}`}>
      <div className="dashboard-header">
        <div className="dashboard-title">
          <span className={`status-indicator ${performanceStatus}`}></span>
          Performance Monitor
        </div>
        <div className="dashboard-controls">
          <button 
            className="minimize-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Expandir' : 'Minimizar'}
          >
            {isMinimized ? '📊' : '📉'}
          </button>
          <button 
            className="close-btn"
            onClick={onClose}
            title="Fechar"
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="dashboard-content">
          {/* Métricas em tempo real */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-value">{performanceData.fps}</div>
              <div className="metric-label">FPS</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-value">
                {performanceData.lastRenderTime.toFixed(1)}ms
              </div>
              <div className="metric-label">Último Render</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-value">{performanceData.renderCount}</div>
              <div className="metric-label">Total Renders</div>
            </div>
            
            {performanceData.memoryUsage && (
              <div className="metric-card">
                <div className="metric-value">
                  {performanceData.memoryUsage.used}MB
                </div>
                <div className="metric-label">Memória</div>
              </div>
            )}
          </div>

          {/* Estatísticas calculadas */}
          {stats && (
            <div className="stats-section">
              <h4>Estatísticas</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Render Médio:</span>
                  <span className={`stat-value ${stats.avgRenderTime > 16 ? 'warning' : 'good'}`}>
                    {stats.avgRenderTime}ms
                  </span>
                </div>
                
                <div className="stat-item">
                  <span className="stat-label">Render Máximo:</span>
                  <span className={`stat-value ${stats.maxRenderTime > 33 ? 'danger' : stats.maxRenderTime > 16 ? 'warning' : 'good'}`}>
                    {stats.maxRenderTime}ms
                  </span>
                </div>
                
                <div className="stat-item">
                  <span className="stat-label">FPS Médio:</span>
                  <span className={`stat-value ${stats.avgFPS < 30 ? 'danger' : stats.avgFPS < 45 ? 'warning' : 'good'}`}>
                    {stats.avgFPS}
                  </span>
                </div>
                
                <div className="stat-item">
                  <span className="stat-label">Renders Lentos:</span>
                  <span className={`stat-value ${stats.slowRenders > 10 ? 'danger' : stats.slowRenders > 5 ? 'warning' : 'good'}`}>
                    {stats.slowRenders}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Gráfico simples de FPS */}
          {history.length > 1 && (
            <div className="chart-section">
              <h4>FPS nos últimos renders</h4>
              <div className="simple-chart">
                {history.slice(-20).map((entry, index) => (
                  <div
                    key={index}
                    className="chart-bar"
                    style={{
                      height: `${Math.max(1, (entry.fps / 60) * 100)}%`,
                      backgroundColor: entry.fps >= 45 ? '#4CAF50' : entry.fps >= 30 ? '#FF9800' : '#F44336'
                    }}
                    title={`${entry.fps} FPS`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Alertas de performance */}
          {performanceData.isSlowRender && (
            <div className="performance-alert warning">
              ⚠️ Render lento detectado ({performanceData.lastRenderTime.toFixed(1)}ms)
            </div>
          )}

          {performanceData.memoryUsage && performanceData.memoryUsage.used > performanceData.memoryUsage.total * 0.8 && (
            <div className="performance-alert danger">
              🚨 Alto uso de memória ({performanceData.memoryUsage.used}MB)
            </div>
          )}
        </div>
      )}
    </div>
  );
});

PerformanceDashboard.displayName = 'PerformanceDashboard';

export default PerformanceDashboard;
