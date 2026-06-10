import type { ParsedSchema } from '@yiyuan/core';
import type { BackendGenerator, GeneratorOptions } from './backend';

function handlerCode(modelName: string): string {
  const lower = modelName.toLowerCase();
  return `import Router from '@koa/router';
import { getDB } from '../db';

const router = new Router({ prefix: '/${lower}s' });

router.post('/', async (ctx) => {
  const data = ctx.request.body;
  const result = await getDB().create('${lower}', data);
  ctx.status = 201;
  ctx.body = result;
});

router.get('/', async (ctx) => {
  const items = await getDB().findMany('${lower}');
  ctx.body = items;
});

router.get('/:id', async (ctx) => {
  const item = await getDB().findOne('${lower}', { id: ctx.params.id });
  if (!item) {
    ctx.status = 404;
    ctx.body = { error: 'Not found' };
    return;
  }
  ctx.body = item;
});

router.put('/:id', async (ctx) => {
  const data = ctx.request.body;
  const updated = await getDB().update('${lower}', { id: ctx.params.id }, data);
  ctx.body = updated;
});

router.delete('/:id', async (ctx) => {
  await getDB().delete('${lower}', { id: ctx.params.id });
  ctx.body = { success: true };
});

export default router;
`;
}

export class KoaBackend implements BackendGenerator {
  constructor(_opts?: GeneratorOptions) {}

  generate(schema: ParsedSchema): Record<string, string> {
    const files: Record<string, string> = {};

    for (const name of Object.keys(schema.models)) {
      const lower = name.toLowerCase();
      files[`handlers/${lower}.ts`] = handlerCode(name);
    }

    let routerContent = `import Router from '@koa/router';
`;
    for (const name of Object.keys(schema.models)) {
      const lower = name.toLowerCase();
      routerContent += `import ${lower}Routes from './handlers/${lower}';\n`;
    }
    routerContent += `\nconst router = new Router({ prefix: '/api' });\n`;
    for (const name of Object.keys(schema.models)) {
      const lower = name.toLowerCase();
      routerContent += `router.use(${lower}Routes.routes());\n`;
    }
    routerContent += `\nexport default router;\n`;
    files['router.ts'] = routerContent;

    files['db.ts'] = `let db: any;
export function setDB(database: any) { db = database; }
export function getDB() {
  if (!db) throw new Error('DB not initialized');
  return db;
}
`;

    files['app.ts'] = `import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import router from './router';
import { setDB } from './db';

const app = new Koa();
app.use(cors());
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 3456;
app.listen(PORT, () => {
  console.log(\`Koa server running on http://localhost:\${PORT}\`);
});
`;
    return files;
  }
}
