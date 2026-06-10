import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  clean: true,
  dts: false,
  external: [
    // 外部 npm 包
    'pg',
    'mysql2/promise',
    'better-sqlite3',
    'mongodb',
    'redis',
    // 动态导入的本地适配器文件（保留运行时加载）
    './db/sqlite-adapter',
    './db/pg-adapter',
    './db/mysql-adapter',
    './db/mongo-adapter',
    './db/redis-adapter',
  ],
});
