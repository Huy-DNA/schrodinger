import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'index',
      fileName: 'index',
      formats: ['cjs', 'es'],
    },
  },
  plugins: [
    dts(),
  ]
});
