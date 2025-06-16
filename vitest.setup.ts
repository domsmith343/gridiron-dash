// vitest.setup.ts
import { afterEach, vi } from 'vitest';
// If you plan to use React Testing Library, uncomment the following lines:
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest'; // for DOM-specific matchers

// Runs a cleanup function after each test case.
afterEach(() => {
  // If using React Testing Library, uncomment its cleanup function:
  cleanup();

  // Reset JSDOM's document state (head and body)
  if (typeof document !== 'undefined') {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  }

  // Clear all mocks to ensure test isolation
  vi.clearAllMocks();
});

// You can add other global setups here, for example:
// import * as matchers from '@testing-library/jest-dom/matchers'
// expect.extend(matchers) // if using @testing-library/jest-dom
