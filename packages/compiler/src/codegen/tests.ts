import type { ParsedSchema } from '@yiyuan/core';

export function generateHandlerTest(modelName: string): string {
  const lower = modelName.toLowerCase();
  return `import { describe, it, expect, beforeAll, vi } from 'vitest';
import app from '../handlers/${lower}';

// Mock getDB and print functions
vi.mock('@yiyuan/server', () => ({
  getDB: vi.fn(() => ({
    create: vi.fn((_model: string, data: any) => ({ id: 'test-id', ...data })),
    findMany: vi.fn(() => []),
    findOne: vi.fn((_model: string, where: any) => ({ id: where.id, name: 'Test' })),
    update: vi.fn((_model: string, where: any, data: any) => ({ id: where.id, ...data })),
    delete: vi.fn(() => true),
  })),
  printDBCreate: vi.fn(),
  printDBRead: vi.fn(),
  printDBUpdate: vi.fn(),
  printDBDelete: vi.fn(),
}));

describe('${modelName} API', () => {
  it('POST /${lower}s should create', async () => {
    const res = await app.request('/${lower}s', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' }),
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.id).toBe('test-id');
    expect(json.name).toBe('Test');
  });

  it('GET /${lower}s should return list', async () => {
    const res = await app.request('/${lower}s');
    expect(res.status).toBe(200);
  });

  it('GET /${lower}s/:id should return one', async () => {
    const res = await app.request('/${lower}s/test-id');
    expect(res.status).toBe(200);
  });

  it('PUT /${lower}s/:id should update', async () => {
    const res = await app.request('/${lower}s/test-id', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated' }),
    });
    expect(res.status).toBe(200);
  });

  it('DELETE /${lower}s/:id should delete', async () => {
    const res = await app.request('/${lower}s/test-id', { method: 'DELETE' });
    expect(res.status).toBe(200);
  });
});
`;
}
