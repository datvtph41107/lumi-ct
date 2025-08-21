import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: [
      'packages/**/test/**/*.{test,spec}.ts',
      'packages/**/?(*.)+(test|spec).ts'
    ],
    coverage: {
      enabled: false
    }
  }
});

