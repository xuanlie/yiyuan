import type { ParsedSchema } from '@yiyuan/core';

export function generateApiOverviewPage(schema: ParsedSchema): string {
  const models = Object.entries(schema.models);
  const modelListHtml = models.map(([name, def]) => {
    const lower = name.toLowerCase();
    const fields = Object.entries(def.fields)
      .map(([fname, f]) => `<tr><td><code>${fname}</code></td><td>${f.type}</td><td>${f.required ? '是' : '否'}</td></tr>`)
      .join('');
    return `
    <details>
      <summary><strong>${name}</strong></summary>
      <table><thead><tr><th>字段</th><th>类型</th><th>必填</th></tr></thead><tbody>${fields}</tbody></table>
      <h4>API 端点</h4>
      <ul>
        <li><code>GET /api/${lower}s</code></li>
        <li><code>GET /api/${lower}s/:id</code></li>
        <li><code>POST /api/${lower}s</code></li>
        <li><code>PUT /api/${lower}s/:id</code></li>
        <li><code>DELETE /api/${lower}s/:id</code></li>
      </ul>
    </details>`;
  }).join('<hr>');

  // 生成完整提示词（含 ApiClient 使用示例）
  const prompt = `以下是一个 Yiyuan 项目的所有数据模型和 API。你生成的代码应使用 \`api\` 对象（ApiClient 实例）进行请求，该对象已自动处理 JWT 认证和多租户。\n\n导入方式：\nimport { api } from './.yiyuan/api-client';\n\n模型：\n`
    + models.map(([name, def]) => 
        `${name}: 字段 ${JSON.stringify(Object.keys(def.fields))}，方法 api.get${name}s(), api.get${name}(id), api.create${name}(data), api.update${name}(id, data), api.delete${name}(id)`
      ).join('\n');

  return `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API 概览 - Yiyuan</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
  <style>
    body > main { max-width: 900px; margin: auto; padding: 2rem; }
    pre { background: #1e293b; color: #a5b4fc; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    textarea { width: 100%; height: 200px; font-family: monospace; font-size: 0.85rem; display: none; }
  </style>
</head>
<body>
  <main>
    <h1>API 概览 & AI 提示词</h1>
    <h2>模型列表</h2>
    ${modelListHtml}

    <h2>开箱即用的 ApiClient</h2>
    <p>SDK 已包含登录、token 管理、多租户支持。使用示例：</p>
    <pre><code>import { api } from './.yiyuan/api-client';

// 登录
await api.login('admin', 'admin');

// 获取列表
const posts = await api.getPosts();

// 创建
await api.createPost({ title: 'Hello', content: '...' });

// 设置多租户
window.__YIYUAN_TENANT__ = 'tenantA';</code></pre>

    <h2>复制给 AI 的提示词</h2>
    <button onclick="togglePrompt()">显示/隐藏</button>
    <textarea id="ai-prompt" readonly>${prompt.replace(/</g, '&lt;')}</textarea>
    <button onclick="copyToClipboard()">一键复制</button>
  </main>
  <script>
    function togglePrompt() {
      const ta = document.getElementById('ai-prompt');
      ta.style.display = ta.style.display === 'block' ? 'none' : 'block';
    }
    function copyToClipboard() {
      const ta = document.getElementById('ai-prompt');
      ta.style.display = 'block';
      ta.select();
      document.execCommand('copy');
      alert('已复制！');
    }
  </script>
</body>
</html>`;
}
