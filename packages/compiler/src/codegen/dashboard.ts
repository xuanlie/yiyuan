export function generateDashboardPage(): string {
  return `<!DOCTYPE html>
<html lang="zh" x-data="dashboard" x-init="loadStats()">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yiyuan 仪表盘</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.13.5/dist/cdn.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    :root { --primary: #6c5ce7; }
    body { background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh; }
    .container { max-width: 1100px; margin: 0 auto; padding: 2rem; }
    .stat-card { background: rgba(255,255,255,0.8); backdrop-filter: blur(15px); border-radius: 20px; padding: 1.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid rgba(255,255,255,0.5); transition: transform 0.2s; }
    .stat-card:hover { transform: translateY(-2px); }
    .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; }
    .btn { display: inline-block; padding: 0.6rem 1.5rem; border-radius: 50px; background: linear-gradient(135deg, #6c5ce7, #a855f7); color: white; text-decoration: none; font-weight: 600; }
    .chart-container { background: white; border-radius: 20px; padding: 1.5rem; margin-top: 2rem; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    canvas { max-height: 300px; }
  </style>
</head>
<body>
  <div class="container">
    <h1 style="font-size: 2.5rem; background: linear-gradient(135deg, #6c5ce7, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">📊 Yiyuan 仪表盘</h1>
    <p style="color: #4a5568;">Schema 驱动的全栈框架 | 当前版本 v0.1.0</p>

    <!-- 数据卡片 -->
    <div class="grid-4" style="margin: 2rem 0;">
      <template x-for="model in models" :key="model.name">
        <div class="stat-card">
          <h3 x-text="model.name"></h3>
          <p style="font-size: 2rem; font-weight: 700;" x-text="model.count"></p>
          <p style="opacity: 0.7;">条记录</p>
          <a :href="'/' + model.name.toLowerCase() + 's'" class="btn" style="margin-top: 0.5rem;">管理</a>
        </div>
      </template>
    </div>

    <!-- 最近活动 & 快捷操作 -->
    <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
      <div class="stat-card" style="flex: 1;">
        <h3>最近操作</h3>
        <ul x-show="activities.length" style="list-style: none; padding: 0;">
          <template x-for="act in activities.slice(0, 5)">
            <li style="padding: 0.5rem 0; border-bottom: 1px solid #edf2f7;" x-text="act"></li>
          </template>
        </ul>
        <p x-show="!activities.length">暂无操作记录</p>
      </div>
      <div class="stat-card" style="flex: 1;">
        <h3>快捷入口</h3>
        <nav>
          <a href="/api/docs" target="_blank" class="btn" style="display:block; margin:0.5rem 0;">Swagger 文档</a>
          <a href="/schema-editor" class="btn" style="display:block; margin:0.5rem 0;">Schema 编辑器</a>
          <a href="/guide" class="btn" style="display:block; margin:0.5rem 0;">开发文档</a>
          <a href="/tutorial" class="btn" style="display:block; margin:0.5rem 0;">教程</a>
        </nav>
      </div>
    </div>

    <!-- 图表区 -->
    <div class="chart-container">
      <h3>数据分布</h3>
      <canvas id="modelChart"></canvas>
    </div>
  </div>

  <script>
    function dashboard() {
      return {
        models: [],
        activities: [],
        chart: null,

        async loadStats() {
          // 动态获取所有模型数据
          const modelNames = Array.from(document.querySelectorAll('.stat-card h3')).map(el => el.textContent);
          // 这里从页面获取模型名称（由服务端渲染注入），但 Alpine 需要数据，我们直接硬编码当前 Schema 的模型
          // 实际运行时，服务器可以将模型列表注入到页面。这里我们使用 fetch 探测常见模型
          // 为了方便，我们手动列出（可根据 schema 动态生成，但这里简化）
          const presetModels = ['Category', 'Dish', 'Table', 'Order'];
          const results = [];
          for (const name of presetModels) {
            try {
              const res = await fetch('/api/' + name.toLowerCase() + 's');
              const data = await res.json();
              results.push({ name, count: data.length });
            } catch { results.push({ name, count: 0 }); }
          }
          this.models = results;
          this.renderChart();
        },

        renderChart() {
          const ctx = document.getElementById('modelChart').getContext('2d');
          if (this.chart) this.chart.destroy();
          this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: this.models.map(m => m.name),
              datasets: [{
                label: '记录数量',
                data: this.models.map(m => m.count),
                backgroundColor: ['#6c5ce7', '#a855f7', '#3b82f6', '#10b981'],
              }]
            }
          });
        }
      }
    }
  </script>
</body>
</html>`;
}
