import '@testing-library/jest-dom'

// Mock para localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock para sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock para window.matchMedia (usado pelos temas)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock para URL.createObjectURL (usado na exportação de dados)
global.URL.createObjectURL = vi.fn(() => 'mocked-url');
global.URL.revokeObjectURL = vi.fn();

// Mock para FileReader
global.FileReader = class MockFileReader {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this.result = null;
  }
  
  readAsText(file) {
    // Simular leitura assíncrona
    setTimeout(() => {
      if (this.onload) {
        this.result = file.content || '{}';
        this.onload({ target: { result: this.result } });
      }
    }, 0);
  }
};

// Configuração global para testes
beforeEach(() => {
  // Limpar todos os mocks antes de cada teste
  vi.clearAllMocks();
});
