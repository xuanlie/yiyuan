export function generateTutorialPage(): string {
  return `<!DOCTYPE html>
<html lang="zh" x-data="{ current: 'start', sidebarOpen: false }">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yiyuan 教程</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.13.5/dist/cdn.min.js"></script>
  <style>
    :root { --sidebar-width: 260px; --primary: #6c5ce7; --code-bg: #1e293b; --text: #1a202c; --text-light: #4a5568; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: var(--text); }
    .layout { display: flex; min-height: 100vh; }
    .sidebar { width: var(--sidebar-width); background: white; border-right: 1px solid #e2e8f0; padding: 1.5rem; position: fixed; top: 0; bottom: 0; overflow-y: auto; z-index: 20; }
    .sidebar h2 { font-size: 1.2rem; color: var(--primary); margin-top: 0; }
    .sidebar nav a { display: block; padding: 0.5rem 0.8rem; border-radius: 8px; text-decoration: none; color: var(--text-light); font-size: 0.95rem; margin-bottom: 0.2rem; }
    .sidebar nav a:hover { background: #f1f5f9; color: var(--primary); }
    .sidebar nav a.active { background: #ede9fe; color: var(--primary); font-weight: 600; }
    .main-content { margin-left: var(--sidebar-width); flex: 1; padding: 2rem 3rem; max-width: 960px; }
    .main-content section { display: none; }
    .main-content section.active { display: block; }
    h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.8rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.4rem; margin-top: 2.5rem; }
    h3 { font-size: 1.3rem; margin-top: 1.8rem; }
    p { line-height: 1.7; color: var(--text-light); }
    pre { background: var(--code-bg); border-radius: 12px; padding: 1.2rem; overflow-x: auto; margin: 1.5rem 0; }
    code { font-family: monospace; font-size: 0.9rem; color: #a5b4fc; }
    .inline-code { background: #edf2f7; padding: 0.2em 0.4em; border-radius: 4px; color: #2d3748; }
    .tip { background: #ede9fe; border-left: 4px solid var(--primary); padding: 1rem 1.5rem; border-radius: 8px; margin: 1.5rem 0; }
    .menu-btn { display: none; position: fixed; top: 1rem; left: 1rem; z-index: 30; background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.5rem 1rem; }
    @media (max-width: 768px) {
      .layout { flex-direction: column; }
      .sidebar { transform: translateX(-100%); }
      .sidebar.open { transform: translateX(0); }
      .main-content { margin-left: 0; padding: 1.5rem; }
      .menu-btn { display: block; }
    }
  </style>
</head>
<body>
  <button class="menu-btn" @click="sidebarOpen = !sidebarOpen">☰ 菜单</button>
  <div class="layout">
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <h2>Yiyuan 教程</h2>
      <nav @click="sidebarOpen = false">
        <a href="#" @click.prevent="current='start'" :class="{ active: current === 'start' }">开始之前</a>
        <a href="#" @click.prevent="current='create'" :class="{ active: current === 'create' }">创建项目</a>
        <a href="#" @click.prevent="current='schema'" :class="{ active: current === 'schema' }">定义模型</a>
        <a href="#" @click.prevent="current='config'" :class="{ active: current === 'config' }">配置框架</a>
        <a href="#" @click.prevent="current='dev'" :class="{ active: current === 'dev' }">启动开发</a>
        <a href="#" @click.prevent="current='api'" :class="{ active: current === 'api' }">测试 API</a>
        <a href="#" @click.prevent="current='frontend'" :class="{ active: current === 'frontend' }">前端开发</a>
        <a href="#" @click.prevent="current='backend'" :class="{ active: current === 'backend' }">后端切换</a>
        <a href="#" @click.prevent="current='database'" :class="{ active: current === 'database' }">数据库切换</a>
        <a href="#" @click.prevent="current='auth'" :class="{ active: current === 'auth' }">添加认证</a>
        <a href="#" @click.prevent="current='multitenant'" :class="{ active: current === 'multitenant' }">多租户</a>
        <a href="#" @click.prevent="current='ws'" :class="{ active: current === 'ws' }">实时更新</a>
        <a href="#" @click.prevent="current='middleware'" :class="{ active: current === 'middleware' }">自定义中间件</a>
        <a href="#" @click.prevent="current='deploy'" :class="{ active: current === 'deploy' }">部署上线</a>
        <a href="#" @click.prevent="current='ai'" :class="{ active: current === 'ai' }">AI 协作</a>
      </nav>
    </aside>

    <main class="main-content">
      <!-- 开始之前 -->
      <section :class="{ active: current === 'start' }">
        <h1>开始之前</h1>
        <p>本教程将带你从零开始，使用 Yiyuan 构建一个完整的全栈应用。你将学会定义数据模型、自动生成 API 和管理后台，并逐步添加认证、多租户、实时推送等高级特性。</p>
        <h2>你需要准备</h2>
        <ul>
          <li>Node.js 18+ 环境</li>
          <li>pnpm（推荐）或 npm</li>
          <li>一个代码编辑器（VS Code 推荐）</li>
          <li>基本的 TypeScript 知识（可选）</li>
        </ul>
        <p>安装 pnpm：</p>
        <pre><code>npm install -g pnpm</code></pre>
      </section>

      <!-- 创建项目 -->
      <section :class="{ active: current === 'create' }">
        <h1>创建项目</h1>
        <p>使用 CLI 的交互式向导创建新项目：</p>
        <pre><code>yiyuan create my-blog
cd my-blog</code></pre>
        <p>向导会询问：</p>
        <ul>
          <li>项目名称</li>
          <li>后端框架（推荐 Hono）</li>
          <li>数据库（推荐 JSON）</li>
          <li>是否生成 React 前端（可选）</li>
        </ul>
        <p>项目结构如下：</p>
        <pre><code>my-blog/
├── schema.ts          # 数据模型定义
├── yiyuan.config.ts   # 框架配置
└── .yiyuan/           # 自动生成的代码（隐藏目录）</code></pre>
        <p>如果你已经有项目目录，也可以手动初始化：</p>
        <pre><code>mkdir my-blog && cd my-blog
yiyuan init</code></pre>
      </section>

      <!-- 定义模型 -->
      <section :class="{ active: current === 'schema' }">
        <h1>定义数据模型</h1>
        <p>打开 <code class="inline-code">schema.ts</code>，使用链式字段定义你的业务模型。这里我们创建一个博客的 <strong>文章</strong> 和 <strong>评论</strong> 模型。</p>
        <pre><code>import { defineSchema, string, text, number, auto, timestamp } from '@yiyuan/core';

export default defineSchema({
  models: {
    Post: {
      id: auto(),
      title: string().required(),
      content: text(),
      published: boolean().default(false),
      createdAt: timestamp(),
    },
    Comment: {
      id: auto(),
      postId: string().required(),
      text: text().required(),
      createdAt: timestamp(),
    },
  },
});</code></pre>
        <div class="tip"><strong>提示：</strong> 你也可以使用可视化编辑器，启动后访问 <a href="/schema-editor" target="_blank">/schema-editor</a> 拖拽生成 Schema。</div>
        <p>保存文件，接下来框架将根据这个 Schema 生成所有代码。</p>
      </section>

      <!-- 配置框架 -->
      <section :class="{ active: current === 'config' }">
        <h1>配置框架</h1>
        <p>编辑 <code class="inline-code">yiyuan.config.ts</code> 来定制框架行为。以下是一个典型的配置：</p>
        <pre><code>export default {
  backend: 'hono',          // 后端框架
  datasource: {
    provider: 'json',       // 数据库类型
    url: '.yiyuan/data',    // 数据存储位置
  },
  frontend: 'vanilla',      // 前端模式 (vanilla / react / vue)
  server: {
    port: 3456,
  },
  auth: {
    enabled: false,         // 是否启用 JWT
    secret: 'change-me',
  },
  outDir: '.yiyuan',
};</code></pre>
        <p>每个字段都是可选的，框架会使用默认值。环境变量可以覆盖这些配置，例如 <code class="inline-code">PORT=4000 yiyuan dev</code>。</p>
      </section>

      <!-- 启动开发 -->
      <section :class="{ active: current === 'dev' }">
        <h1>启动开发服务器</h1>
        <p>运行以下命令，框架会自动编译 Schema 并启动服务器：</p>
        <pre><code>yiyuan dev</code></pre>
        <p>终端会显示彩色 Banner 和每个请求的详细日志。浏览器打开：</p>
        <ul>
          <li><strong>管理后台：</strong> <a href="http://localhost:3456" target="_blank">http://localhost:3456</a></li>
          <li><strong>Swagger 文档：</strong> <a href="http://localhost:3456/api/docs" target="_blank">http://localhost:3456/api/docs</a></li>
        </ul>
        <p>你现在已经拥有了一个完整可用的全栈应用，无需编写任何后端或前端代码。</p>
      </section>

      <!-- 测试 API -->
      <section :class="{ active: current === 'api' }">
        <h1>测试 API</h1>
        <p>使用 curl 或 Swagger UI 测试自动生成的接口：</p>
        <pre><code># 创建一篇文章
curl -X POST http://localhost:3456/api/posts \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Hello Yiyuan","content":"框架真棒"}'

# 获取文章列表
curl http://localhost:3456/api/posts

# 更新文章
curl -X PUT http://localhost:3456/api/posts/&lt;id&gt; \\
  -H "Content-Type: application/json" \\
  -d '{"published":true}'

# 删除文章
curl -X DELETE http://localhost:3456/api/posts/&lt;id&gt;</code></pre>
        <p>每个模型都自动拥有完整的 RESTful 接口。你可以在 Swagger 页面直接在线测试。</p>
      </section>

      <!-- 前端开发 -->
      <section :class="{ active: current === 'frontend' }">
        <h1>前端开发</h1>
        <p>Yiyuan 提供了三种前端模式，你可以通过 <code class="inline-code">frontend</code> 配置切换。</p>
        <h2>Vanilla 模式（默认）</h2>
        <p>生成一个 Alpine.js + Pico.css 的单页应用，无需构建，打开即用。适合后台管理和原型。</p>
        <h2>React 模式</h2>
        <p>生成完整的 React 项目到 <code class="inline-code">frontend/</code> 目录：</p>
        <pre><code>yiyuan generate-frontend
cd frontend
npm install
npm run dev</code></pre>
        <p>前端开发服务器运行在 <code class="inline-code">http://localhost:3000</code>，自动代理 API 请求。</p>
        <h2>Vue 模式</h2>
        <p>类似 React，生成 Vue 3 + Vite 工程。</p>
        <h2>使用 AI 开发前端</h2>
        <p>框架自动生成的 <code class="inline-code">api-client</code> 和 OpenAPI 文档可以直接提供给 AI，让它帮你编写任意前端页面。</p>
      </section>

      <!-- 后端切换 -->
      <section :class="{ active: current === 'backend' }">
        <h1>切换后端框架</h1>
        <p>Yiyuan 允许你在不修改 Schema 的情况下切换后端技术栈。只需修改 <code class="inline-code">yiyuan.config.ts</code> 中的 <code class="inline-code">backend</code> 字段。</p>
        <pre><code>backend: 'express', // 改为 express</code></pre>
        <p>重新运行 <code class="inline-code">yiyuan dev</code>，框架会生成 Express 风格的路由和入口文件。支持的框架包括 Hono、Express、Koa、Fastify、NestJS、FastAPI、Flask、Django、Gin、Fiber、GraphQL。</p>
        <div class="tip"><strong>注意：</strong> 只有 Hono 后端可以通过 <code class="inline-code">yiyuan dev</code> 直接启动。其他后端生成后需要使用对应的运行时（如 Python、Go 命令）启动。</div>
      </section>

      <!-- 数据库切换 -->
      <section :class="{ active: current === 'database' }">
        <h1>切换数据库</h1>
        <p>框架内置了多种数据库适配器。修改 <code class="inline-code">datasource.provider</code> 即可切换：</p>
        <pre><code>datasource: {
  provider: 'sqlite',
  url: './mydb.sqlite',
}</code></pre>
        <p>支持的数据库：JSON、SQLite、PostgreSQL、MySQL、MongoDB、Redis。使用非 JSON 数据库时需要安装对应的驱动（可选依赖）。</p>
        <p>所有适配器实现相同的接口，数据操作代码无需改动。</p>
      </section>

      <!-- 添加认证 -->
      <section :class="{ active: current === 'auth' }">
        <h1>添加认证</h1>
        <p>在配置中启用 JWT 认证：</p>
        <pre><code>auth: {
  enabled: true,
  secret: 'your-strong-secret',
}</code></pre>
        <p>框架会自动添加 <code class="inline-code">POST /api/login</code> 端点，并保护所有其他 API。前端可以使用 ApiClient 自动管理 token：</p>
        <pre><code>import { api } from '@yiyuan/api-client';
await api.login('admin', 'admin');  // 默认凭据
const posts = await api.getPosts();</code></pre>
        <p>你可以在中间件中自定义登录验证逻辑，例如对接数据库用户表。</p>
      </section>

      <!-- 多租户 -->
      <section :class="{ active: current === 'multitenant' }">
        <h1>多租户隔离</h1>
        <p>Yiyuan 从底层支持多租户。只需在请求头中传递 <code class="inline-code">x-tenant-id</code>：</p>
        <pre><code>curl -H "x-tenant-id: tenantA" http://localhost:3456/api/posts</code></pre>
        <p>不同的租户数据会自动隔离，无需额外配置。数据库适配器会根据租户 ID 将数据存储在独立区域。</p>
      </section>

      <!-- 实时更新 -->
      <section :class="{ active: current === 'ws' }">
        <h1>WebSocket 实时更新</h1>
        <p>默认的 Hono 后端会自动启动一个 WebSocket 服务器（HTTP 端口 + 1）。前端页面（包括 Alpine 和 React 模式）会自动连接，当数据变化时实时刷新列表。</p>
        <p>你可以在自定义代码中使用 <code class="inline-code">globalThis.broadcast(channel, data)</code> 来推送消息。</p>
      </section>

      <!-- 自定义中间件 -->
      <section :class="{ active: current === 'middleware' }">
        <h1>自定义中间件</h1>
        <p>使用 CLI 快速创建中间件：</p>
        <pre><code>yiyuan add middleware request-logger</code></pre>
        <p>编辑生成的文件，添加自定义逻辑，例如请求日志：</p>
        <pre><code>import type { Hono } from 'hono';
export default function (app: Hono) {
  app.use('*', async (c, next) => {
    console.log(\`\${c.req.method} \${c.req.url}\`);
    await next();
  });
}</code></pre>
        <p>在配置中启用：</p>
        <pre><code>middlewares: ['./middlewares/request-logger.ts']</code></pre>
      </section>

      <!-- 部署上线 -->
      <section :class="{ active: current === 'deploy' }">
        <h1>部署上线</h1>
        <p>生成 Docker 相关文件并启动：</p>
        <pre><code>yiyuan deploy
docker compose up -d</code></pre>
        <p>项目会自动构建并在 <code class="inline-code">http://localhost:3456</code> 运行。你也可以将生成的 <code class="inline-code">Dockerfile</code> 用于任何支持容器的云平台。</p>
        <p>生成的文件还包括 GitHub Actions 工作流，实现推送代码自动部署。</p>
      </section>

      <!-- AI 协作 -->
      <section :class="{ active: current === 'ai' }">
        <h1>AI 协作开发</h1>
        <p>Yiyuan 为 AI 提供了完美的开发环境。你可以：</p>
        <ol>
          <li>访问 <a href="/api-overview" target="_blank">/api-overview</a> 页面，一键复制包含所有 API 和类型的提示词。</li>
          <li>将提示词粘贴给 ChatGPT 或其他 AI 工具，让它生成前端页面。</li>
          <li>生成的代码可直接放在 <code class="inline-code">frontend/src</code> 中，使用自动生成的 <code class="inline-code">api-client</code> 进行数据交互。</li>
        </ol>
        <p>这样可以大幅提升开发效率，让 AI 处理重复性的 UI 工作，你专注于业务逻辑。</p>
      </section>
    </main>
  </div>
</body>
</html>`;
}
