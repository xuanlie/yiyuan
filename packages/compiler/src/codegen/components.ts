// 生成可复用的前端组件 JS 代码
export function generateComponents(): string {
  return `
// ─── 一元内置组件 ───
// 生成的页面直接使用这些函数，不需要额外导入

// 数据表格
function DataTable(containerId, columns, data, options) {
  options = options || {};
  var el = document.getElementById(containerId);
  if (!data.length) { el.innerHTML = '<div class="empty">暂无数据</div>'; return; }

  var h = '<table><thead><tr>';
  columns.forEach(function(col) {
    h += '<th>' + col.label + '</th>';
  });
  if (options.onDelete) h += '<th></th>';
  h += '</tr></thead><tbody>';

  data.forEach(function(item, i) {
    h += '<tr class="stagger" style="animation-delay:' + i * 0.04 + 's">';
    columns.forEach(function(col) {
      var val = item[col.key];
      if (col.render) { h += '<td>' + col.render(val, item) + '</td>'; }
      else if (col.type === 'badge') { h += '<td><span class="badge ' + val + '">' + val + '</span></td>'; }
      else { h += '<td>' + (val || '—') + '</td>'; }
    });
    if (options.onDelete) {
      h += '<td><button class="del-btn" onclick="\\'' + options.onDelete + '(\\'' + item.id + '\\')">&times;</button></td>';
    }
    h += '</tr>';
  });

  el.innerHTML = h + '</tbody></table>';
}

// 表单构建器
function FormBuilder(containerId, fields, onSubmit) {
  var el = document.getElementById(containerId);
  var h = '<div class="form-row">';
  fields.forEach(function(f) {
    if (f.type === 'select') {
      h += '<select id="field-' + f.key + '">';
      f.options.forEach(function(o) {
        h += '<option value="' + o.value + '">' + o.label + '</option>';
      });
      h += '</select>';
    } else if (f.type === 'textarea') {
      h += '<textarea id="field-' + f.key + '" placeholder="' + (f.placeholder || f.label) + '"></textarea>';
    } else {
      h += '<input id="field-' + f.key + '" placeholder="' + (f.placeholder || f.label) + '">';
    }
  });
  h += '<button class="btn" id="btn-' + containerId + '">创建</button></div>';
  el.innerHTML = h;

  document.getElementById('btn-' + containerId).onclick = function() {
    var data = {};
    fields.forEach(function(f) {
      var val = document.getElementById('field-' + f.key).value.trim();
      if (f.type === 'number' && val) val = Number(val);
      if (val) data[f.key] = val;
    });
    onSubmit(data);
  };
}

// 统计卡片
function StatCards(containerId, stats) {
  var el = document.getElementById(containerId);
  var h = '<div class="stat-row">';
  stats.forEach(function(s) {
    h += '<div class="stat-card"><div class="stat-value">' + s.value + '</div><div class="stat-label">' + s.label + '</div></div>';
  });
  el.innerHTML = h + '</div>';
}

// 状态徽章
function Badge(value, map) {
  var cls = map[value] || '';
  return '<span class="badge ' + cls + '">' + value + '</span>';
}

// 日期格式化
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('zh-CN');
}

// 评分星星
function Stars(rating) {
  var s = '';
  for (var i = 0; i < 5; i++) s += i < rating ? '★' : '☆';
  return '<span class="stars">' + s + '</span>';
}
`;
}
