// ─── 一元 自动生成 ───
import { Hono } from 'hono'
import { db } from '@yiyuan/server'
import { printDBCreate, printDBRead, printDBUpdate, printDBDelete } from '@yiyuan/server'

const app = new Hono()

app.get('/api/users', async (c) => {
  const where = c.req.query('where')
  const limit = c.req.query('limit')
  const results = await db('User').findMany({
    where: where ? JSON.parse(where) : undefined,
    limit: limit ? Number(limit) : undefined,
  })
  printDBRead('User', results.length, results)
  return c.json(results)
})

app.get('/api/users/:id', async (c) => {
  const result = await db('User').findOne({ id: c.req.param('id') })
  if (!result) return c.json({ error: 'Not found' }, 404)
  printDBRead('User', 1, [result])
  return c.json(result)
})

app.post('/api/users', async (c) => {
  const body = await c.req.json()
  const result = await db('User').create({ data: body })
  printDBCreate('User', result)
  return c.json(result, 201)
})

app.patch('/api/users', async (c) => {
  const { id, ...data } = await c.req.json()
  const result = await db('User').update({ where: { id: id }, data })
  printDBUpdate('User', id, data)
  return c.json(result)
})

app.delete('/api/users', async (c) => {
  const { id } = await c.req.json()
  await db('User').delete({ where: { id: id } })
  printDBDelete('User', id)
  return c.json({ ok: true })
})

export const userRoutes = app
