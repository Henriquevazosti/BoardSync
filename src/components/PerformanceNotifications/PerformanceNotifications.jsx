import React, { useState, useEffect, memo } from 'react';
import { usePerformanceAnalyzer } from '../../hooks/performanceAnalyzer';
import './PerformanceNotifications.css';

const PerformanceNotifications = memo(({ isEnabled = true }) => {
  const [notifications, setNotifications] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  // Monitorar performance global
  const { performanceIssues } = usePerformanceAnalyzer('GlobalApp');

  // Atualizar notificações quando issues são detectados
  useEffect(() => {
    if (performanceIssues.length > 0 && isEnabled) {
      const newNotifications = performanceIssues.map(issue => ({
        id: `${issue.type}-${issue.timestamp}`,
        ...issue,
        read: false
      }));

      setNotifications(prev => {
        // Evitar duplicatas
        const existingIds = prev.map(n => n.id);
        const uniqueNew = newNotifications.filter(n => !existingIds.includes(n.id));
        
        if (uniqueNew.length > 0) {
          setIsVisible(true);
          return [...prev, ...uniqueNew];
        }
        
        return prev;
      });
    }
  }, [performanceIssues, isEnabled]);

  // Auto-hide notifications antigas
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setNotifications(prev => 
        prev.filter(notification => (now - notification.timestamp) < 60000) // Remove depois de 1 minuto
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Hide quando não há notificações
  useEffect(() => {
    if (notifications.length === 0) {
      setIsVisible(false);
    }
  }, [notifications.length]);

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const dismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const dismissAll = () => {
    setNotifications([]);
  };

  const getIcon = (type) => {
    const icons = {
      'slow-render': '🐌',
      'unnecessary-render': '🔄',
      'memory-leak': '🚨',
      'bundle-size': '📦',
      'large-resource': '📊',
      'many-resources': '📁'
    };
    return icons[type] || '⚠️';
  };

  const getSeverityClass = (severity) => {
    return `notification-${severity || 'info'}`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <div className="performance-notifications">
      <div className="notifications-header">
        <div className="notifications-title">
          <span className="notifications-icon">🔔</span>
          Performance Alerts
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>
        <div className="notifications-controls">
          <button 
            className="dismiss-all-btn"
            onClick={dismissAll}
            title="Dispensar todas"
          >
            🗑️
          </button>
          <button 
            className="toggle-btn"
            onClick={() => setIsVisible(false)}
            title="Fechar"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="notifications-list">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`notification ${getSeverityClass(notification.severity)} ${notification.read ? 'read' : 'unread'}`}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="notification-icon">
              {getIcon(notification.type)}
            </div>
            
            <div className="notification-content">
              <div className="notification-message">
                {notification.message}
              </div>
              
              {notification.data && (
                <div className="notification-details">
                  {notification.data.renderTime && (
                    <span>Tempo: {notification.data.renderTime.toFixed(2)}ms</span>
                  )}
                </div>
              )}
              
              <div className="notification-time">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </div>
            </div>

            <button
              className="dismiss-btn"
              onClick={(e) => {
                e.stopPropagation();
                dismissNotification(notification.id);
              }}
              title="Dispensar"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {notifications.length > 3 && (
        <div className="notifications-footer">
          <small>{notifications.length} alertas ativos</small>
        </div>
      )}
    </div>
  );
});

PerformanceNotifications.displayName = 'PerformanceNotifications';

export default PerformanceNotifications;
