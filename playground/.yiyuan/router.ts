import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { userRoutes } from './handlers/user'
import { taskRoutes } from './handlers/task'

export function createApp(): Hono {
  const app = new Hono()
  app.use('*', cors())
  app.route('/', userRoutes)
  app.route('/', taskRoutes)
  return app
}
