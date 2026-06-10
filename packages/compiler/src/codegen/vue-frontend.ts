import type { ParsedSchema } from '@yiyuan/core';
import type { FrontendGenerator } from './frontend-interface';

export class VueFrontend implements FrontendGenerator {
  generate(schema: ParsedSchema, options?: { locale?: string; ui?: string }): Record<string, string> {
    const files: Record<string, string> = {};
    const modelNames = Object.keys(schema.models);

    for (const model of modelNames) {
      const fields = Object.keys(schema.models[model].fields);
      const lower = model.toLowerCase();
      const component = `
<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="!items.length">No data</div>
  <table v-else>
    <thead>
      <tr>
        ${fields.map(f => `<th>${f}</th>`).join('\n        ')}
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in items" :key="item.id">
        ${fields.map(f => `<td>{{ item.${f} }}</td>`).join('\n        ')}
        <td>
          <button @click="editItem(item)">Edit</button>
          <button @click="deleteItem(item.id)">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  data() {
    return { items: [], loading: true };
  },
  mounted() {
    fetch('/api/${lower}s')
      .then(res => res.json())
      .then(data => { this.items = data; this.loading = false; });
  },
  methods: {
    async deleteItem(id) {
      await fetch('/api/${lower}s/' + id, { method: 'DELETE' });
      this.items = this.items.filter(i => i.id !== id);
    }
  }
};
</script>
`;
      files[`src/components/${model}List.vue`] = component;
    }

    // App.vue
    const appVue = `
<template>
  <nav>
    ${modelNames.map(m => `<router-link to="/${m.toLowerCase()}s">${m}</router-link>`).join('\n    ')}
  </nav>
  <router-view />
</template>

<script>
export default {};
</script>
`;
    files['src/App.vue'] = appVue;

    // main.js
    files['src/main.js'] = `
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
${modelNames.map(m => `import ${m}List from './components/${m}List.vue';`).join('\n')}

const routes = [
  ${modelNames.map(m => `{ path: '/${m.toLowerCase()}s', component: ${m}List }`).join(',\n  ')}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

createApp(App).use(router).mount('#app');
`;

    files['package.json'] = JSON.stringify({
      name: 'yiyuan-vue-frontend',
      version: '1.0.0',
      scripts: {
        dev: 'vite --port 5173',
        build: 'vite build',
      },
      dependencies: {
        vue: '^3.4.0',
        'vue-router': '^4.3.0',
      },
      devDependencies: {
        vite: '^5.0.0',
        '@vitejs/plugin-vue': '^5.0.0',
      },
    }, null, 2);

    files['vite.config.js'] = `
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': 'http://localhost:3456',
    },
  },
});
`;

    return files;
  }
}
