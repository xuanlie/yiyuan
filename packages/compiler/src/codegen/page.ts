import type { ParsedSchema } from '@yiyuan/core';

const lang: Record<string, Record<string, string>> = {
  zh: { title: '一元管理后台', subtitle: 'Schema 驱动的全栈应用', loading: '加载中...', noData: '暂无数据', createFirst: '创建第一个', create: '新增', edit: '编辑', delete: '删除', cancel: '取消', save: '保存', update: '更新', confirm: '确认删除？' },
  en: { title: 'Yiyuan Admin', subtitle: 'Schema-driven Fullstack App', loading: 'Loading...', noData: 'No data', createFirst: 'Create first', create: 'Create', edit: 'Edit', delete: 'Delete', cancel: 'Cancel', save: 'Save', update: 'Update', confirm: 'Confirm delete?' },
};

function t(locale: string, key: string) {
  return lang[locale]?.[key] || lang.en[key] || key;
}

export function generateFullPage(schema: ParsedSchema, ui: string = 'tailwind', locale: string = 'zh'): string {
  const models = Object.keys(schema.models);
  const title = t(locale, 'title');

  let headLinks = '';
  if (ui === 'tailwind') {
    headLinks = '<script src="https://cdn.tailwindcss.com"><\/script>';
  } else if (ui === 'antd') {
    headLinks = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/antd@5/dist/reset.css">';
  }

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${headLinks}
  <style>
    body { font-family: system-ui; margin: 0; }
    #particles { position: fixed; top:0; left:0; width:100%; height:100%; z-index:-1; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .card { backdrop-filter: blur(10px); background: rgba(255,255,255,0.9); }
  </style>
</head>
<body>
  <div id="particles"><canvas id="canvas"></canvas></div>
  <div class="max-w-7xl mx-auto p-4 sm:p-6 relative z-10">
    <div class="text-center mb-8">
      <h1 class="text-5xl font-bold text-white drop-shadow-lg">${title}</h1>
      <p class="text-gray-200 mt-2">${t(locale, 'subtitle')}</p>
    </div>
    <div class="flex flex-wrap gap-4 mb-6">
      ${models.map(m => `<button onclick="showModel('${m}')" class="px-5 py-2 rounded-full text-white font-medium bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30">${m}</button>`).join('')}
    </div>
    <div id="app" class="card rounded-2xl shadow-2xl p-4 sm:p-6">
      <div id="loading" class="text-center text-gray-400 py-12">${t(locale, 'loading')}</div>
      <div id="content" class="hidden"></div>
    </div>
  </div>
  <script>
    const locale = '${locale}';
    const lang = ${JSON.stringify(lang[locale] || lang.en)};
    function t(key) { return lang[key] || key; }
    const models = ${JSON.stringify(models)};
    let currentModel = null;

    // WebSocket 实时更新
    const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = wsProtocol + '//' + location.hostname + ':' + (parseInt(location.port) + 1);
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.channel === 'dataChange' && msg.data.model === currentModel) loadData();
    };

    window.showModel = (name) => {
      currentModel = name;
      loadData();
    };

    async function loadData() {
      document.getElementById('loading').classList.remove('hidden');
      document.getElementById('content').classList.add('hidden');
      try {
        const res = await fetch('/api/' + currentModel.toLowerCase() + 's');
        const items = await res.json();
        renderTable(items);
      } catch(e) {
        document.getElementById('content').innerHTML = '<p class="text-red-500">加载失败: ' + e.message + '</p>';
      } finally {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('content').classList.remove('hidden');
      }
    }

    function renderTable(items) {
      if (!items || items.length === 0) {
        document.getElementById('content').innerHTML = '<p class="text-gray-400">' + t('noData') + '</p><button onclick="createItem()" class="mt-2 px-4 py-2 bg-indigo-600 text-white rounded">' + t('createFirst') + '</button>';
        return;
      }
      const keys = Object.keys(items[0]).filter(k => k !== 'id' && k !== 'createdAt' && k !== 'updatedAt');
      let html = '<div class="overflow-x-auto"><table class="min-w-full divide-y divide-gray-200"><thead><tr>';
      html += '<th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>';
      keys.forEach(k => html += '<th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">' + k + '</th>');
      html += '<th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">操作</th></tr></thead><tbody>';
      items.forEach(item => {
        html += '<tr class="border-t">';
        html += '<td class="px-4 py-2 text-sm text-gray-500">' + (item.id || '') + '</td>';
        keys.forEach(k => html += '<td class="px-4 py-2 text-sm">' + (item[k] ?? '') + '</td>');
        html += '<td class="px-4 py-2 text-right text-sm"><button onclick="editItem(\'' + item.id + '\')" class="text-indigo-600 hover:text-indigo-900 mr-2">' + t('edit') + '</button><button onclick="deleteItem(\'' + item.id + '\')" class="text-red-600 hover:text-red-900">' + t('delete') + '</button></td>';
        html += '</tr>';
      });
      html += '</tbody></table></div>';
      html += '<button onclick="createItem()" class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">' + t('create') + '</button>';
      document.getElementById('content').innerHTML = html;
    }

    // 省略模态框 CRUD 函数，保持原样（与前面版本相同）
    window.createItem = () => {
      const keys = getSchemaKeys();
      let formHtml = '<div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"><div class="bg-white rounded-lg p-6 w-full max-w-md"><h2 class="text-lg font-bold mb-4">' + t('create') + '</h2>';
      keys.forEach(k => {
        formHtml += '<div class="mb-3"><label class="block text-sm font-medium text-gray-700">' + k + '</label><input name="' + k + '" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>';
      });
      formHtml += '<div class="flex justify-end gap-2"><button onclick="this.parentElement.parentElement.parentElement.remove()" class="px-4 py-2 border rounded-md">' + t('cancel') + '</button><button onclick="submitCreate(this)" class="px-4 py-2 bg-indigo-600 text-white rounded-md">' + t('save') + '</button></div></div></div>';
      document.getElementById('app').insertAdjacentHTML('beforeend', formHtml);
    };

    window.submitCreate = async (btn) => {
      const modal = btn.parentElement.parentElement.parentElement;
      const inputs = modal.querySelectorAll('input');
      const data = {};
      inputs.forEach(i => data[i.name] = i.value);
      await fetch('/api/' + currentModel.toLowerCase() + 's', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });
      modal.remove();
      loadData();
    };

    window.editItem = async (id) => {
      const res = await fetch('/api/' + currentModel.toLowerCase() + 's/' + id);
      const item = await res.json();
      const keys = getSchemaKeys();
      let formHtml = '<div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"><div class="bg-white rounded-lg p-6 w-full max-w-md"><h2 class="text-lg font-bold mb-4">' + t('edit') + '</h2>';
      keys.forEach(k => {
        formHtml += '<div class="mb-3"><label class="block text-sm font-medium text-gray-700">' + k + '</label><input name="' + k + '" value="' + (item[k] || '') + '" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" /></div>';
      });
      formHtml += '<div class="flex justify-end gap-2"><button onclick="this.parentElement.parentElement.parentElement.remove()" class="px-4 py-2 border rounded-md">' + t('cancel') + '</button><button onclick="submitUpdate(this, \'' + id + '\')" class="px-4 py-2 bg-indigo-600 text-white rounded-md">' + t('update') + '</button></div></div></div>';
      document.getElementById('app').insertAdjacentHTML('beforeend', formHtml);
    };

    window.submitUpdate = async (btn, id) => {
      const modal = btn.parentElement.parentElement.parentElement;
      const inputs = modal.querySelectorAll('input');
      const data = {};
      inputs.forEach(i => data[i.name] = i.value);
      await fetch('/api/' + currentModel.toLowerCase() + 's/' + id, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });
      modal.remove();
      loadData();
    };

    window.deleteItem = async (id) => {
      if (!confirm(t('confirm'))) return;
      await fetch('/api/' + currentModel.toLowerCase() + 's/' + id, { method: 'DELETE' });
      loadData();
    };

    function getSchemaKeys() {
      return Object.keys(${JSON.stringify(models.reduce((acc, m) => ({...acc, ...schema.models[m]?.fields}), {}))});
    }

    if (models.length) showModel(models[0]);
  </script>
</body>
</html>`;
}
