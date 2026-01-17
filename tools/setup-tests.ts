import '@testing-library/jest-dom';

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = MockResizeObserver as typeof ResizeObserver;
