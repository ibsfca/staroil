/**
 * MSW Browser Setup
 * Initializes Mock Service Worker for development/demo
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

/**
 * Enable/disable mock mode
 * Set via: localStorage.setItem('MOCK_MODE', 'true');
 */
export function isMockModeEnabled(): boolean {
  const mockMode = localStorage.getItem('MOCK_MODE');
  return mockMode === 'true';
}

export function enableMockMode() {
  localStorage.setItem('MOCK_MODE', 'true');
  console.log('✅ Mock mode ENABLED - restart app to take effect');
}

export function disableMockMode() {
  localStorage.removeItem('MOCK_MODE');
  console.log('❌ Mock mode DISABLED - restart app to take effect');
}

export function toggleMockMode() {
  if (isMockModeEnabled()) {
    disableMockMode();
  } else {
    enableMockMode();
  }
}
