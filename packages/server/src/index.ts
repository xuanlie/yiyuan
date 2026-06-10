globalThis.__yiyuan = globalThis.__yiyuan || { getDB: () => { throw new Error("DB not ready yet"); }, printDBCreate: () => {}, printDBRead: () => {}, printDBUpdate: () => {}, printDBDelete: () => {} };
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { existsSync, readFileSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { JsonAdapter } from './db/json-adapter';
import type { DatabaseAdapter } from './db/types';

let _db: DatabaseAdapter | null = null;
export function getDB() { if (!_db) throw new Error('DB not initialized'); return _db; }
export function printDBCreate(m: string, d: any) { console.log(`📝 [DB] Create ${m}:`, d); }
export function printDBRead(m: string, q: any) { console.log(`📖 [DB] Read ${m}:`, q); }
export function printDBUpdate(m: string, q: any, d: any) { console.log(`🔄 [DB] Update ${m}:`, q, d); }
export function printDBDelete(m: string, q: any) { console.log(`🗑️  [DB] Delete ${m}:`, q); }

const MIME: Record<string, string> = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json' };

export async function startServer(options: {
  port?: number;
  dbPath?: string;
  outDir?: string;
  provider?: string;
  middlewares?: string[];
}) {
  const { port = 3456, dbPath = '.yiyuan/data', outDir = '.yiyuan', provider = 'json', middlewares = [] } = options;

  // Set up DB adapter first
  switch (provider) {
    case 'json': _db = new JsonAdapter(dbPath); console.log('🗄️  适配器: json'); break;
    case 'sqlite': { const { SQLiteAdapter } = await import('./db/sqlite-adapter'); _db = new SQLiteAdapter(dbPath); break; }
    case 'postgres': { const { PostgresAdapter } = await import('./db/pg-adapter'); _db = new PostgresAdapter(dbPath); break; }
    case 'mysql': { const { MysqlAdapter } = await import('./db/mysql-adapter'); _db = new MysqlAdapter(dbPath); break; }
    case 'mongodb': { const { MongoAdapter } = await import('./db/mongo-adapter'); _db = new MongoAdapter(dbPath); break; }
    case 'redis': { const { RedisAdapter } = await import('./db/redis-adapter'); _db = new RedisAdapter(dbPath); break; }
    default: _db = new JsonAdapter(dbPath);
  }

  // Expose DB functions on globalThis so generated handlers can use them
  // without needing @yiyuanjs/server in user's node_modules
  (globalThis as any).__yiyuan = { getDB: () => _db!, printDBCreate, printDBRead, printDBUpdate, printDBDelete };

  const routerPath = join(process.cwd(), outDir, 'router.ts');
  if (!existsSync(routerPath)) { console.error('❌ 未找到生成的路由文件'); process.exit(1); }
  const { createApp } = await import(routerPath);

  const apiApp = createApp();
  const mainApp = new Hono();

  // 登录路由
  mainApp.post('/api/login', async (c) => {
    const { username, password } = await c.req.json();
    if (username === 'admin' && password === 'admin') {
      return c.json({ token: 'yiyuan-demo-token' });
    }
    return c.json({ error: 'Invalid credentials' }, 401);
  });

  // Swagger UI
  mainApp.get('/api/docs', (c) => c.html(`<!DOCTYPE html>
<html>
<head>
  <title>API Docs - Swagger</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>SwaggerUIBundle({url:'/openapi.json',dom_id:'#swagger-ui'})</script>
</body>
</html>`));

  // Static dashboard, guide, etc.
  mainApp.get('/dashboard', (c) => {
    const p = join(process.cwd(), outDir, 'dashboard.html');
    return existsSync(p) ? c.html(readFileSync(p, 'utf-8')) : c.text('Not found', 404);
  });
  mainApp.get('/guide', (c) => {
    const p = join(process.cwd(), outDir, 'guide.html');
    return existsSync(p) ? c.html(readFileSync(p, 'utf-8')) : c.text('Not found', 404);
  });

  // Mount API routes
  mainApp.route('/', apiApp);

  // Serve static frontend files
  const frontendDir = join(process.cwd(), 'frontend');
  mainApp.get('*', async (c) => {
    const urlPath = new URL(c.req.url).pathname;
    const filePath = join(frontendDir, urlPath);
    if (existsSync(filePath)) {
      const ext = extname(filePath);
      const mime = MIME[ext] || 'application/octet-stream';
      return new Response(readFileSync(filePath), { headers: { 'Content-Type': mime } });
    }
    const indexPath = join(frontendDir, 'index.html');
    if (existsSync(indexPath)) {
      return c.html(readFileSync(indexPath, 'utf-8'));
    }
    return c.text('Not found', 404);
  });

  // WebSocket support for live reload
  const server = serve({ fetch: mainApp.fetch, port });

  // Broadcast function for data changes
  (globalThis as any).broadcast = (event: string, data: any) => {
    // WebSocket broadcast placeholder
  };

  console.log(`🚀 服务已启动: http://localhost:${port}`);
}
