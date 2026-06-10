import * as fs from 'node:fs';
import * as path from 'node:path';

export async function add(type: string, name?: string) {
  if (type === 'middleware') {
    const midName = name || 'my-middleware';
    const dir = path.join(process.cwd(), 'middlewares');
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, `${midName}.ts`);
    const content = `import type { Hono } from 'hono';

export default function (app: Hono) {
  app.use('*', async (c, next) => {
    console.log('⚡ ${midName} middleware');
    await next();
  });
}
`;
    fs.writeFileSync(filePath, content);
    console.log(`✅ 中间件已创建: ${filePath}`);
    console.log(`   在 yiyuan.config.ts 中添加: middlewares: ['./middlewares/${midName}.ts']`);
  } else {
    console.log('❌ 未知类型。用法: yiyuan add middleware [name]');
  }
}
