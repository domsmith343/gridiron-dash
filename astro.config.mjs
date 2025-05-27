// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind()],
  vite: {
    plugins: [
      {
        name: 'pug',
        transform(code, id) {
          if (id.endsWith('.pug')) {
            return {
              code: `export default ${JSON.stringify(code)}`,
              map: null
            };
          }
        }
      }
    ]
  }
});
