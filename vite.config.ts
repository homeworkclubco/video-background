import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'VideoBackground',
      formats: ['es', 'umd'],
      fileName: (format) => `video-background.${format}.js`,
    },
  },
  plugins: [
    dts({ rollupTypes: true }),
  ],
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.ts'],
  },
});
