import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';

// Clear all mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});
