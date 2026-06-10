export function generateSchemaEditorPage(): string {
  return `<!DOCTYPE html>
<html lang="zh" x-data="editor" x-init="init()">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Schema 编辑器 - Yiyuan</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.13.5/dist/cdn.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
  <style>
    :root { --primary: #6c5ce7; }
    body { background: #f8fafc; font-family: system-ui, sans-serif; }
    .container { max-width: 1100px; margin: 0 auto; padding: 2rem; }
    .panel { background: white; border-radius: 16px; padding: 1.5rem; box-shadow: 0 10px 25px rgba(0,0,0,0.05); margin-bottom: 1.5rem; }
    .field-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: #f1f5f9; border-radius: 8px; margin: 0.5rem 0; }
    .btn { padding: 0.5rem 1.2rem; border-radius: 50px; background: var(--primary); color: white; font-weight: 600; cursor: pointer; border: none; }
    .btn-outline { background: transparent; border: 2px solid var(--primary); color: var(--primary); }
    pre { background: #1e293b; color: #a5b4fc; padding: 1rem; border-radius: 12px; overflow-x: auto; }
    textarea { width: 100%; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <h1 style="font-size: 2.5rem; color: var(--primary);">🧬 Schema 可视化编辑器</h1>

    <div class="panel" x-data>
      <h2>模型</h2>
      <div id="model-list" class="sortable">
        <template x-for="(model, idx) in models" :key="model.name">
          <div class="field-item" :class="{ 'ring-2 ring-purple-500': currentModel === idx }" @click="selectModel(idx)">
            <span x-text="model.name"></span>
            <button @click.stop="deleteModel(idx)" class="btn-outline" style="padding:0.2rem 0.6rem;">删除</button>
          </div>
        </template>
      </div>
      <button @click="addModel()" class="btn" style="margin-top:1rem;">+ 新增模型</button>
    </div>

    <div class="panel" x-show="currentModel !== null">
      <h2>字段 <small x-text="models[currentModel]?.name"></small></h2>
      <div id="field-list" class="sortable">
        <template x-for="(field, idx) in models[currentModel]?.fields" :key="field.name">
          <div class="field-item">
            <span x-text="field.name"></span>
            <select x-model="field.type">
              <option value="string">string</option>
              <option value="text">text</option>
              <option value="number">number</option>
              <option value="integer">integer</option>
              <option value="boolean">boolean</option>
              <option value="file">file</option>
            </select>
            <label><input type="checkbox" x-model="field.required"> 必填</label>
            <button @click="deleteField(idx)" class="btn-outline">删除</button>
          </div>
        </template>
      </div>
      <button @click="addField()" class="btn">+ 添加字段</button>
    </div>

    <div class="panel">
      <h2>生成的 Schema 代码</h2>
      <button @click="generateSchema()" class="btn">刷新代码</button>
      <pre x-text="schemaCode"></pre>
      <button @click="copySchema()" class="btn-outline">复制到剪贴板</button>
    </div>

    <div class="panel">
      <h2>导入 / 导出 JSON</h2>
      <textarea x-model="jsonImport" placeholder="粘贴 JSON 格式的 Schema..."></textarea>
      <button @click="importJSON()" class="btn">导入</button>
      <button @click="exportJSON()" class="btn-outline">导出 JSON</button>
    </div>
  </div>

  <script>
    function editor() {
      return {
        models: [],
        currentModel: null,
        schemaCode: '',
        jsonImport: '',

        init() {
          this.models = [
            { name: 'User', fields: [{ name: 'name', type: 'string', required: true }, { name: 'email', type: 'string', required: true }] }
          ];
          this.currentModel = 0;
          this.generateSchema();
          this.initSortable();
        },

        initSortable() {
          new Sortable(document.getElementById('model-list'), { animation: 150 });
          new Sortable(document.getElementById('field-list'), {
            animation: 150,
            onEnd: (evt) => {
              const fields = this.models[this.currentModel].fields;
              const moved = fields.splice(evt.oldIndex, 1)[0];
              fields.splice(evt.newIndex, 0, moved);
            }
          });
        },

        addModel() {
          const name = prompt('模型名:', 'NewModel');
          if (name) { this.models.push({ name, fields: [] }); this.currentModel = this.models.length - 1; this.generateSchema(); }
        },

        selectModel(idx) { this.currentModel = idx; },

        deleteModel(idx) {
          this.models.splice(idx, 1);
          if (this.currentModel >= this.models.length) this.currentModel = this.models.length - 1;
          this.generateSchema();
        },

        addField() {
          if (this.currentModel === null) return alert('请先选择一个模型');
          const name = prompt('字段名:', 'field');
          if (name) { this.models[this.currentModel].fields.push({ name, type: 'string', required: false }); this.generateSchema(); }
        },

        deleteField(idx) {
          this.models[this.currentModel].fields.splice(idx, 1);
          this.generateSchema();
        },

        generateSchema() {
          let code = "import { defineSchema, string, text, number, auto, timestamp } from '@yiyuan/core';\\n\\nexport default defineSchema({\\n  models: {\\n";
          this.models.forEach(m => {
            code += "    " + m.name + ": {\\n";
            m.fields.forEach(f => {
              let fieldStr = "      " + f.name + ": " + f.type + "()";
              if (f.required) fieldStr += ".required()";
              fieldStr += ",\\n";
              code += fieldStr;
            });
            code += "    },\\n";
          });
          code += "  },\\n});\\n";
          this.schemaCode = code;
        },

        copySchema() {
          navigator.clipboard.writeText(this.schemaCode).then(() => alert('已复制！'));
        },

        exportJSON() {
          const json = JSON.stringify({ models: this.models }, null, 2);
          this.jsonImport = json;
          this.copySchema();
        },

        importJSON() {
          try {
            const data = JSON.parse(this.jsonImport);
            if (data.models) {
              this.models = data.models;
              this.currentModel = 0;
              this.generateSchema();
            }
          } catch (e) {
            alert('无效的 JSON');
          }
        }
      }
    }
  </script>
</body>
</html>`;
}
