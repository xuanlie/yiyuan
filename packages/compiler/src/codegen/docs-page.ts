import type { ParsedSchema } from '@yiyuan/core'
import { getPrimaryKey, getWritableFields } from '@yiyuan/core'

export function generateDocsPage(schema: ParsedSchema): string {
  const modelNames = Object.keys(schema.models)

  // ── Schema 文本 ──
  const schemaLines = modelNames.map(name => {
    const model = schema.models[name]
    const fields = Object.entries(model.fields).map(([key, field]) => {
      let line = `  ${key}: `
      if (field.type === 'auto') line += 'auto()'
      else if (field.type === 'string') line += 'string()'
      else if (field.type === 'text') line += 'text()'
      else if (field.type === 'number') line += 'number()'
      else if (field.type === 'boolean') line += 'boolean()'
      else if (field.type === 'timestamp') line += 'timestamp()'
      else if (field.type === 'enum') line += `enumOf(${field.enumValues?.map(v => "'" + v + "'").join(', ')})`
      else if (field.type === 'relation' && field.relation) line += `${field.relation.type === 'hasOne' ? 'hasOne' : 'hasMany'}('${field.relation.model}')`
      else line += 'string()'
      if (field.required) line += '.required()'
      if (field.unique) line += '.unique()'
      if (field.searchable) line += '.searchable()'
      if (field.default !== undefined) line += `.default(${typeof field.default === 'string' ? "'" + field.default + "'" : field.default})`
      return line + ','
    }).join('\n')
    return `  ${name}: {\n${fields}\n  }`
  }).join(',\n\n')

  const schemaText = `import { defineSchema, string, text, number, auto, timestamp, enumOf, hasOne, hasMany } from '@yiyuan/core'

export default defineSchema({
  models: {
${schemaLines}
  },
})`

  // ── 每个 model 的 handler 代码 ──
  const handlerTexts: Record<string, string> = {}
  for (const name of modelNames) {
    const model = schema.models[name]
    const pk = getPrimaryKey(model) ?? 'id'
    const writable = getWritableFields(model)
    const lower = name.toLowerCase()
    const plural = lower + 's'

    handlerTexts[name] = `// handlers/${lower}.ts
import { Hono } from 'hono'
import { getDB } from '@yiyuan/server'

const app = new Hono()

// 查询列表
app.get('/api/${plural}', async (c) => {
  const where = c.req.query('where')
  const limit = c.req.query('limit')
  const results = await getDB().findMany('${name}', {
    where: where ? JSON.parse(where) : undefined,
    limit: limit ? Number(limit) : undefined,
  })
  return c.json(results)
})

// 查询详情
app.get('/api/${plural}/:id', async (c) => {
  const result = await getDB().findOne('${name}', { ${pk}: c.req.param('id') })
  if (!result) return c.json({ error: 'Not found' }, 404)
  return c.json(result)
})

// 创建
app.post('/api/${plural}', async (c) => {
  const body = await c.req.json()
  const result = await getDB().create('${name}', body)
  return c.json(result, 201)
})

// 更新
app.patch('/api/${plural}', async (c) => {
  const { id, ...data } = await c.req.json()
  const result = await getDB().update('${name}', { ${pk}: id }, data)
  return c.json(result)
})

// 删除
app.delete('/api/${plural}', async (c) => {
  const { id } = await c.req.json()
  await getDB().delete('${name}', { ${pk}: id })
  return c.json({ ok: true })
})

export const ${lower}Routes = app`
  }

  // ── Router 代码 ──
  const routerImports = modelNames.map(n => `import { ${n.toLowerCase()}Routes } from './handlers/${n.toLowerCase()}'`).join('\n')
  const routerMounts = modelNames.map(n => `  app.route('/', ${n.toLowerCase()}Routes)`).join('\n')

  const routerText = `// router.ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'
${routerImports}

export function createApp(): Hono {
  const app = new Hono()
  app.use('*', cors())
${routerMounts}
  return app
}`

  // ── Types 代码 ──
  const typeBlocks = modelNames.map(name => {
    const model = schema.models[name]
    const fields = Object.entries(model.fields).map(([key, field]) => {
      let type = 'any'
      if (field.type === 'string' || field.type === 'text') type = 'string'
      else if (field.type === 'number') type = 'number'
      else if (field.type === 'boolean') type = 'boolean'
      else if (field.type === 'timestamp') type = 'Date'
      else if (field.type === 'auto') type = 'string'
      else if (field.type === 'enum') type = field.enumValues?.map(v => "'" + v + "'").join(' | ') ?? 'string'
      else if (field.type === 'relation' && field.relation) type = field.relation.type === 'hasOne' ? field.relation.model : field.relation.model + '[]'
      const opt = field.required ? '' : '?'
      return `  ${key}${opt}: ${type}`
    }).join('\n')
    return `interface ${name} {\n${fields}\n}`
  }).join('\n\n')

  const typesText = `// types/models.ts\n\n${typeBlocks}`

  // ── API 文档文本 ──
  const apiText = modelNames.map(name => {
    const model = schema.models[name]
    const lower = name.toLowerCase()
    const plural = lower + 's'
    const writable = getWritableFields(model)
    return `# ${name}\nGET    /api/${plural}         查询列表\nGET    /api/${plural}/:id     查询详情\nPOST   /api/${plural}         创建  { ${writable.join(', ')} }\nPATCH  /api/${plural}         更新  { id, ${writable.join(', ')} }\nDELETE /api/${plural}         删除  { id }`
  }).join('\n\n')

  // ── 合并全部 ──
  const everything = [schemaText, typesText, routerText, ...Object.values(handlerTexts), apiText].join('\n\n\n')

  // ── HTML 渲染 ──
  const totalFields = Object.values(schema.models).reduce((s, m) => s + Object.keys(m.fields).length, 0)

  const modelCards = modelNames.map((name, idx) => {
    const model = schema.models[name]
    const pk = getPrimaryKey(model) ?? 'id'
    const fieldRows = Object.entries(model.fields).map(([key, field]) => {
      let info = field.type
      if (field.type === 'enum') info = (field.enumValues?.join(' | ') ?? '') as any
      if (field.relation) info = field.relation.type + ' -> ' + field.relation.model
      const tags: string[] = []
      if (field.required) tags.push('required')
      if (field.unique) tags.push('unique')
      if (field.searchable) tags.push('searchable')
      if (field.default !== undefined) tags.push('default: ' + field.default)
      return `<tr><td><code>${key}</code></td><td class="mono">${info}</td><td>${tags.map(t => '<span class="tag">' + t + '</span>').join(' ')}</td></tr>`
    }).join('\n')

    const lower = name.toLowerCase()
    const plural = lower + 's'
    const writable = getWritableFields(model)
    const apiRows = [
      ['GET', '/api/' + plural, '列表', '?where&limit&offset'],
      ['GET', '/api/' + plural + '/:id', '详情', ''],
      ['POST', '/api/' + plural, '创建', '{ ' + writable.join(', ') + ' }'],
      ['PATCH', '/api/' + plural, '更新', '{ id, ... }'],
      ['DELETE', '/api/' + plural, '删除', '{ id }'],
    ].map(r => `<tr><td><span class="method ${r[0].toLowerCase()}">${r[0]}</span></td><td><code>${r[1]}</code></td><td>${r[2]}</td><td class="dim">${r[3] || '—'}</td></tr>`).join('\n')

    return `
    <div class="card" style="animation-delay:${idx * 0.06}s">
      <div class="card-head"><span class="card-name">${name}</span><span class="card-pk">PK: ${pk}</span></div>
      <div class="sec">Fields</div>
      <table class="ft"><thead><tr><th>字段</th><th>类型</th><th>属性</th></tr></thead><tbody>${fieldRows}</tbody></table>
      <div class="sec">API</div>
      <table class="at"><thead><tr><th>方法</th><th>路径</th><th>说明</th><th>Body</th></tr></thead><tbody>${apiRows}</tbody></table>
    </div>`
  }).join('\n')

  // 代码区块
  const codeBlocks = [
    { id: 'schema', label: 'Schema', sub: 'schema.ts', text: schemaText },
    { id: 'types', label: 'Types', sub: 'types/models.ts', text: typesText },
    { id: 'router', label: 'Router', sub: 'router.ts', text: routerText },
    ...modelNames.map(name => ({
      id: 'handler-' + name.toLowerCase(),
      label: name + ' Handler',
      sub: 'handlers/' + name.toLowerCase() + '.ts',
      text: handlerTexts[name],
    })),
  ]

  const codeTabs = codeBlocks.map((b, i) =>
    `<button class="tab${i === 0 ? ' active' : ''}" onclick="showCode('${b.id}', this)">${b.label}</button>`
  ).join('\n')

  const codePanels = codeBlocks.map((b, i) =>
    `<div id="code-${b.id}" class="code-panel" style="display:${i === 0 ? 'block' : 'none'}">
      <div class="code-head">
        <span class="code-file">${b.sub}</span>
        <div class="code-actions">
          <button class="copy-btn" onclick="copyCode('${b.id}')">复制</button>
          <button class="edit-btn" onclick="toggleEdit('${b.id}')">编辑</button>
        </div>
      </div>
      <textarea id="ta-${b.id}" class="code-ta" readonly>${b.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
    </div>`
  ).join('\n')

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>一元 — 开发者文档</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0a0a0a;--s:#131316;--s2:#1a1a1f;--b:#26262c;--t:#e4e4e7;--m:#636370;--cyan:#22d3ee;--green:#4ade80;--yellow:#facc15;--red:#f87171;--blue:#60a5fa}
body{background:var(--bg);color:var(--t);font-family:system-ui,sans-serif;font-weight:300;min-height:100vh}

.topbar{display:flex;align-items:center;justify-content:space-between;padding:16px 32px;border-bottom:1px solid var(--b)}
.topbar .logo{font-size:14px;font-weight:600;letter-spacing:.12em}
.topbar .logo span{color:var(--cyan)}
.topbar a{font-size:12px;color:var(--m);text-decoration:none;padding:8px 14px;border:1px solid var(--b);transition:all .2s;cursor:pointer}
.topbar a:hover{border-color:var(--cyan);color:var(--cyan)}

main{max-width:1000px;margin:0 auto;padding:36px 28px 80px}

.section-title{font-size:13px;letter-spacing:.15em;color:var(--cyan);margin:40px 0 20px;font-weight:500;text-transform:uppercase;border-bottom:1px solid var(--b);padding-bottom:10px}
.section-title:first-of-type{margin-top:0}

.stats{display:flex;gap:12px;margin-bottom:28px;flex-wrap:wrap}
.stat{background:var(--s);border:1px solid var(--b);padding:14px 20px}
.stat .val{font-size:22px;font-weight:200;color:var(--cyan)}
.stat .lbl{font-size:10px;color:var(--m);letter-spacing:.1em;margin-top:2px}

.btns{display:flex;gap:8px;margin-bottom:28px;flex-wrap:wrap}
.btn-main{background:var(--cyan);color:var(--bg);border:none;padding:10px 20px;font-size:11px;font-weight:600;letter-spacing:.08em;cursor:pointer;transition:opacity .2s}
.btn-main:hover{opacity:.8}
.btn-main.done{background:var(--green)}
.btn-sub{background:var(--s);border:1px solid var(--b);color:var(--m);padding:10px 16px;font-size:11px;letter-spacing:.06em;cursor:pointer;transition:all .2s}
.btn-sub:hover{border-color:var(--cyan);color:var(--cyan)}
.btn-sub.done{border-color:var(--green);color:var(--green)}

.card{background:var(--s);border:1px solid var(--b);padding:24px;margin-bottom:16px;animation:fadeUp .3s ease forwards;opacity:0}
.card-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
.card-name{font-size:16px;font-weight:400;letter-spacing:.04em}
.card-pk{font-size:11px;color:var(--m);font-family:monospace}
.sec{font-size:10px;letter-spacing:.15em;color:var(--m);text-transform:uppercase;margin:14px 0 8px;padding-bottom:5px;border-bottom:1px solid var(--b)}

.ft,.at{width:100%;border-collapse:collapse;font-size:13px}
.ft th,.at th{text-align:left;font-size:10px;letter-spacing:.1em;color:var(--m);font-weight:400;padding:5px 8px}
.ft td,.at td{padding:6px 8px;border-bottom:1px solid var(--b);font-size:12px}
.mono{color:var(--m);font-family:monospace;font-size:11px}
.dim{color:var(--m);font-size:11px}
.tag{font-size:9px;padding:1px 5px;border:1px solid var(--b);margin-right:3px;color:var(--m)}
.method{font-size:10px;padding:2px 6px;border:1px solid var(--b);font-weight:600}
.method.get{color:var(--green);border-color:rgba(74,222,128,.3)}
.method.post{color:var(--yellow);border-color:rgba(250,204,21,.3)}
.method.patch{color:var(--blue);border-color:rgba(96,165,250,.3)}
.method.delete{color:var(--red);border-color:rgba(248,113,113,.3)}
code{color:var(--blue);font-size:12px}

/* 代码编辑器 */
.code-editor{background:var(--s);border:1px solid var(--b);margin-bottom:20px}
.tabs{display:flex;border-bottom:1px solid var(--b);overflow-x:auto;flex-wrap:nowrap}
.tab{padding:10px 16px;font-size:11px;color:var(--m);cursor:pointer;border:none;background:none;white-space:nowrap;border-bottom:2px solid transparent;transition:all .2s;font-family:inherit;letter-spacing:.06em}
.tab:hover{color:var(--t)}
.tab.active{color:var(--cyan);border-bottom-color:var(--cyan)}
.code-panel{display:none}
.code-head{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-bottom:1px solid var(--b)}
.code-file{font-size:11px;color:var(--m);font-family:monospace}
.code-actions{display:flex;gap:6px}
.copy-btn,.edit-btn{background:var(--s2);border:1px solid var(--b);color:var(--m);padding:5px 12px;font-size:10px;letter-spacing:.06em;cursor:pointer;transition:all .2s;font-family:inherit}
.copy-btn:hover,.edit-btn:hover{border-color:var(--cyan);color:var(--cyan)}
.copy-btn.done{border-color:var(--green);color:var(--green)}
.edit-btn.active{border-color:var(--yellow);color:var(--yellow);background:rgba(250,204,21,.05)}
.code-ta{width:100%;min-height:300px;background:var(--s2);color:var(--t);border:none;padding:14px 16px;font-family:'SF Mono','Fira Code','Consolas',monospace;font-size:12px;line-height:1.7;resize:vertical;outline:none}
.code-ta:focus{background:#1e1e24}
.code-ta[readonly]{opacity:.8}

.toast{position:fixed;top:20px;right:20px;background:var(--green);color:var(--bg);padding:10px 18px;font-size:12px;font-weight:600;letter-spacing:.06em;z-index:9999;opacity:0;transform:translateY(-10px);transition:all .3s;pointer-events:none}
.toast.show{opacity:1;transform:translateY(0)}

@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
</style>
</head>
<body>

<div class="topbar">
  <div class="logo"><span>一元</span> DOCS</div>
  <a href="/">← 应用</a>
</div>

<main>
  <div class="stats">
    <div class="stat"><div class="val">${modelNames.length}</div><div class="lbl">Models</div></div>
    <div class="stat"><div class="val">${modelNames.length * 5}</div><div class="lbl">Endpoints</div></div>
    <div class="stat"><div class="val">${totalFields}</div><div class="lbl">Fields</div></div>
  </div>

  <div class="btns">
    <button class="btn-main" onclick="copyAll()">一键复制全部</button>
    <button class="btn-sub" onclick="copyPart('schemaText')">复制 Schema</button>
    <button class="btn-sub" onclick="copyPart('apiDocText')">复制 API 文档</button>
  </div>

  <div class="section-title">后端代码（可查看 · 可编辑 · 可复制）</div>

  <div class="code-editor">
    <div class="tabs">
${codeTabs}
    </div>
${codePanels}
  </div>

  <div class="section-title">数据模型</div>
${modelCards}

  <div class="section-title">API 接口一览</div>
  <table class="at" style="margin-bottom:20px">
    <thead><tr><th>方法</th><th>路径</th><th>说明</th><th>Body</th></tr></thead>
    <tbody>
${modelNames.map(name => {
    const model = schema.models[name]
    const lower = name.toLowerCase()
    const plural = lower + 's'
    const w = getWritableFields(model)
    return [
      ['GET', '/api/' + plural, '查询' + name + '列表', '?where&limit&offset'],
      ['GET', '/api/' + plural + '/:id', '查询单个' + name, ''],
      ['POST', '/api/' + plural, '创建' + name, '{ ' + w.join(', ') + ' }'],
      ['PATCH', '/api/' + plural, '更新' + name, '{ id, ... }'],
      ['DELETE', '/api/' + plural, '删除' + name, '{ id }'],
    ].map(r => `<tr><td><span class="method ${r[0].toLowerCase()}">${r[0]}</span></td><td><code>${r[1]}</code></td><td>${r[2]}</td><td class="dim">${r[3] || '—'}</td></tr>`).join('\n')
  }).join('\n')}
    </tbody>
  </table>
</main>

<div id="toast" class="toast">已复制</div>

<textarea id="everything" style="position:absolute;left:-9999px">${everything.replace(/</g, '&lt;')}</textarea>
<textarea id="schemaText" style="position:absolute;left:-9999px">${schemaText.replace(/</g, '&lt;')}</textarea>
<textarea id="apiDocText" style="position:absolute;left:-9999px">${apiText}</textarea>

<script>
function showToast(msg){
  var t=document.getElementById('toast');
  t.textContent=msg||'已复制';
  t.className='toast show';
  setTimeout(function(){t.className='toast'},1500);
}

function doCopy(text){
  if(navigator.clipboard){navigator.clipboard.writeText(text)}
  else{var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta)}
}

function copyAll(){
  doCopy(document.getElementById('everything').value);
  var btn=document.querySelector('.btn-main');
  btn.textContent='已复制';btn.className='btn-main done';
  showToast('已复制全部代码');
  setTimeout(function(){btn.textContent='一键复制全部';btn.className='btn-main'},2000);
}

function copyPart(id){
  doCopy(document.getElementById(id).value);
  showToast('已复制');
}

function showCode(id,btn){
  document.querySelectorAll('.tab').forEach(function(t){t.className='tab'});
  document.querySelectorAll('.code-panel').forEach(function(p){p.style.display='none'});
  btn.className='tab active';
  document.getElementById('code-'+id).style.display='block';
}

function copyCode(id){
  var ta=document.getElementById('ta-'+id);
  doCopy(ta.value);
  var btn=ta.closest('.code-panel').querySelector('.copy-btn');
  btn.textContent='已复制';btn.className='copy-btn done';
  showToast('已复制');
  setTimeout(function(){btn.textContent='复制';btn.className='copy-btn'},1500);
}

function toggleEdit(id){
  var ta=document.getElementById('ta-'+id);
  var btn=ta.closest('.code-panel').querySelector('.edit-btn');
  if(ta.readOnly){
    ta.readOnly=false;
    ta.style.opacity='1';
    btn.textContent='锁定';
    btn.className='edit-btn active';
  } else {
    ta.readOnly=true;
    ta.style.opacity='.8';
    btn.textContent='编辑';
    btn.className='edit-btn';
  }
}
</script>
</body>
</html>`
}
