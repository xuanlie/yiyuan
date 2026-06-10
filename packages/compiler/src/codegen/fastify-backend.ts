import type { ParsedSchema } from '@yiyuan/core';
import type { BackendGenerator, GeneratorOptions } from './backend';

function handlerCode(modelName: string): string {
  const lower = modelName.toLowerCase();
  return `import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getDB } from '../db';

export default async function ${lower}Routes(fastify: FastifyInstance) {
  fastify.post('/${lower}s', async (req: FastifyRequest, reply: FastifyReply) => {
    const data = req.body;
    const result = await getDB().create('${lower}', data);
    reply.status(201).send(result);
  });

  fastify.get('/${lower}s', async (req: FastifyRequest, reply: FastifyReply) => {
    const items = await getDB().findMany('${lower}');
    return items;
  });

  fastify.get('/${lower}s/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const item = await getDB().findOne('${lower}', { id });
    if (!item) {
      reply.status(404).send({ error: 'Not found' });
      return;
    }
    return item;
  });

  fastify.put('/${lower}s/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const data = req.body;
    const updated = await getDB().update('${lower}', { id }, data);
    return updated;
  });

  fastify.delete('/${lower}s/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    await getDB().delete('${lower}', { id });
    return { success: true };
  });
}
`;
}

export class FastifyBackend implements BackendGenerator {
  constructor(_opts?: GeneratorOptions) {}

  generate(schema: ParsedSchema): Record<string, string> {
    const files: Record<string, string> = {};

    for (const name of Object.keys(schema.models)) {
      const lower = name.toLowerCase();
      files[`handlers/${lower}.ts`] = handlerCode(name);
    }

    let routerContent = `import { FastifyInstance } from 'fastify';
`;
    for (const name of Object.keys(schema.models)) {
      const lower = name.toLowerCase();
      routerContent += `import ${lower}Routes from './handlers/${lower}';\n`;
    }
    routerContent += `
export default async function apiRoutes(fastify: FastifyInstance) {
  await fastify.register(async (scope) => {
`;
    for (const name of Object.keys(schema.models)) {
      const lower = name.toLowerCase();
      routerContent += `    await ${lower}Routes(scope);\n`;
    }
    routerContent += `  }, { prefix: '/api' });
}
`;
    files['router.ts'] = routerContent;

    files['db.ts'] = `let db: any;
export function setDB(database: any) { db = database; }
export function getDB() {
  if (!db) throw new Error('DB not initialized');
  return db;
}
`;

    files['server.ts'] = `import Fastify from 'fastify';
import cors from '@fastify/cors';
import apiRoutes from './router';
import { setDB } from './db';

const fastify = Fastify({ logger: true });

async function start() {
  await fastify.register(cors);
  await fastify.register(apiRoutes);

  const port = parseInt(process.env.PORT || '3456');
  await fastify.listen({ port, host: '0.0.0.0' });
  console.log(\`Fastify server running on http://localhost:\${port}\`);
}

start().catch(err => {
  fastify.log.error(err);
  process.exit(1);
});
`;
    return files;
  }
}
