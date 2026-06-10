// ─── 一元 自动生成 ───
import { Hono } from 'hono'
import { db } from '@yiyuan/server'
import { printDBCreate, printDBRead, printDBUpdate, printDBDelete } from '@yiyuan/server'

const app = new Hono()

app.get('/api/tasks', async (c) => {
  const where = c.req.query('where')
  const limit = c.req.query('limit')
  const results = await db('Task').findMany({
    where: where ? JSON.parse(where) : undefined,
    limit: limit ? Number(limit) : undefined,
  })
  printDBRead('Task', results.length, results)
  return c.json(results)
})

app.get('/api/tasks/:id', async (c) => {
  const result = await db('Task').findOne({ id: c.req.param('id') })
  if (!result) return c.json({ error: 'Not found' }, 404)
  printDBRead('Task', 1, [result])
  return c.json(result)
})

app.post('/api/tasks', async (c) => {
  const body = await c.req.json()
  const result = await db('Task').create({ data: body })
  printDBCreate('Task', result)
  return c.json(result, 201)
})

app.patch('/api/tasks', async (c) => {
  const { id, ...data } = await c.req.json()
  const result = await db('Task').update({ where: { id: id }, data })
  printDBUpdate('Task', id, data)
  return c.json(result)
})

app.delete('/api/tasks', async (c) => {
  const { id } = await c.req.json()
  await db('Task').delete({ where: { id: id } })
  printDBDelete('Task', id)
  return c.json({ ok: true })
})

export const taskRoutes = app
