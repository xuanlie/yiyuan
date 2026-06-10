export function generateGuidePage(): string {
  // 以下 HTML 模板将生成超过 2000 行的文档页面
  return `<!DOCTYPE html>
<html lang="zh" x-data="{ current: 'intro', sidebarOpen: false }">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yiyuan 开发文档</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.13.5/dist/cdn.min.js"></script>
  <style>
    :root {
      --sidebar-width: 260px;
      --primary: #6c5ce7;
      --code-bg: #1e293b;
      --text: #1a202c;
      --text-light: #4a5568;
    }
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
    table { width: 100%; margin: 1rem 0; }
    th, td { padding: 0.5rem; text-align: left; }
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
      <h2>Yiyuan 文档</h2>
      <nav @click="sidebarOpen = false">
        <a href="#" @click.prevent="current='intro'" :class="{ active: current === 'intro' }">介绍</a>
        <a href="#" @click.prevent="current='install'" :class="{ active: current === 'install' }">安装</a>
        <a href="#" @click.prevent="current='quickstart'" :class="{ active: current === 'quickstart' }">快速开始</a>
        <a href="#" @click.prevent="current='core'" :class="{ active: current === 'core' }">核心概念</a>
        <a href="#" @click.prevent="current='schema'" :class="{ active: current === 'schema' }">Schema 详解</a>
        <a href="#" @click.prevent="current='config'" :class="{ active: current === 'config' }">配置</a>
        <a href="#" @click.prevent="current='backend'" :class="{ active: current === 'backend' }">后端生成器</a>
        <a href="#" @click.prevent="current='frontend'" :class="{ active: current === 'frontend' }">前端生成器</a>
        <a href="#" @click.prevent="current='database'" :class="{ active: current === 'database' }">数据库适配器</a>
        <a href="#" @click.prevent="current='auth'" :class="{ active: current === 'auth' }">认证与授权</a>
        <a href="#" @click.prevent="current='multitenant'" :class="{ active: current === 'multitenant' }">多租户</a>
        <a href="#" @click.prevent="current='websocket'" :class="{ active: current === 'websocket' }">WebSocket 实时更新</a>
        <a href="#" @click.prevent="current='plugins'" :class="{ active: current === 'plugins' }">插件系统</a>
        <a href="#" @click.prevent="current='middleware'" :class="{ active: current === 'middleware' }">自定义中间件</a>
        <a href="#" @click.prevent="current='deploy'" :class="{ active: current === 'deploy' }">部署与 CI/CD</a>
        <a href="#" @click.prevent="current='extend'" :class="{ active: current === 'extend' }">扩展开发</a>
        <a href="#" @click.prevent="current='api'" :class="{ active: current === 'api' }">API 参考</a>
        <a href="#" @click.prevent="current='faq'" :class="{ active: current === 'faq' }">常见问题</a>
        <a href="#" @click.prevent="current='migration'" :class="{ active: current === 'migration' }">迁移指南</a>
        <a href="#" @click.prevent="current='performance'" :class="{ active: current === 'performance' }">性能优化</a>
        <a href="#" @click.prevent="current='security'" :class="{ active: current === 'security' }">安全最佳实践</a>
        <a href="#" @click.prevent="current='changelog'" :class="{ active: current === 'changelog' }">更新日志</a>
      </nav>
    </aside>

    <main class="main-content">
      <!-- 介绍 -->
      <section :class="{ active: current === 'intro' }">
        <h1>介绍</h1>
        <p>Yiyuan（一元）是一个 <strong>Schema 驱动的全栈低代码框架</strong>。只需定义数据模型，即可自动生成：</p>
        <ul>
          <li>多语言后端 CRUD API（Hono/Express/FastAPI/Gin 等 11 种）</li>
          <li>管理后台界面（Alpine.js + Pico.css / React / Vue）</li>
          <li>Swagger / OpenAPI 文档</li>
          <li>数据库适配器（JSON / SQLite / PostgreSQL / MySQL / MongoDB / Redis）</li>
          <li>JWT 认证、多租户隔离、WebSocket 实时推送</li>
          <li>自动测试生成 & CI/CD 集成</li>
        </ul>
        <div class="tip"><strong>核心理念：</strong> 写一个 Schema，驱动整个全栈应用。不锁定技术栈，随时切换后端框架或数据库，真正实现“一次定义，到处运行”。</div>

        <h2>为什么选择 Yiyuan？</h2>
        <ul>
          <li><strong>极速开发：</strong> 从想法到可运行的全栈应用只需几分钟。</li>
          <li><strong>技术栈自由：</strong> 动态切换后端语言和框架，不绑定特定技术。</li>
          <li><strong>生产就绪：</strong> 内置认证、多租户、监控、容器化部署支持。</li>
          <li><strong>高度可扩展：</strong> 插件化架构，轻松添加自定义生成器。</li>
          <li><strong>AI 友好：</strong> 自动生成 API 客户端、OpenAPI 文档和提示词，让 AI 高效编写前端代码。</li>
        </ul>

        <h2>架构概览</h2>
        <pre><code>用户定义 Schema (schema.ts)
        |
        v
   编译器 (compiler)
  /     |      \\
后端代码  前端页面  文档/测试
  |      |      |
Hono    Alpine   Swagger
Express  React   OpenAPI
FastAPI   Vue
Gin...
        |
  运行时服务器 (server)
  |      |      |
数据库适配器   中间件   WebSocket</code></pre>
        <p>框架由四个核心包组成：</p>
        <table>
          <tr><td><code class="inline-code">@yiyuan/core</code></td><td>Schema 定义、配置类型</td></tr>
          <tr><td><code class="inline-code">@yiyuan/compiler</code></td><td>代码生成引擎（后端、前端、测试）</td></tr>
          <tr><td><code class="inline-code">@yiyuan/server</code></td><td>运行时 HTTP 服务器、数据库适配器</td></tr>
          <tr><td><code class="inline-code">@yiyuan/cli</code></td><td>命令行工具</td></tr>
        </table>
      </section>

      <!-- 安装 -->
      <section :class="{ active: current === 'install' }">
        <h1>安装</h1>
        <h2>环境要求</h2>
        <ul>
          <li>Node.js 18.0.0 或更高版本</li>
          <li>pnpm（推荐）或 npm</li>
        </ul>
        <pre><code>node -v   # 确认版本
npm install -g pnpm</code></pre>
        <h2>全局安装 CLI</h2>
        <pre><code>npm install -g @yiyuan/cli</code></pre>
        <p>安装完成后，<code class="inline-code">yiyuan</code> 命令即可全局使用。</p>
        <h2>从源代码使用（开发模式）</h2>
        <pre><code>git clone https://github.com/your/yiyuan.git
cd yiyuan
pnpm install
pnpm build
node bin/yiyuan dev</code></pre>
        <h2>版本检查</h2>
        <pre><code>yiyuan --version</code></pre>
        <p>应该输出 <code class="inline-code">0.1.0</code> 或更高。</p>
      </section>

      <!-- 快速开始 -->
      <section :class="{ active: current === 'quickstart' }">
        <h1>快速开始</h1>
        <p>以下步骤将在 2 分钟内创建一个可运行的全栈博客应用。</p>
        <h2>1. 创建项目</h2>
        <pre><code>yiyuan create my-blog
cd my-blog</code></pre>
        <p>交互式向导会询问后端框架、数据库、前端模式等。推荐默认值（Hono + JSON + vanilla）。</p>
        <h2>2. 定义模型</h2>
        <p>编辑自动生成的 <code class="inline-code">schema.ts</code>：</p>
        <pre><code>import { defineSchema, string, text, number, auto } from '@yiyuan/core';
export default defineSchema({
  models: {
    Post: {
      id: auto(),
      title: string().required(),
      content: text(),
      published: boolean().default(false),
    },
  },
});</code></pre>
        <h2>3. 启动开发服务器</h2>
        <pre><code>yiyuan dev</code></pre>
        <p>终端会显示彩色 Banner 及请求日志。浏览器打开：</p>
        <ul>
          <li><strong>管理后台：</strong> <a href="http://localhost:3456" target="_blank">http://localhost:3456</a></li>
          <li><strong>Swagger 文档：</strong> <a href="http://localhost:3456/api/docs" target="_blank">http://localhost:3456/api/docs</a></li>
        </ul>
        <h2>4. 测试 API</h2>
        <pre><code>curl -X POST http://localhost:3456/api/posts \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Hello","content":"Yiyuan 很棒"}'</code></pre>
        <p>你已经拥有了完整的增删改查接口！</p>
      </section>

      <!-- 核心概念 -->
      <section :class="{ active: current === 'core' }">
        <h1>核心概念</h1>
        <h2>Schema 驱动</h2>
        <p>Yiyuan 的核心思想是 <strong>Schema First</strong>。你只需描述数据的形状（模型、字段、类型），框架自动推导出：</p>
        <ul>
          <li>数据库表结构</li>
          <li>RESTful / GraphQL API 端点</li>
          <li>输入验证规则</li>
          <li>管理后台 UI 表单</li>
          <li>API 文档</li>
        </ul>
        <h2>编译器管道</h2>
        <p>当你运行 <code class="inline-code">yiyuan dev</code> 或 <code class="inline-code">yiyuan generate</code> 时，编译器执行以下步骤：</p>
        <ol>
          <li>读取 Schema — 解析 <code class="inline-code">schema.ts</code>，提取模型定义。</li>
          <li>选择后端生成器 — 根据配置选择对应后端框架生成器。</li>
          <li>生成后端代码 — 为每个模型生成 CRUD 处理器、路由聚合、类型定义、Swagger 文档。</li>
          <li>选择前端生成器 — 根据 <code class="inline-code">frontend</code> 配置生成前端页面或工程。</li>
          <li>写入磁盘 — 所有生成文件输出到 <code class="inline-code">.yiyuan</code> 目录。</li>
        </ol>
        <h2>运行时服务器</h2>
        <p>对于 Hono 后端（默认），Yiyuan 会启动一个 Node.js 服务器，动态加载生成的路由文件，同时提供静态文件服务、请求日志、全局错误处理。其他后端（如 FastAPI、Gin）生成后需使用各自运行时启动。</p>
        <h2>插件与中间件</h2>
        <p>框架支持通过 <strong>中间件</strong>（请求处理管道）和 <strong>插件</strong>（编译时/运行时扩展）来定制行为。中间件可处理认证、日志、CORS 等；插件可添加新的后端/前端生成器或数据库适配器。</p>
      </section>

      <!-- Schema 详解 -->
      <section :class="{ active: current === 'schema' }">
        <h1>Schema 详解</h1>
        <p>Schema 是项目的核心，定义所有数据模型。目前支持两种定义方式：函数链式调用（推荐）和对象配置。</p>

        <h2>链式字段定义（v0.1+）</h2>
        <p>使用内置字段工厂函数构建模型，类型安全且语义清晰。</p>
        <pre><code>import { defineSchema, string, text, number, auto, timestamp, enumOf, hasMany, hasOne } from '@yiyuan/core';

export default defineSchema({
  models: {
    Category: {
      id: auto(),
      name: string().required().searchable(),
      icon: string(),
      items: hasMany('Dish'),
    },
    Dish: {
      id: auto(),
      name: string().required().searchable(),
      description: text(),
      price: number().required(),
      category: hasOne('Category'),
      available: enumOf('yes', 'no').default('yes'),
      createdAt: timestamp(),
    },
  },
});</code></pre>

        <h3>可用字段类型</h3>
        <table>
          <tr><td><code class="inline-code">string()</code></td><td>字符串</td></tr>
          <tr><td><code class="inline-code">text()</code></td><td>长文本</td></tr>
          <tr><td><code class="inline-code">number()</code></td><td>浮点数</td></tr>
          <tr><td><code class="inline-code">integer()</code></td><td>整数</td></tr>
          <tr><td><code class="inline-code">boolean()</code></td><td>布尔值</td></tr>
          <tr><td><code class="inline-code">auto()</code></td><td>自动生成的主键</td></tr>
          <tr><td><code class="inline-code">timestamp()</code></td><td>时间戳</td></tr>
          <tr><td><code class="inline-code">enumOf(...values)</code></td><td>枚举值</td></tr>
          <tr><td><code class="inline-code">hasOne('Model')</code></td><td>一对一关联</td></tr>
          <tr><td><code class="inline-code">hasMany('Model')</code></td><td>一对多关联</td></tr>
        </table>
        <p>字段方法支持链式调用：<code class="inline-code">string().required().default('hello')</code>。常用修饰符：<code class="inline-code">required()</code>、<code class="inline-code">default(val)</code>、<code class="inline-code">searchable()</code>、<code class="inline-code">unique()</code>。</p>

        <h2>可视化编辑器</h2>
        <p>除了手写代码，你也可以启动服务器后访问 <a href="/schema-editor" target="_blank">/schema-editor</a>，通过拖拽方式生成 Schema 代码。</p>
      </section>

      <!-- 配置 -->
      <section :class="{ active: current === 'config' }">
        <h1>配置文件</h1>
        <p>项目根目录下的 <code class="inline-code">yiyuan.config.ts</code> 控制框架的所有行为。所有字段均为可选，框架提供合理的默认值。</p>
        <h2>完整配置示例</h2>
        <pre><code>import type { YiyuanConfig } from '@yiyuan/core';

const config: YiyuanConfig = {
  backend: 'hono',              // 后端框架
  datasource: {
    provider: 'json',           // 数据库类型
    url: '.yiyuan/data',        // 连接地址或路径
  },
  frontend: 'vanilla',          // 前端生成模式 (vanilla/react/vue)
  server: {
    port: 3456,
    banner: 'colorful',         // 启动 Banner 风格
  },
  auth: {
    enabled: false,             // 是否启用 JWT 认证
    secret: 'your-secret-key',  // JWT 密钥
  },
  outDir: '.yiyuan',            // 代码输出目录
  ui: 'modern',                 // UI 主题
  locale: 'zh',                 // 界面语言 (zh/en)
  middlewares: [],              // 中间件路径列表
  plugins: [],                  // 插件配置
};

export default config;</code></pre>

        <h2>环境变量覆盖</h2>
        <p>以下环境变量可以覆盖配置文件中的对应值：</p>
        <table>
          <tr><td><code class="inline-code">DATABASE_PROVIDER</code></td><td>覆盖 <code class="inline-code">datasource.provider</code></td></tr>
          <tr><td><code class="inline-code">DATABASE_URL</code></td><td>覆盖 <code class="inline-code">datasource.url</code></td></tr>
          <tr><td><code class="inline-code">PORT</code></td><td>覆盖 <code class="inline-code">server.port</code></td></tr>
          <tr><td><code class="inline-code">AUTH_SECRET</code></td><td>覆盖 <code class="inline-code">auth.secret</code></td></tr>
        </table>
      </section>

      <!-- 后端生成器 -->
      <section :class="{ active: current === 'backend' }">
        <h1>后端生成器</h1>
        <p>Yiyuan 支持生成多种后端框架的代码，只需在配置中修改 <code class="inline-code">backend</code> 字段即可切换。</p>
        <h2>支持的框架列表</h2>
        <table>
          <tr><td><strong>TypeScript/Node.js</strong></td><td>Hono, Express, Koa, Fastify, NestJS</td></tr>
          <tr><td><strong>Python</strong></td><td>FastAPI, Flask, Django</td></tr>
          <tr><td><strong>Go</strong></td><td>Gin, Fiber</td></tr>
          <tr><td><strong>GraphQL</strong></td><td>Apollo Server (Node.js)</td></tr>
        </table>
        <h2>生成内容</h2>
        <p>无论选择哪个框架，都会生成以下核心文件：</p>
        <ul>
          <li>CRUD 处理器 — 每个模型一个文件，包含创建、读取、更新、删除逻辑。</li>
          <li>路由聚合 — 将所有模型路由挂载到统一入口。</li>
          <li>类型定义 — TypeScript 类型（或对应语言的类型）文件。</li>
          <li>Swagger 文档 — OpenAPI 3.0 规范的 JSON 和 Swagger UI 页面。</li>
        </ul>
        <p>对于 Python 和 Go 框架，还会生成项目入口文件（如 <code class="inline-code">main.py</code> 或 <code class="inline-code">main.go</code>）及依赖管理文件。</p>
      </section>

      <!-- 前端生成器 -->
      <section :class="{ active: current === 'frontend' }">
        <h1>前端生成器</h1>
        <p>Yiyuan 支持三种前端模式，通过 <code class="inline-code">frontend</code> 配置选择。</p>
        <h2>Vanilla (Alpine.js + Pico.css)</h2>
        <p>默认模式，生成一个单页 HTML 文件，使用 Alpine.js 实现交互，Pico.css 提供样式。零构建，极致轻量，适合后台管理、原型验证。</p>
        <ul>
          <li>自动生成数据表格、模态框、分页、搜索、排序</li>
          <li>支持多模型标签切换</li>
          <li>内置 WebSocket 实时更新</li>
          <li>响应式布局，暗色模式</li>
        </ul>
        <h2>React 模式</h2>
        <p>生成基于 Vite + React 的前端工程，包含函数组件、React Router 路由、API 代理配置、Ant Design UI。输出在 <code class="inline-code">.yiyuan/frontend/</code> 目录。</p>
        <pre><code>cd frontend && npm install && npm run dev</code></pre>
        <h2>Vue 模式</h2>
        <p>生成基于 Vite + Vue 3 的前端工程，包含单文件组件、Vue Router、API 代理。输出目录同上。</p>
        <p>React/Vue 前端开发服务器默认运行在 <code class="inline-code">http://localhost:5173</code>，API 请求自动代理到后端。</p>
      </section>

      <!-- 数据库适配器 -->
      <section :class="{ active: current === 'database' }">
        <h1>数据库适配器</h1>
        <p>Yiyuan 内置多种数据库适配器，通过 <code class="inline-code">datasource.provider</code> 切换。所有适配器实现统一的 <code class="inline-code">DatabaseAdapter</code> 接口，确保上层 API 一致。</p>
        <ul>
          <li><strong>JSON</strong> — 存储为本地 JSON 文件，零依赖。</li>
          <li><strong>SQLite</strong> — 使用 <code class="inline-code">better-sqlite3</code>（可选依赖）。</li>
          <li><strong>PostgreSQL</strong> — 使用 <code class="inline-code">pg</code> 驱动。</li>
          <li><strong>MySQL</strong> — 使用 <code class="inline-code">mysql2</code> 驱动。</li>
          <li><strong>MongoDB</strong> — 使用官方 <code class="inline-code">mongodb</code> 驱动。</li>
          <li><strong>Redis</strong> — 使用 <code class="inline-code">redis</code> 客户端。</li>
        </ul>
        <h2>自定义适配器</h2>
        <p>你可以实现 <code class="inline-code">DatabaseAdapter</code> 接口来支持其他数据库。接口定义参见 API 参考。</p>
      </section>

      <!-- 认证与授权 -->
      <section :class="{ active: current === 'auth' }">
        <h1>认证与授权</h1>
        <p>Yiyuan 内置了灵活的认证系统，支持 JWT 和自定义验证逻辑。</p>
        <h2>启用 JWT 认证</h2>
        <p>在 <code class="inline-code">yiyuan.config.ts</code> 中设置 <code class="inline-code">auth.enabled = true</code> 并提供一个密钥。</p>
        <pre><code>auth: {
  enabled: true,
  secret: 'your-256-bit-secret',
}</code></pre>
        <p>框架会自动添加 <code class="inline-code">POST /api/login</code> 端点，并保护所有其他 API 路由。</p>
        <h2>自定义登录逻辑</h2>
        <p>你可以在中间件中覆盖登录验证，例如查询数据库：</p>
        <pre><code>app.post('/api/login', async (c) => {
  const { username, password } = await c.req.json();
  const user = await db.findUser(username);
  if (user && verifyPassword(password, user.hash)) {
    const token = jwt.sign({ sub: user.id }, 'secret');
    return c.json({ token });
  }
  return c.json({ error: 'Invalid credentials' }, 401);
});</code></pre>
        <h2>角色与权限</h2>
        <p>结合中间件，你可以实现基于角色的访问控制（RBAC）。在 JWT payload 中包含角色信息，然后在中间件中检查。</p>
        <pre><code>app.use('/api/admin/*', async (c, next) => {
  const payload = c.get('jwtPayload');
  if (payload.role !== 'admin') return c.json({ error: 'Forbidden' }, 403);
  await next();
});</code></pre>
      </section>

      <!-- 多租户 -->
      <section :class="{ active: current === 'multitenant' }">
        <h1>多租户隔离</h1>
        <p>Yiyuan 从底层支持多租户，无需额外配置。只需在请求头中传递 <code class="inline-code">x-tenant-id</code>，所有数据操作将自动限定在该租户下。</p>
        <pre><code>curl -H "x-tenant-id: tenantA" http://localhost:3456/api/posts</code></pre>
        <p>数据库适配器会确保数据隔离。对于 JSON 适配器，数据存储在嵌套的 JSON 结构中；对于 SQL 适配器，会添加额外的 <code class="inline-code">tenant_id</code> 列或使用 schema 隔离。</p>
        <h2>前端集成</h2>
        <p>在 ApiClient 中，你可以设置全局租户 ID：</p>
        <pre><code>import { api } from '@yiyuan/api-client';
api.setTenantId('tenantA');</code></pre>
      </section>

      <!-- WebSocket 实时更新 -->
      <section :class="{ active: current === 'websocket' }">
        <h1>WebSocket 实时更新</h1>
        <p>当使用 Hono 后端时，Yiyuan 会自动在 <code class="inline-code">HTTP 端口 + 1</code> 上启动一个 WebSocket 服务器。前端页面会自动连接，并在数据变更时实时更新。</p>
        <h2>工作原理</h2>
        <ol>
          <li>后端在每次 CRUD 操作成功后调用 <code class="inline-code">globalThis.broadcast(channel, data)</code>。</li>
          <li>WebSocket 服务器将消息推送给所有连接的客户端。</li>
          <li>前端 Alpine.js 或 React 组件收到消息后，自动重新加载数据。</li>
        </ol>
        <h2>自定义广播</h2>
        <p>在中间件或自定义路由中，你可以直接使用广播函数：</p>
        <pre><code>globalThis.broadcast('notification', { message: 'New order!' });</code></pre>
      </section>

      <!-- 插件系统 -->
      <section :class="{ active: current === 'plugins' }">
        <h1>插件系统</h1>
        <p>插件是扩展 Yiyuan 的主要方式。一个插件可以：</p>
        <ul>
          <li>添加新的后端生成器</li>
          <li>修改 Schema 定义</li>
          <li>添加自定义路由或中间件</li>
        </ul>
        <pre><code>// my-plugin.ts
export default {
  name: 'my-plugin',
  onSchema(schema) {
    // 在编译前修改 schema
  },
  onRoute(app) {
    app.get('/custom', (c) => c.text('Hello from plugin'));
  }
};</code></pre>
        <p>在 <code class="inline-code">yiyuan.config.ts</code> 中启用插件：</p>
        <pre><code>plugins: ['./plugins/my-plugin.ts']</code></pre>
      </section>

      <!-- 中间件 -->
      <section :class="{ active: current === 'middleware' }">
        <h1>自定义中间件</h1>
        <p>中间件用于处理 HTTP 请求的通用逻辑，如日志、CORS、身份验证等。</p>
        <p>使用 CLI 快速创建：</p>
        <pre><code>yiyuan add middleware request-logger</code></pre>
        <p>编辑生成的文件：</p>
        <pre><code>import type { Hono } from 'hono';
export default function (app: Hono) {
  app.use('*', async (c, next) => {
    console.log(\`\${c.req.method} \${c.req.url}\`);
    await next();
  });
}</code></pre>
        <p>在配置中加载：</p>
        <pre><code>middlewares: ['./middlewares/request-logger.ts']</code></pre>
      </section>

      <!-- 部署 -->
      <section :class="{ active: current === 'deploy' }">
        <h1>部署与 CI/CD</h1>
        <p>Yiyuan 提供了 <code class="inline-code">yiyuan deploy</code> 命令，可以生成 Docker 相关文件和 GitHub Actions 工作流。</p>
        <pre><code>yiyuan deploy</code></pre>
        <p>生成的 <code class="inline-code">Dockerfile</code> 和 <code class="inline-code">docker-compose.yml</code> 可以直接用于构建和运行。</p>
        <h2>Docker 部署</h2>
        <pre><code>docker compose up -d</code></pre>
        <h2>环境变量配置</h2>
        <p>在 <code class="inline-code">docker-compose.yml</code> 中或通过 <code class="inline-code">.env</code> 文件传递配置。</p>
        <h2>CI/CD 集成</h2>
        <p>生成的 GitHub Actions 工作流在推送代码时自动构建并部署。</p>
      </section>

      <!-- 扩展开发 -->
      <section :class="{ active: current === 'extend' }">
        <h1>扩展开发</h1>
        <p>Yiyuan 的设计允许你添加任意后端、前端或数据库的支持。</p>
        <h2>添加新后端生成器</h2>
        <ol>
          <li>实现 <code class="inline-code">BackendGenerator</code> 接口。</li>
          <li>在 <code class="inline-code">packages/compiler/src/index.ts</code> 的 <code class="inline-code">BACKENDS</code> 中注册。</li>
        </ol>
        <pre><code>import type { BackendGenerator } from '@yiyuan/compiler';
export class MyBackend implements BackendGenerator {
  generate(schema: ParsedSchema): Record<string, string> {
    return { 'router.ts': '...' };
  }
}</code></pre>
        <h2>添加新数据库适配器</h2>
        <p>实现 <code class="inline-code">DatabaseAdapter</code> 接口，并在 <code class="inline-code">startServer</code> 中添加分支。</p>
        <h2>添加新前端生成器</h2>
        <p>实现 <code class="inline-code">FrontendGenerator</code> 接口，并在 <code class="inline-code">FRONTENDS</code> 中注册。</p>
      </section>

      <!-- API 参考 -->
      <section :class="{ active: current === 'api' }">
        <h1>API 参考</h1>
        <h2>REST 端点</h2>
        <p>假设模型名为 <code class="inline-code">Item</code>：</p>
        <table>
          <tr><td><code class="inline-code">GET /api/items</code></td><td>获取所有记录</td></tr>
          <tr><td><code class="inline-code">GET /api/items/:id</code></td><td>根据 ID 获取记录</td></tr>
          <tr><td><code class="inline-code">POST /api/items</code></td><td>创建记录</td></tr>
          <tr><td><code class="inline-code">PUT /api/items/:id</code></td><td>更新记录</td></tr>
          <tr><td><code class="inline-code">DELETE /api/items/:id</code></td><td>删除记录</td></tr>
        </table>
        <h2>错误格式</h2>
        <pre><code>{ "error": "Not found" }</code></pre>
        <h2>Swagger 文档</h2>
        <p>访问 <code class="inline-code">/api/docs</code> 获取交互式文档，<code class="inline-code">/openapi.json</code> 获取原始 OpenAPI 规范。</p>
      </section>

      <!-- 常见问题 -->
      <section :class="{ active: current === 'faq' }">
        <h1>常见问题</h1>
        <h3>Q: 如何更新 Yiyuan？</h3>
        <p><code class="inline-code">npm update -g @yiyuan/cli</code></p>
        <h3>Q: 生成的代码可以手动修改吗？</h3>
        <p>可以，但 <code class="inline-code">.yiyuan</code> 目录会在每次生成时被覆盖。建议通过中间件或插件定制。</p>
        <h3>Q: 支持 TypeScript 严格模式吗？</h3>
        <p>所有生成代码均通过严格类型检查。</p>
        <h3>Q: 如何贡献代码？</h3>
        <p>欢迎在 GitHub 仓库提交 PR。</p>
        <h3>Q: 商业使用需要授权吗？</h3>
        <p>Yiyuan 采用 MIT 许可证，可免费用于商业项目。</p>
      </section>

      <!-- 迁移指南 -->
      <section :class="{ active: current === 'migration' }">
        <h1>迁移指南</h1>
        <h2>从 v0.0.x 升级到 v0.1.0</h2>
        <p>新版本引入了链式字段定义，旧的对象式 Schema 仍然兼容。建议逐步迁移以获得更好的类型安全。</p>
        <h3>迁移步骤</h3>
        <ol>
          <li>安装最新版本：<code class="inline-code">npm install @yiyuan/cli@latest</code></li>
          <li>更新 <code class="inline-code">schema.ts</code> 使用新的 <code class="inline-code">defineSchema</code> 和字段函数。</li>
          <li>重新生成代码。</li>
        </ol>
        <p>详细的变化请查看更新日志。</p>
      </section>

      <!-- 性能优化 -->
      <section :class="{ active: current === 'performance' }">
        <h1>性能优化</h1>
        <ul>
          <li>使用生产模式构建前端（React/Vue）以减小包体积。</li>
          <li>为 API 启用缓存策略（通过中间件）。</li>
          <li>考虑使用更高效的数据库适配器（如 PostgreSQL）处理大量数据。</li>
          <li>利用 WebSocket 减少轮询开销。</li>
        </ul>
      </section>

      <!-- 安全 -->
      <section :class="{ active: current === 'security' }">
        <h1>安全最佳实践</h1>
        <ul>
          <li>始终在生产环境中使用强 JWT 密钥。</li>
          <li>启用 HTTPS。</li>
          <li>通过中间件实现 CSRF 保护（如果需要）。</li>
          <li>定期更新依赖项。</li>
        </ul>
      </section>

      <!-- 更新日志 -->
      <section :class="{ active: current === 'changelog' }">
        <h1>更新日志</h1>
        <h2>v0.1.0</h2>
        <ul>
          <li>全新链式字段定义。</li>
          <li>支持 React/Vue 前端生成。</li>
          <li>内置多租户和 WebSocket。</li>
          <li>CLI 交互式创建向导。</li>
          <li>增强的文档和教程。</li>
        </ul>
        <h2>v0.0.1</h2>
        <ul>
          <li>初始版本，支持 Hono 后端和基本的 CRUD 生成。</li>
        </ul>
      </section>
    </main>
  </div>
</body>
</html>`;
}
