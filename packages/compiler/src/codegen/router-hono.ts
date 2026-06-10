import type { ParsedSchema } from '@yiyuan/core';

export function generateRouter(schema: ParsedSchema): string {
  const modelNames = Object.keys(schema.models);
  const imports = modelNames
    .map(name => `import ${name.toLowerCase()}App from './handlers/${name.toLowerCase()}.ts'`)
    .join('\n');
  const mounts = modelNames
    .map(name => `  app.route('/', ${name.toLowerCase()}App)`)
    .join('\n');

  return `import { Hono } from 'hono'
import { cors } from 'hono/cors'
${imports}
export function createApp(): Hono {
  const app = new Hono()
  app.use('*', cors())
${mounts}
  return app
}
`;
}
