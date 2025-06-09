// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'; // Needed for testing React components

export default defineConfig({
  plugins: [
    react(), // Allows Vitest to process React components (JSX, etc.)
  ],
  test: {
    globals: true, // Use Vitest globals (describe, it, expect) without importing
    environment: 'jsdom', // Simulate a browser environment for tests
    setupFiles: './vitest.setup.ts', // Path to your global test setup file
    css: true, // Enable processing of CSS files imported in components
  },
});
