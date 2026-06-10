import { compile, loadConfig } from '@yiyuan/compiler';
import { startServer } from '@yiyuan/server';

const config = await loadConfig();
const backend = process.argv[2] || config.backend || 'hono';
const outDir = config.outDir || `.yiyuan-${backend}`;

await compile({ schemaPath: 'playground/schema.ts', outDir, backend }, config);

if (backend === 'hono') {
  const provider = config.datasource?.provider || 'json';
  const dbPath = config.datasource?.url || `${outDir}/data`;
  await startServer({
    port: config.server?.port || 3456,
    dbPath,
    outDir,
    provider,
  });
} else {
  console.log(`✅ 代码已生成到 ${outDir}，请用对应运行时启动`);
}
