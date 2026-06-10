import type { Hono } from 'hono';

export default function (app: Hono) {
  app.use('*', async (c, next) => {
    console.log('⚡ Example middleware triggered');
    await next();
  });
}
