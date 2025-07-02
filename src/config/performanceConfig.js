/**
 * 🚀 BoardSync Performance Configuration
 * 
 * Este arquivo centraliza todas as configurações de performance
 * implementadas no projeto BoardSync.
 */

// ⚡ Configurações de Virtualização
export const VIRTUALIZATION_CONFIG = {
  // Threshold para ativar virtualização automática
  CARD_THRESHOLD: 20,
  
  // Altura estimada de cada card (px)
  ITEM_HEIGHT: 120,
  
  // Altura máxima do container de virtualização (px)  
  CONTAINER_HEIGHT: 400,
  
  // Número de itens extras renderizados para scroll suave
  OVERSCAN: 5,
  
  // Buffer adicional para cálculos (px)
  BUFFER_SIZE: 50
};

// 🔄 Configurações de Debounce/Throttle
export const TIMING_CONFIG = {
  // Debounce para filtros (ms)
  FILTER_DEBOUNCE: 300,
  
  // Debounce para busca (ms)
  SEARCH_DEBOUNCE: 500,
  
  // Throttle para scroll (ms)
  SCROLL_THROTTLE: 100,
  
  // Throttle para resize (ms)
  RESIZE_THROTTLE: 150,
  
  // Debounce para auto-save (ms)
  AUTOSAVE_DEBOUNCE: 2000
};

// 📊 Configurações de Monitoramento
export const MONITORING_CONFIG = {
  // Thresholds de performance
  SLOW_RENDER_THRESHOLD: 16, // ms
  CRITICAL_RENDER_THRESHOLD: 33, // ms
  
  // FPS targets
  TARGET_FPS: 60,
  MINIMUM_FPS: 30,
  
  // Memory monitoring
  MEMORY_WARNING_THRESHOLD: 50 * 1024 * 1024, // 50MB
  MEMORY_CRITICAL_THRESHOLD: 100 * 1024 * 1024, // 100MB
  
  // Histórico de métricas
  METRICS_HISTORY_SIZE: 50,
  
  // Intervalos de limpeza (ms)
  CLEANUP_INTERVAL: 60000, // 1 minuto
  METRICS_UPDATE_INTERVAL: 1000 // 1 segundo
};

// 🎨 Configurações Visuais de Performance
export const UI_CONFIG = {
  // Cores dos indicadores de performance
  PERFORMANCE_COLORS: {
    excellent: '#4CAF50',
    good: '#8BC34A', 
    fair: '#FF9800',
    poor: '#F44336',
    unknown: '#9E9E9E'
  },
  
  // Animações
  ANIMATION_DURATION: 300, // ms
  
  // Dashboard
  DASHBOARD_WIDTH: 350, // px
  DASHBOARD_MAX_HEIGHT: '80vh',
  
  // Notificações
  NOTIFICATION_TIMEOUT: 60000, // 1 minuto
  NOTIFICATION_MAX_COUNT: 10
};

// 📦 Configurações de Code Splitting
export const CODE_SPLITTING_CONFIG = {
  // Componentes para lazy loading
  LAZY_COMPONENTS: [
    'NewCardModal',
    'CategoryFilter',
    'DueDateFilter', 
    'BlockCardModal',
    'LabelManager',
    'UserManager',
    'ThemeSelector',
    'ActivityLog',
    'CommentsModal',
    'CardDetailView',
    'TeamChat',
    'Register',
    'DataManager'
  ],
  
  // Timeout para loading fallback (ms)
  LOADING_TIMEOUT: 5000
};

// 🔧 Configurações de Otimização Automática
export const AUTO_OPTIMIZATION_CONFIG = {
  // Número de renders lentos consecutivos para ativar otimizações
  SLOW_RENDER_TRIGGER: 3,
  
  // Tempo mínimo entre otimizações automáticas (ms)
  OPTIMIZATION_COOLDOWN: 30000,
  
  // Features que podem ser desabilitadas automaticamente
  OPTIONAL_FEATURES: [
    'animations',
    'real-time-updates',
    'auto-refresh',
    'rich-text-editor'
  ]
};

// 🎯 Configurações de Análise
export const ANALYTICS_CONFIG = {
  // Eventos de performance para tracking
  TRACKED_EVENTS: [
    'component-mount',
    'component-unmount', 
    'slow-render',
    'memory-warning',
    'user-interaction'
  ],
  
  // Sampling rate (0-1)
  SAMPLING_RATE: 0.1, // 10% dos eventos
  
  // Batch size para envio
  BATCH_SIZE: 50
};

// 🚀 Atalhos de Teclado
export const KEYBOARD_SHORTCUTS = {
  PERFORMANCE_DASHBOARD: 'Ctrl+Shift+P',
  PERFORMANCE_NOTIFICATIONS: 'Ctrl+Shift+N',
  FORCE_OPTIMIZATION: 'Ctrl+Shift+O',
  CLEAR_CACHE: 'Ctrl+Shift+C',
  TOGGLE_DEBUG: 'Ctrl+Shift+D'
};

// 🔄 Configurações de Cache
export const CACHE_CONFIG = {
  // TTL para diferentes tipos de cache (ms)
  COMPONENT_CACHE_TTL: 5 * 60 * 1000, // 5 minutos
  DATA_CACHE_TTL: 10 * 60 * 1000, // 10 minutos
  IMAGE_CACHE_TTL: 60 * 60 * 1000, // 1 hora
  
  // Tamanho máximo do cache
  MAX_CACHE_SIZE: 100, // número de entradas
  
  // Estratégias de cache
  CACHE_STRATEGY: 'lru' // least recently used
};

// 📱 Configurações Responsivas
export const RESPONSIVE_CONFIG = {
  // Breakpoints
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  
  // Ajustes automáticos para mobile
  MOBILE_OPTIMIZATIONS: {
    virtualThreshold: 10, // Menor threshold para mobile
    debounceTime: 500,    // Maior debounce para economizar bateria
    animationsReduced: true
  }
};

// 🛡️ Configurações de Fallback
export const FALLBACK_CONFIG = {
  // Valores padrão para quando dados estão indisponíveis
  DEFAULT_CARDS: [],
  DEFAULT_COLUMNS: {},
  DEFAULT_USERS: {},
  DEFAULT_LABELS: {},
  
  // Mensagens de erro amigáveis
  ERROR_MESSAGES: {
    LOAD_FAILED: 'Não foi possível carregar os dados. Tentando novamente...',
    RENDER_ERROR: 'Ocorreu um erro na renderização. Recarregando componente...',
    MEMORY_WARNING: 'Alto uso de memória detectado. Otimizando automaticamente...'
  }
};

// 🎛️ Feature Flags para Performance
export const PERFORMANCE_FEATURES = {
  VIRTUAL_SCROLLING: true,
  COMPONENT_MEMOIZATION: true,
  CODE_SPLITTING: true,
  PERFORMANCE_MONITORING: true,
  AUTO_OPTIMIZATION: true,
  MEMORY_MONITORING: true,
  RENDER_TRACKING: true,
  
  // Features experimentais (podem ser desabilitadas)
  EXPERIMENTAL_FEATURES: {
    WEB_WORKERS: false,
    SERVICE_WORKERS: false,
    ADVANCED_CACHING: false,
    PREDICTIVE_LOADING: false
  }
};

// 📋 Template de Configuração Personalizada
export const createCustomConfig = (overrides = {}) => ({
  virtualization: { ...VIRTUALIZATION_CONFIG, ...overrides.virtualization },
  timing: { ...TIMING_CONFIG, ...overrides.timing },
  monitoring: { ...MONITORING_CONFIG, ...overrides.monitoring },
  ui: { ...UI_CONFIG, ...overrides.ui },
  cache: { ...CACHE_CONFIG, ...overrides.cache },
  features: { ...PERFORMANCE_FEATURES, ...overrides.features }
});

// 🚀 Configuração Padrão Exportada
export default {
  VIRTUALIZATION_CONFIG,
  TIMING_CONFIG,
  MONITORING_CONFIG,
  UI_CONFIG,
  CODE_SPLITTING_CONFIG,
  AUTO_OPTIMIZATION_CONFIG,
  ANALYTICS_CONFIG,
  KEYBOARD_SHORTCUTS,
  CACHE_CONFIG,
  RESPONSIVE_CONFIG,
  FALLBACK_CONFIG,
  PERFORMANCE_FEATURES,
  createCustomConfig
};
