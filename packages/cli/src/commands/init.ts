import * as fs from 'node:fs';
import * as path from 'node:path';

export function init(dir: string) {
  const target = path.resolve(dir);
  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
  const schemaPath = path.join(target, 'schema.ts');
  if (!fs.existsSync(schemaPath)) {
    const example = `import { defineSchema, string } from '@yiyuanjs/core';

export default defineSchema({
  models: {
    User: {
      name: string(),
      email: string(),
    },
  },
});
`;
    fs.writeFileSync(schemaPath, example);
    console.log(`✅ 已创建 ${schemaPath}`);
  } else {
    console.log('⚠️  schema.ts 已存在');
  }
}
