import { compile, loadConfig } from '@yiyuanjs/compiler';

export async function generate(schemaPath?: string, options?: { out?: string; backend?: string }) {
  const config = await loadConfig();
  const backend = options?.backend || config.backend || 'hono';
  const outDir = options?.out || config.outDir || '.yiyuan';
  const schema = schemaPath || 'schema.ts';
  await compile({ schemaPath: schema, outDir, backend }, config);
  console.log(`✅ 代码生成完成`);
}
