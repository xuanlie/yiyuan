import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  clean: true,
  dts: false,
  external: ['@yiyuanjs/compiler', '@yiyuanjs/server'],
});
