import type { ParsedSchema } from '@yiyuan/core';

export function generateHandler(schema: ParsedSchema, modelName: string): string {
  const lower = modelName.toLowerCase();
  return `import { Hono } from 'hono'
// Access DB from globalThis (set by startServer)
const { getDB, printDBCreate, printDBRead, printDBUpdate, printDBDelete } = (globalThis as any).__yiyuan

const app = new Hono()

// 租户 ID 提取
function tenantId(c: any) { return c.req.header('x-tenant-id') || 'default' }

// Create
app.post('/${lower}s', async (c) => {
  const tid = tenantId(c)
  const data = await c.req.json()
  const result = await getDB().create('${lower}', tid, data)
  printDBCreate('${lower}', data)
  if (globalThis.broadcast) globalThis.broadcast('dataChange', { model: '${lower}', action: 'create' })
  return c.json(result, 201)
})

// Read all
app.get('/${lower}s', async (c) => {
  const tid = tenantId(c)
  const items = await getDB().find('${lower}', tid)
  return c.json(items)
})

// Read one
app.get('/${lower}s/:id', async (c) => {
  const tid = tenantId(c)
  const id = c.req.param('id')
  const item = await getDB().findById('${lower}', tid, id)
  if (!item) return c.json({ error: 'Not found' }, 404)
  return c.json(item)
})

// Update
app.put('/${lower}s/:id', async (c) => {
  const tid = tenantId(c)
  const id = c.req.param('id')
  const data = await c.req.json()
  const updated = await getDB().update('${lower}', tid, id, data)
  printDBUpdate('${lower}', { id }, data)
  if (globalThis.broadcast) globalThis.broadcast('dataChange', { model: '${lower}', action: 'update' })
  return c.json(updated)
})

// Delete
app.delete('/${lower}s/:id', async (c) => {
  const tid = tenantId(c)
  const id = c.req.param('id')
  await getDB().delete('${lower}', tid, id)
  printDBDelete('${lower}', { id })
  if (globalThis.broadcast) globalThis.broadcast('dataChange', { model: '${lower}', action: 'delete' })
  return c.json({ success: true })
})

export default app
`;
}
