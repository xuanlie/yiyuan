import type { ParsedSchema } from '@yiyuan/core';
import type { FrontendGenerator } from './frontend-interface';

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export class ReactFrontend implements FrontendGenerator {
  generate(schema: ParsedSchema, options?: { locale?: string; ui?: string }): Record<string, string> {
    const files: Record<string, string> = {};
    const modelNames = Object.keys(schema.models);

    // 为每个模型生成一个列表组件
    for (const model of modelNames) {
      const fields = Object.keys(schema.models[model].fields);
      const lower = model.toLowerCase();
      const component = `
import { useState, useEffect } from 'react';

export default function ${model}List() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/${lower}s')
      .then(res => res.json())
      .then(data => { setItems(data); setLoading(false); });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!items.length) return <p>No data</p>;

  return (
    <table>
      <thead>
        <tr>
          ${fields.map(f => `<th>${f}</th>`).join('\n          ')}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item.id}>
            ${fields.map(f => `<td>{item.${f}}</td>`).join('\n            ')}
            <td>
              <button>Edit</button>
              <button>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
`;
      files[`src/components/${model}List.jsx`] = component;
    }

    // 生成 App.jsx
    const appJsx = `
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
${modelNames.map(m => `import ${m}List from './components/${m}List';`).join('\n')}

export default function App() {
  return (
    <Router>
      <nav>
        ${modelNames.map(m => `<Link to="/${m.toLowerCase()}s">${m}</Link>`).join('\n        ')}
      </nav>
      <Routes>
        ${modelNames.map(m => `<Route path="/${m.toLowerCase()}s" element={<${m}List />} />`).join('\n        ')}
      </Routes>
    </Router>
  );
}
`;
    files['src/App.jsx'] = appJsx;

    // 生成 index.jsx
    files['src/index.jsx'] = `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
`;

    // 生成 package.json
    files['package.json'] = JSON.stringify({
      name: 'yiyuan-frontend',
      version: '1.0.0',
      scripts: {
        dev: 'vite --port 5173',
        build: 'vite build',
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        'react-router-dom': '^6.0.0',
      },
      devDependencies: {
        vite: '^5.0.0',
        '@vitejs/plugin-react': '^4.0.0',
      },
    }, null, 2);

    // 生成 vite.config.js
    files['vite.config.js'] = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
