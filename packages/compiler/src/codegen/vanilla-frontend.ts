import type { ParsedSchema } from '@yiyuan/core';
import type { FrontendGenerator } from './frontend-interface';

export class VanillaFrontend implements FrontendGenerator {
  generate(schema: ParsedSchema, options?: { locale?: string; ui?: string }): Record<string, string> {
    const locale = options?.locale || 'zh';
    const modelNames = Object.keys(schema.models);
    const firstModel = modelNames[0] || '';
    const firstFields = firstModel ? Object.keys(schema.models[firstModel].fields) : [];

    const html = `<!DOCTYPE html>
<html lang="${locale}" x-data="app()" x-init="init('${firstModel}')">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yiyuan Admin</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.13.5/dist/cdn.min.js"></script>
  <style>
    :root { --pico-primary: #6366f1; --pico-border-radius: 0.75rem; }
    body > main { padding-top: 2rem; }
    nav ul { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    nav li { list-style: none; }
    nav a { padding: 0.5rem 1rem; border-radius: var(--pico-border-radius); text-decoration: none; transition: all 0.2s; }
    nav a:hover { background: var(--pico-primary); color: white; }
    .empty { text-align: center; padding: 2rem; opacity: 0.6; }
    dialog article { min-width: 300px; }
  </style>
</head>
<body>
  <main class="container">
    <hgroup>
      <h1>Yiyuan Admin</h1>
      <p>Schema 驱动的全栈应用</p>
    </hgroup>

    <nav>
      <ul>
        ${modelNames.map(m => `
        <li>
          <a href="#" @click.prevent="switchModel('${m}')"
             :style="currentModel === '${m}' ? { background: 'var(--pico-primary)', color: 'white' } : {}">
            ${m}
          </a>
        </li>`).join('')}
      </ul>
    </nav>

    <p aria-busy="true" x-show="loading" style="text-align:center">加载中...</p>
    <p x-show="!loading && items.length === 0" class="empty">暂无数据</p>

    <figure x-show="!loading && items.length > 0">
      <table>
        <thead>
          <tr>
            ${firstFields.map(f => `<th>${f}</th>`).join('')}
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <template x-for="item in items" :key="item.id">
            <tr>
              ${firstFields.map(f => `<td x-text="item.${f}"></td>`).join('')}
              <td>
                <button @click="openEdit(item)" class="secondary">编辑</button>
                <button @click="deleteItem(item.id)" class="contrast">删除</button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </figure>

    <button @click="openCreate()" x-show="!loading">新增</button>

    <dialog :open="showForm">
      <article>
        <header>
          <h2 x-text="editingItem ? '编辑' : '新建'"></h2>
        </header>
        ${firstFields.filter(f => f !== 'id').map(f => `
        <label>${f}
          <input x-model="form.${f}">
        </label>`).join('')}
        <footer>
          <button @click="showForm=false" class="secondary">取消</button>
          <button @click="submitForm()" x-text="editingItem ? '更新' : '保存'"></button>
        </footer>
      </article>
    </dialog>
  </main>

  <script>
    function app() {
      return {
        currentModel: '',
        items: [],
        loading: false,
        showForm: false,
        editingItem: null,
        form: {},

        async init(model) {
          this.currentModel = model;
          await this.loadData();
          const ws = new WebSocket('ws://' + location.hostname + ':' + (parseInt(location.port) + 1));
          ws.onmessage = (e) => {
            const msg = JSON.parse(e.data);
            if (msg.channel === 'dataChange' && msg.data.model === this.currentModel) this.loadData();
          };
        },

        switchModel(model) {
          this.currentModel = model;
          this.loadData();
        },

        async loadData() {
          this.loading = true;
          try {
            const res = await fetch('/api/' + this.currentModel.toLowerCase() + 's');
            this.items = await res.json();
          } finally { this.loading = false; }
        },

        openCreate() {
          this.editingItem = null;
          this.form = {};
          this.showForm = true;
        },

        openEdit(item) {
          this.editingItem = item;
          this.form = { ...item };
          this.showForm = true;
        },

        async submitForm() {
          const model = this.currentModel.toLowerCase();
          const url = this.editingItem ? '/api/' + model + 's/' + this.editingItem.id : '/api/' + model + 's';
          const method = this.editingItem ? 'PUT' : 'POST';
          await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(this.form) });
          this.showForm = false;
          await this.loadData();
        },

        async deleteItem(id) {
          if (!confirm('确认删除？')) return;
          await fetch('/api/' + this.currentModel.toLowerCase() + 's/' + id, { method: 'DELETE' });
          await this.loadData();
        }
      };
    }
  </script>
</body>
</html>`;

    return { 'index.html': html };
  }
}
