export default {
  backend: 'hono',
  datasource: { provider: 'json', url: '.yiyuan/data' },
  server: { port: 3456 },
  outDir: '.yiyuan',
  frontend: 'vanilla',
  auth: {
    enabled: true,
    secret: 'yiyuan-secret-key',
  },
  plugins: [],
};
