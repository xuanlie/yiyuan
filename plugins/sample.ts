import type { Hono } from 'hono';

export default {
  name: 'sample',
  onRoute(app: Hono) {
    app.get('/hello', (c) => c.text('Hello from plugin!'));
  }
};
