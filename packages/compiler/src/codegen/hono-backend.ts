import type { ParsedSchema } from '@yiyuan/core';
import type { BackendGenerator, GenerateOptions } from './backend';
import { generateHandler } from './api';
import { generateRouter } from './router-hono';
import { generateTypes } from './types';
import { generateApiClient } from './api-client';
import { generateAPIDocJSON, generateAPIDocMarkdown } from './api-doc';
import { generateDashboardPage } from './dashboard';
import { generateGuidePage } from './guide';
import { generateTutorialPage } from './tutorial';
import { generateApiOverviewPage } from './api-overview';
import { generateSchemaEditorPage } from './schema-editor';

export class HonoBackend implements BackendGenerator {
  private ui: string;
  constructor(options?: { ui?: string }) { this.ui = options?.ui || 'modern'; }

  generate(schema: ParsedSchema, options?: GenerateOptions): Record<string, string> {
    const files: Record<string, string> = {};

    files['types/models.ts'] = generateTypes(schema);

    for (const name of Object.keys(schema.models)) {
      const lower = name.toLowerCase();
      files[`handlers/${lower}.ts`] = generateHandler(schema, name);
    }

    files['router.ts'] = generateRouter(schema);
    files['api-client/index.ts'] = generateApiClient(schema);
    files['openapi.json'] = generateAPIDocJSON(schema);
    files['api-doc.md'] = generateAPIDocMarkdown(schema);
    files['dashboard.html'] = generateDashboardPage();
    files['guide.html'] = generateGuidePage();
    files['tutorial.html'] = generateTutorialPage();
    files['api-overview.html'] = generateApiOverviewPage(schema);
    files['schema-editor.html'] = generateSchemaEditorPage();

    return files;
  }
}
