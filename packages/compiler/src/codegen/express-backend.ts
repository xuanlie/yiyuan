import type { ParsedSchema } from '@yiyuan/core';
import type { BackendGenerator, GeneratorOptions } from './backend';

function handlerCode(modelName: string): string {
  const lower = modelName.toLowerCase();
  return `import { Router, Request, Response } from 'express';
import { getDB } from '../db';

const router = Router();
const modelName = '${lower}';

router.post('/${lower}s', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const result = await getDB().create(modelName, data);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/${lower}s', async (req: Request, res: Response) => {
  try {
    const items = await getDB().findMany(modelName);
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/${lower}s/:id', async (req: Request, res: Response) => {
  try {
    const item = await getDB().findOne(modelName, { id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/${lower}s/:id', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const updated = await getDB().update(modelName, { id: req.params.id }, data);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/${lower}s/:id', async (req: Request, res: Response) => {
  try {
    await getDB().delete(modelName, { id: req.params.id });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
`;
}

export class ExpressBackend implements BackendGenerator {
  constructor(_opts?: GeneratorOptions) {}

  generate(schema: ParsedSchema): Record<string, string> {
    const files: Record<string, string> = {};

    for (const name of Object.keys(schema.models)) {
      const lower = name.toLowerCase();
      files[`handlers/${lower}.ts`] = handlerCode(name);
    }

    let routerContent = `import { Router } from 'express';
`;
    for (const name of Object.keys(schema.models)) {
      const lower = name.toLowerCase();
      routerContent += `import ${lower}Routes from './handlers/${lower}';\n`;
    }
    routerContent += `\nconst router = Router();\n`;
    for (const name of Object.keys(schema.models)) {
      const lower = name.toLowerCase();
      routerContent += `router.use('/api', ${lower}Routes);\n`;
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

    files['server.ts'] = `import express from 'express';
import cors from 'cors';
import router from './router';
import { setDB } from './db';

const app = express();
app.use(cors());
app.use(express.json());
app.use(router);

const PORT = process.env.PORT || 3456;
app.listen(PORT, () => {
  console.log(\`Express server running on http://localhost:\${PORT}\`);
});
`;
    return files;
  }
}
