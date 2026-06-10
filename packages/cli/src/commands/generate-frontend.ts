import { loadConfig, compile, generateFrontendProject } from '@yiyuanjs/compiler';
import * as fs from 'node:fs';
import * as path from 'node:path';

export async function generateFrontend(schemaPath?: string) {
  const schema = schemaPath || 'schema.ts';
  const config = await loadConfig();
  await compile({ schemaPath: schema, outDir: '.yiyuan', backend: config.backend || 'hono' }, config);
  const { default: schemaModule } = await import(path.join(process.cwd(), schema));
  const files = generateFrontendProject(schemaModule, config);
  const dir = 'frontend';
  fs.mkdirSync(dir, { recursive: true });
  for (const [p, content] of Object.entries(files)) {
    const fullPath = path.join(dir, p);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
  }
  console.log(`✅ 前端项目已生成到 ${dir}/`);
  console.log('   安装依赖: cd frontend && npm install');
  console.log('   启动: npm run dev');
}
