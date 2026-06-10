import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { ParsedSchema, YiyuanConfig } from '@yiyuan/core';
import { HonoBackend } from './codegen/hono-backend';
import { ExpressBackend } from './codegen/express-backend';
import { KoaBackend } from './codegen/koa-backend';
import { FastifyBackend } from './codegen/fastify-backend';
import { NestJSBackend } from './codegen/nestjs-backend';
import { FastAPIBackend } from './codegen/fastapi-backend';
import { FlaskBackend } from './codegen/flask-backend';
import { DjangoBackend } from './codegen/django-backend';
import { GinBackend } from './codegen/gin-backend';
import { FiberBackend } from './codegen/fiber-backend';
import { GraphQLBackend } from './codegen/graphql-backend';
import { VanillaFrontend } from './codegen/vanilla-frontend';
import { ReactFrontend } from './codegen/react-frontend';
import { VueFrontend } from './codegen/vue-frontend';
import type { BackendGenerator } from './codegen/backend';
import type { FrontendGenerator } from './codegen/frontend-interface';
import { createJiti } from 'jiti';

export type { YiyuanConfig } from '@yiyuan/core';

const BACKENDS: Record<string, (options: { ui?: string }) => BackendGenerator> = {
  hono: (opts) => new HonoBackend(opts),
  express: (opts) => new ExpressBackend(opts),
  koa: (opts) => new KoaBackend(opts),
  fastify: (opts) => new FastifyBackend(opts),
  nestjs: (opts) => new NestJSBackend(opts),
  fastapi: (opts) => new FastAPIBackend(opts),
  flask: (opts) => new FlaskBackend(opts),
  django: (opts) => new DjangoBackend(opts),
  gin: (opts) => new GinBackend(opts),
  fiber: (opts) => new FiberBackend(opts),
  graphql: (opts) => new GraphQLBackend(opts),
};

const FRONTENDS: Record<string, () => FrontendGenerator> = {
  vanilla: () => new VanillaFrontend(),
  react: () => new ReactFrontend(),
  vue: () => new VueFrontend(),
};

export async function loadConfig(configPath?: string): Promise<YiyuanConfig> {
  const target = configPath || path.join(process.cwd(), 'yiyuan.config.ts');
  let config: YiyuanConfig = {};
  if (fs.existsSync(target)) {
    const jiti = createJiti(import.meta.url);
    const mod = jiti(target);
    config = (mod as any).default || {};
  }
  if (process.env.DATABASE_PROVIDER) config.datasource = { ...config.datasource, provider: process.env.DATABASE_PROVIDER as any };
  if (process.env.DATABASE_URL) config.datasource = { ...config.datasource, url: process.env.DATABASE_URL };
  if (process.env.PORT) config.server = { ...config.server, port: Number(process.env.PORT) };
  if (process.env.AUTH_SECRET) config.auth = { ...config.auth, secret: process.env.AUTH_SECRET };
  return config;
}

export interface CompileOptions {
  generatePage?: boolean;
  schemaPath: string;
  outDir?: string;
  backend?: string;
  frontend?: string;
  ui?: string;
  locale?: string;
  enableDocs?: boolean;
}

export async function compile(options: CompileOptions, config?: YiyuanConfig) {
  const merged = {
    backend: config?.backend || 'hono',
    outDir: config?.outDir || '.yiyuan',
    ui: config?.ui || 'modern',
    locale: config?.locale || 'zh',
    frontend: config?.frontend || 'vanilla',
    ...options,
  };

  const {
    schemaPath,
    outDir = '.yiyuan',
    backend = 'hono',
    frontend = 'vanilla',
    ui = 'modern',
    locale = 'zh',
  } = merged;

  const schemaFilePath = path.resolve(schemaPath);
  const jiti = createJiti(import.meta.url);
  const mod = jiti(schemaFilePath);
  const schema: ParsedSchema = (mod as any).default || mod.schema;

  // 生成后端代码
  const backFactory = BACKENDS[backend];
  if (!backFactory) throw new Error(`Unsupported backend: ${backend}`);
  const backGenerator = backFactory({ ui });
  const backendFiles = backGenerator.generate(schema, { locale });
  for (const [filePath, content] of Object.entries(backendFiles)) {
    const fullPath = path.join(outDir, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
  }
  console.log(`✅ 后端代码生成完成 (${backend})`);

  // 生成前端代码
  const frontFactory = FRONTENDS[frontend];
  if (!frontFactory) throw new Error(`Unsupported frontend: ${frontend}`);
  const frontGenerator = frontFactory();
  const frontFiles = frontGenerator.generate(schema, { locale, ui });
  const frontDir = frontend === 'vanilla' ? outDir : path.join(outDir, 'frontend');
  for (const [filePath, content] of Object.entries(frontFiles)) {
    const fullPath = path.join(frontDir, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
  }
  console.log(`✅ 前端代码生成完成 (${frontend})`);
}

export { generateFrontendProject } from './codegen/frontend-project';
