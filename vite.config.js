import { defineConfig } from 'vite';

// Relative assets and hash navigation also work under a repository subdirectory.
// Относительные ресурсы и hash-навигация работают и в подпапке репозитория.
export default defineConfig({
  base: './',
  build: { target: 'es2022' },
  test: { include: ['src/tests/**/*.test.js'] },
});
