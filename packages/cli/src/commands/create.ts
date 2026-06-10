import { input, select, confirm } from '@inquirer/prompts';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { loadConfig, compile, generateFrontendProject } from '@yiyuanjs/compiler';

const BACKEND_DEPS: Record<string, Record<string, string>> = {
  hono:     { 'hono': '^4.12.0', '@hono/node-server': '^1.19.0' },
  express:  { 'express': '^4.21.0' },
  koa:      { 'koa': '^2.15.0' },
  fastify:  { 'fastify': '^5.0.0' },
  nestjs:   { '@nestjs/core': '^10.0.0', '@nestjs/common': '^10.0.0', 'reflect-metadata': '^0.2.0' },
  fastapi:  {},
  flask:    {},
  django:   {},
  gin:      {},
  fiber:    { 'gofiber/fiber/v2': '' },
  graphql:  { 'graphql': '^16.0.0', '@apollo/server': '^4.0.0' },
};

export async function create(cliName?: string) {
  const projectName = cliName || await input({ message: '项目名称:', default: 'my-yiyuan-app' });
  const backend = await select({ message: '后端框架:', choices: ['hono', 'express', 'koa', 'fastify', 'nestjs', 'fastapi', 'flask', 'django', 'gin', 'fiber', 'graphql'] });
  const datasource = await select({ message: '数据库:', choices: ['json', 'sqlite', 'postgres', 'mysql', 'mongodb', 'redis'] });
  const generateFrontend = await confirm({ message: '是否同时生成 React 前端项目（含登录、CRUD 页面）？', default: true });

  const dir = path.resolve(process.cwd(), projectName);
  fs.mkdirSync(dir, { recursive: true });

  const pkg: Record<string, any> = {
    name: projectName,
    version: '0.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'yiyuan dev',
      build: 'yiyuan generate',
    },
    dependencies: {
      ...BACKEND_DEPS[backend] || {},
    },
  };
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');

  const configContent = `export default {
  backend: '${backend}',
  datasource: { provider: '${datasource}', url: '.yiyuan/data' },
  server: { port: 3456 },
  outDir: '.yiyuan',
  frontend: 'vanilla',
  plugins: [],
};`;

  const schemaContent = `// 一元 Schema — 纯对象格式，无需外部依赖
export default {
  models: {
    User: {
      name: 'User',
      fields: {
        name: { type: 'string', required: true },
        email: { type: 'string', required: true },
      },
    },
  },
  rules: {},
};
`;

  fs.writeFileSync(path.join(dir, 'yiyuan.config.ts'), configContent);
  fs.writeFileSync(path.join(dir, 'schema.ts'), schemaContent);

  console.log(`✅ 项目已创建: ${projectName}`);

  if (generateFrontend) {
    const config = await loadConfig(path.join(dir, 'yiyuan.config.ts'));
    await compile({
      schemaPath: path.join(dir, 'schema.ts'),
      outDir: path.join(dir, '.yiyuan'),
      backend: config.backend || 'hono',
    }, config);

    const { default: schema } = await import(path.join(dir, 'schema.ts'));
    const frontFiles = generateFrontendProject(schema, config);
    const frontDir = path.join(dir, 'frontend');
    fs.mkdirSync(frontDir, { recursive: true });
    for (const [filePath, content] of Object.entries(frontFiles)) {
      const fullPath = path.join(frontDir, filePath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, content);
    }
    console.log(`✅ 前端项目已生成: frontend/`);
    console.log(`   启动方式: cd ${projectName}/frontend && npm install && npm run dev`);
  }

  // 提示安装依赖
  if (Object.keys(BACKEND_DEPS[backend] || {}).length > 0) {
    console.log(`\n📌 下一步: cd ${projectName} && npm install && yiyuan dev`);
  }
}
