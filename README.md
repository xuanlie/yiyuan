Yiyuan (一元) - Schema-Driven Fullstack Framework

一个 Schema 定义，一键生成多语言后端 API、管理后台、Swagger 文档、前端 SDK。
生成的标准项目代码可自由编辑，也支持 AI 直接修改和扩展——不只生成，更能演进。

---

目录

· 特性
· 快速开始
· 安装 CLI
· 创建项目
· 定义数据模型（Schema）
· 配置文件
· 启动开发服务器
· 后端生成器
· 前端生成器
· 数据库适配器
· 认证 (JWT)
· 多租户隔离
· WebSocket 实时更新
· 中间件系统
· 插件系统
· 可视化 Schema 编辑器
· API 客户端 SDK
· AI 协作开发
· 部署与 CI/CD
· 命令行参考
· 项目架构
· 扩展开发
· 常见问题

---

特性

· 🚀 多语言后端生成：支持 Hono、Express、Koa、Fastify、NestJS、FastAPI、Flask、Django、Gin、Fiber、GraphQL 等 11 种后端框架，一键生成完整的 CRUD API 项目。
· 🎨 多模式前端生成：自动生成 Alpine.js + Pico.css 管理页面，或生成完整的 React / Vue 前端工程（含登录、仪表盘、CRUD 页面）。生成的代码为标准项目结构，可像普通项目一样自由修改，或交给 AI 继续优化。
· 🗄️ 多数据库适配：内置 JSON、SQLite、PostgreSQL、MySQL、MongoDB、Redis 适配器，动态切换。
· 🔐 JWT 认证：开箱即用的登录鉴权，结合中间件可自定义验证逻辑。
· 👥 多租户隔离：通过请求头 x-tenant-id 自动隔离数据，无需额外编码。
· 📡 WebSocket 实时推送：数据变更自动广播，前端页面实时刷新。
· 🧩 中间件 & 插件系统：灵活扩展，可添加自定义请求处理、业务逻辑或新的生成器。
· 📚 Swagger 自动文档：生成 OpenAPI 3.0 规范，附带 Swagger UI 在线调试。
· 🛠️ CLI 工具：交互式创建项目、生成代码、开发调试、部署一体化。
· 🧠 AI 深度友好：自动生成强类型 API 客户端和 AI 提示词。生成的前后端代码可完全交由 AI 进行二次修改、功能扩展或定制。
· 🐳 容器化部署：一键生成 Dockerfile 和 CI/CD 配置。

核心理念：框架给你一个高质量的起点，之后的任何修改（手写或 AI）都和普通项目一样自由。

---

快速开始

```bash
# 全局安装 CLI
npm install -g @yiyuan/cli

# 创建项目（交互式向导）
yiyuan create my-app
cd my-app

# 启动开发服务器
yiyuan dev
```

浏览器访问：

· 管理后台：http://localhost:3456
· Swagger 文档：http://localhost:3456/api/docs

启动后你看到的所有文件都可以直接编辑，AI 也能理解并修改它们。

---

安装 CLI

```bash
npm install -g @yiyuan/cli    # npm
pnpm add -g @yiyuan/cli       # pnpm
yarn global add @yiyuan/cli   # yarn
```

要求 Node.js >= 18，推荐 pnpm。

---

创建项目

交互式创建（推荐新手）：

```bash
yiyuan create my-app
```

向导将询问后端框架、数据库、前端模式等。

手动初始化：

```bash
mkdir my-app && cd my-app
yiyuan init
```

这会生成 schema.ts 和 yiyuan.config.ts 模板。

---

定义数据模型（Schema）

编辑 schema.ts，使用链式字段定义模型：

```ts
import { defineSchema, string, text, number, auto, timestamp, enumOf, hasMany, hasOne } from '@yiyuan/core';

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
});
```

可用字段类型：

字段函数 说明
string() 字符串
text() 长文本
number() 浮点数
integer() 整数
boolean() 布尔值
auto() 自增主键
timestamp() 时间戳
enumOf(...values) 枚举值
hasOne('Model') 一对一关联
hasMany('Model') 一对多关联

字段支持链式修饰：string().required().default('hello').searchable().unique()。

---

配置文件

项目根目录下的 yiyuan.config.ts 控制所有行为。所有字段可选。

```ts
import type { YiyuanConfig } from '@yiyuan/core';

const config: YiyuanConfig = {
  backend: 'hono',              // 后端框架
  datasource: {
    provider: 'json',           // 数据库类型
    url: '.yiyuan/data',
  },
  frontend: 'vanilla',          // 前端模式：vanilla | react | vue
  server: {
    port: 3456,
    banner: 'colorful',         // 启动 Banner 风格
  },
  auth: {
    enabled: false,             // 是否启用 JWT 认证
    secret: 'your-secret-key',
  },
  outDir: '.yiyuan',            // 生成文件输出目录
  ui: 'modern',
  locale: 'zh',                 // 界面语言
  middlewares: [],              // 自定义中间件
  plugins: [],                  // 插件
};

export default config;
```

环境变量覆盖：DATABASE_PROVIDER, DATABASE_URL, PORT, AUTH_SECRET。

---

启动开发服务器

```bash
yiyuan dev
```

框架会自动编译 Schema，生成后端代码和前端页面，然后启动 Hono 服务器。终端会显示彩色请求日志。

生成后的代码都在 .yiyuan/ 和 frontend/ 目录中，你可以用任何编辑器打开它们，也可以让 AI 读取并修改这些文件。

---

后端生成器

Yiyuan 支持 11 种后端框架，通过 backend 配置切换：

语言 框架
TypeScript Hono, Express, Koa, Fastify, NestJS
Python FastAPI, Flask, Django
Go Gin, Fiber
GraphQL Apollo Server

每次切换后运行 yiyuan dev 或 yiyuan generate 即可生成对应风格的代码。生成的代码是标准的项目文件（如 Express 的 router.ts、FastAPI 的 main.py），完全可以人工调整或让 AI 进行二次开发。

---

前端生成器

三种前端模式，通过 frontend 配置选择：

· vanilla（默认）：Alpine.js + Pico.css 单页面应用，零构建，开箱即用。
· react：生成 Vite + React + Ant Design 项目，包含登录、仪表盘、CRUD 页面。项目结构、组件、路由、API 调用全部标准化，AI 可以直接识别并修改。
· vue：生成 Vite + Vue 3 + Vue Router 项目。

React/Vue 项目生成在 frontend/ 目录，进入后执行 npm install && npm run dev 即可启动。之后你可以把整个 frontend/ 文件夹交给 AI，让它帮你添加复杂页面、图表、权限控制等。

---

数据库适配器

内置 6 种适配器，通过 datasource.provider 切换：

适配器 说明
json 本地 JSON 文件，零依赖
sqlite SQLite 数据库（需安装 better-sqlite3）
postgres PostgreSQL（需安装 pg）
mysql MySQL（需安装 mysql2）
mongodb MongoDB（需安装 mongodb）
redis Redis（需安装 redis）

所有适配器实现统一接口，无需修改业务代码。数据库层同样暴露清晰的接口，AI 可以基于这些接口添加缓存、日志等逻辑。

---

认证 (JWT)

启用认证：

```ts
auth: { enabled: true, secret: 'your-secret' }
```

框架会自动添加 POST /api/login 端点，并保护所有 API。默认凭据 admin / admin，可通过中间件自定义。生成的认证代码（如 JWT 验证中间件）完全透明，AI 可以轻松修改为 OAuth2、SSO 等高级认证方案。

---

多租户隔离

在请求头中传递 x-tenant-id，数据将自动隔离：

```bash
curl -H "x-tenant-id: tenantA" http://localhost:3456/api/posts
```

无需额外配置。隔离逻辑位于适配器层，AI 可以查看并优化这些底层实现。

---

WebSocket 实时更新

Hono 后端会自动启动 WebSocket 服务（HTTP 端口 + 1）。前端页面自动连接，数据变化时实时刷新。
自定义广播：globalThis.broadcast('channel', data)。WebSocket 部分的代码也完全开放给 AI 进行扩展（如消息过滤、房间管理等）。

---

中间件系统

创建中间件：

```bash
yiyuan add middleware my-logger
```

编辑 middlewares/my-logger.ts，实现 (app: Hono) => void 函数。在配置中引用：

```ts
middlewares: ['./middlewares/my-logger.ts']
```

中间件文件是独立的 TypeScript 文件，可以直接由 AI 进行修改或生成新的中间件。

---

插件系统

插件可以扩展生成器、修改 Schema、添加路由等。示例：

```ts
export default {
  name: 'my-plugin',
  onRoute(app) { app.get('/custom', (c) => c.text('Hello')); }
};
```

在配置中启用：plugins: ['./plugins/my-plugin.ts']。插件系统的开放设计允许 AI 编写全新的功能模块。

---

可视化 Schema 编辑器

启动服务器后访问 /schema-editor，提供拖拽排序、字段类型选择、代码生成、JSON 导入导出等功能。生成的 Schema 代码可直接放回 schema.ts，AI 也可以根据导出的 JSON 自动维护 Schema。

---

API 客户端 SDK

框架自动生成强类型的 API 客户端（.yiyuan/api-client/index.ts），提供 api.login(), api.getPosts(), api.createPost(data) 等方法，自动处理 token 和租户 ID。这个客户端是标准的 TypeScript 模块，AI 可以直接引用并在此基础上构建复杂的数据交互逻辑。

---

AI 协作开发

Yiyuan 从设计之初就为 AI 深度协作做好准备。

1. 生成标准代码：所有前后端代码都是真实项目中可读、可维护的文件，与手写代码无异。
2. 一键 AI 提示词：访问 /api-overview 页面，复制包含完整数据模型、API 端点、类型定义的提示词，直接粘贴给 ChatGPT、Copilot 等 AI 工具。
3. AI 修改生成代码：将 .yiyuan/handlers/、frontend/src/ 等目录的文件交给 AI，可以要求它：
   · 添加字段校验逻辑
   · 实现复杂查询接口
   · 创建仪表盘图表
   · 重构组件为自定义设计
   · 集成第三方服务
4. 迭代开发：修改 Schema 后重新生成，AI 可以基于 diff 更新前端页面或后端逻辑，实现人机协同的持续开发。

简单来说，Yiyuan 负责“搭建骨架”，你和 AI 负责“填充血肉”，整个过程无缝衔接。

---

部署与 CI/CD

生成部署文件：

```bash
yiyuan deploy
```

会生成 Dockerfile、docker-compose.yml、.github/workflows/deploy.yml。然后执行：

```bash
docker compose up -d
```

这些部署文件同样可以被 AI 优化，比如添加健康检查、环境变量注入、多阶段构建等。

---

命令行参考

命令 说明
yiyuan init [dir] 初始化项目
yiyuan create 交互式创建项目
yiyuan generate [schema] 生成代码
yiyuan dev [schema] 启动开发服务器
yiyuan generate-frontend 生成 React/Vue 前端项目
yiyuan add middleware <name> 创建中间件
yiyuan deploy 生成部署文件

---

项目架构

```
yiyuan/
├── packages/
│   ├── core        # Schema 定义、配置类型
│   ├── compiler    # 代码生成引擎（后端、前端、测试）
│   ├── server      # 运行时服务器、数据库适配器
│   └── cli         # 命令行工具
├── playground/     # 开发示例
├── examples/       # 示例项目
└── docs/           # 文档
```

框架本身采用 monorepo 结构，核心代码也完全可以由 AI 分析和修改，如果你需要定制框架行为。

---

扩展开发

Yiyuan 支持自定义扩展，你可以实现以下接口来添加新的生成器或适配器：

· BackendGenerator：新后端框架生成器
· FrontendGenerator：新前端模式生成器
· DatabaseAdapter：新数据库适配器

实现后在编译器中注册，即可通过配置使用。这些扩展也可以用 AI 辅助编写。

---

常见问题

Q: 生成的代码可以手动修改吗？
A: 可以，而且强烈建议修改。生成代码是干净的模板，你（或 AI）可以任意调整以满足业务需求。重新生成时只会覆盖 .yiyuan 和生成目录，不影响你额外编写的文件。

Q: 支持 TypeScript 吗？
A: 所有生成代码均为 TypeScript，且通过严格类型检查。

Q: 商业使用需要授权吗？
A: Yiyuan 采用 MIT 许可证，可免费用于商业项目。

Q: 如何更新 Yiyuan？
A: npm update -g @yiyuan/cli

Q: AI 真的能理解生成的代码吗？
A: 完全可以。生成的代码遵循各框架的标准模式和最佳实践，AI 可以像理解手写代码一样理解它们，并进行增删改查。

---

Yiyuan — 让生成代码成为起点，而非终点。
