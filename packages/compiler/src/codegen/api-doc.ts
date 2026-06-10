import type { ParsedSchema, ModelDef } from '@yiyuan/core';

function fieldToSchema(field: any) {
  const typeMap: Record<string, string> = {
    string: 'string',
    number: 'number',
    integer: 'integer',
    boolean: 'boolean',
  };
  return { type: typeMap[field.type] || 'string' };
}

export function generateAPIDocJSON(schema: ParsedSchema): string {
  const paths: any = {};
  const schemas: any = {};

  for (const [modelName, modelDef] of Object.entries(schema.models)) {
    const lower = modelName.toLowerCase();

    // 定义模型 Schema
    const properties: any = { id: { type: 'string' } };
    for (const [fieldName, field] of Object.entries(modelDef.fields)) {
      properties[fieldName] = fieldToSchema(field);
    }
    schemas[modelName] = { type: 'object', properties };

    const basePath = `/${lower}s`;

    paths[basePath] = {
      get: {
        tags: [modelName],
        summary: `List ${lower}s`,
        operationId: `get${modelName}s`,
        responses: {
          '200': {
            description: 'success',
            content: { 'application/json': { schema: { type: 'array', items: { '$ref': `#/components/schemas/${modelName}` } } } }
          }
        }
      },
      post: {
        tags: [modelName],
        summary: `Create ${lower}`,
        operationId: `create${modelName}`,
        requestBody: { content: { 'application/json': { schema: { '$ref': `#/components/schemas/${modelName}` } } } },
        responses: { '201': { description: 'created' } }
      }
    };
    paths[`${basePath}/{id}`] = {
      get: {
        tags: [modelName],
        summary: `Get ${lower} by ID`,
        operationId: `get${modelName}ById`,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'success',
            content: { 'application/json': { schema: { '$ref': `#/components/schemas/${modelName}` } } }
          }
        }
      },
      put: {
        tags: [modelName],
        summary: `Update ${lower}`,
        operationId: `update${modelName}`,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { '$ref': `#/components/schemas/${modelName}` } } } },
        responses: { '200': { description: 'updated' } }
      },
      delete: {
        tags: [modelName],
        summary: `Delete ${lower}`,
        operationId: `delete${modelName}`,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'deleted' } }
      }
    };
  }

  const doc = {
    openapi: '3.0.0',
    info: {
      title: 'Yiyuan API',
      version: '1.0.0',
      description: 'Auto-generated API by Yiyuan'
    },
    paths,
    components: { schemas }
  };

  return JSON.stringify(doc, null, 2);
}

export function generateAPIDocMarkdown(schema: ParsedSchema): string {
  let md = '# API Documentation\n\n';
  for (const [modelName] of Object.entries(schema.models)) {
    const lower = modelName.toLowerCase();
    md += `## ${modelName}\n`;
    md += `- GET /${lower}s\n`;
    md += `- POST /${lower}s\n`;
    md += `- GET /${lower}s/{id}\n`;
    md += `- PUT /${lower}s/{id}\n`;
    md += `- DELETE /${lower}s/{id}\n\n`;
  }
  return md;
}
