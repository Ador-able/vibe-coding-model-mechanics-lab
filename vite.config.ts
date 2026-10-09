import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  server: { host: '127.0.0.1', port: 4319, strictPort: true },
  preview: { host: '127.0.0.1', port: 4319, strictPort: true },
  build: {
    rolldownOptions: {
      input: {
        tokens: fileURLToPath(new URL('./index.html', import.meta.url)),
        vectors: fileURLToPath(new URL('./vectors.html', import.meta.url)),
        generation: fileURLToPath(new URL('./generation.html', import.meta.url)),
        attention: fileURLToPath(new URL('./attention.html', import.meta.url)),
        sampling: fileURLToPath(new URL('./sampling.html', import.meta.url)),
      },
    },
  },
});
