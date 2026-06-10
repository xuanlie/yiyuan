import type { ParsedSchema, YiyuanConfig } from '@yiyuan/core';

export function generateFrontendProject(schema: ParsedSchema, config?: YiyuanConfig): Record<string, string> {
  const models = Object.entries(schema.models);
  const firstModel = models[0]?.[0] || '';
  const files: Record<string, string> = {};

  files['package.json'] = JSON.stringify({
    name: 'yiyuan-frontend',
    private: true,
    version: '0.0.1',
    scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
    dependencies: {
      react: '^18.2.0', 'react-dom': '^18.2.0', 'react-router-dom': '^6.20.0',
      antd: '^5.12.0', '@ant-design/icons': '^5.2.0', dayjs: '^1.11.10'
    },
    devDependencies: { vite: '^5.0.0', '@vitejs/plugin-react': '^4.2.0' },
  }, null, 2);

  files['vite.config.js'] = `import { defineConfig } from 'vite'; import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()], server: { port: 3000, proxy: { '/api': 'http://localhost:${config?.server?.port || 3456}' } } });`;

  files['index.html'] = `<!DOCTYPE html><html lang="zh"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Yiyuan Admin</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>`;

  files['src/main.jsx'] = `import React from 'react'; import ReactDOM from 'react-dom/client'; import { BrowserRouter } from 'react-router-dom'; import App from './App'; import './index.css';
ReactDOM.createRoot(document.getElementById('root')).render(<BrowserRouter><App /></BrowserRouter>);`;

  files['src/index.css'] = `body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }`;

  files['src/api.js'] = `const BASE = '/api';

async function request(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(BASE + url, { ...options, headers });
  if (res.status === 401) {
    api.logout();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) throw new Error('Request failed: ' + res.status);
  const ct = res.headers.get('content-type');
  return ct && ct.includes('json') ? res.json() : res.text();
}

export const api = {
  request,
  getToken: () => localStorage.getItem('token'),
  setToken: (t) => localStorage.setItem('token', t),
  logout: () => localStorage.removeItem('token'),
  login: async (u, p) => {
    const d = await request('/login', { method: 'POST', body: JSON.stringify({ username: u, password: p }) });
    if (d.token) api.setToken(d.token);
    return d;
  },
${models.map(([n]) => {
  const l = n.toLowerCase();
  return `  get${n}s: () => request('/${l}s'),
  get${n}: (id) => request('/${l}s/' + id),
  create${n}: (data) => request('/${l}s', { method: 'POST', body: JSON.stringify(data) }),
  update${n}: (id, data) => request('/${l}s/' + id, { method: 'PUT', body: JSON.stringify(data) }),
  delete${n}: (id) => request('/${l}s/' + id, { method: 'DELETE' }),`;
}).join('\n')}
};`;

  // App.jsx 增加仪表盘路由
  files['src/App.jsx'] = `import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button } from 'antd';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
${models.map(([name]) => `import ${name}List from './pages/${name}List';`).join('\n')}
import { api } from './api';

const { Header, Sider, Content } = Layout;

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!api.getToken());
  const navigate = useNavigate();

  useEffect(() => { if (!loggedIn) navigate('/login'); }, [loggedIn]);

  const handleLogout = () => { api.logout(); setLoggedIn(false); navigate('/login'); };

  if (!loggedIn) return (<Routes><Route path="/login" element={<Login onLogin={() => { setLoggedIn(true); navigate('/'); }} />} /><Route path="*" element={<Login onLogin={() => { setLoggedIn(true); navigate('/'); }} />} /></Routes>);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider>
        <div style={{ color: 'white', padding: '16px', fontSize: '20px' }}>Yiyuan</div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['dashboard']}>
          <Menu.Item key="dashboard"><Link to="/">仪表盘</Link></Menu.Item>
          ${models.map(([name]) => `<Menu.Item key="${name}"><Link to="/${name.toLowerCase()}s">${name}</Link></Menu.Item>`).join('\n')}
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button onClick={handleLogout}>退出</Button>
        </Header>
        <Content style={{ margin: '16px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            ${models.map(([name]) => `<Route path="/${name.toLowerCase()}s" element={<${name}List />} />`).join('\n')}
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}`;

  // 仪表盘页面
  files['src/pages/Dashboard.jsx'] = `import { Card, Row, Col, Statistic, Spin, message } from 'antd';
import { useState, useEffect } from 'react';
import { api } from '../api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const promises = [${models.map(([name]) => `api.get${name}s()`).join(',')}];
        const results = await Promise.all(promises);
        const newStats = {};
        ${models.map(([name], idx) => `newStats['${name}'] = results[${idx}]?.length || 0;`).join('\n')}
        setStats(newStats);
      } catch (e) { message.error('加载仪表盘失败'); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div>
      <h2>数据概览</h2>
      <Spin spinning={loading}>
        <Row gutter={16}>
          ${models.map(([name]) => `
          <Col span={6}>
            <Card>
              <Link to="/${name.toLowerCase()}s">
                <Statistic title="${name}" value={stats['${name}'] || 0} suffix="条" />
              </Link>
            </Card>
          </Col>`).join('')}
        </Row>
      </Spin>
      {/* WebSocket 连接实时更新（可选提示） */}
      <p style={{ marginTop: 24, color: '#888' }}>数据实时同步中... (WebSocket)</p>
    </div>
  );
}`;

  // 登录页面（保持不变）
  files['src/pages/Login.jsx'] = `import { Form, Input, Button, Card, message } from 'antd'; import { UserOutlined, LockOutlined } from '@ant-design/icons'; import { useState } from 'react'; import { api } from '../api';
export default function Login({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const onFinish = async (values) => { setLoading(true); try { await api.login(values.username, values.password); message.success('登录成功'); onLogin(); } catch (e) { message.error('登录失败：' + e.message); } finally { setLoading(false); } };
  return (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}><Card title="Yiyuan 管理登录" style={{ width: 400 }}><Form onFinish={onFinish}><Form.Item name="username" rules={[{ required: true }]}><Input prefix={<UserOutlined />} placeholder="用户名" /></Form.Item><Form.Item name="password" rules={[{ required: true }]}><Input.Password prefix={<LockOutlined />} placeholder="密码" /></Form.Item><Form.Item><Button type="primary" htmlType="submit" loading={loading} block>登录</Button></Form.Item></Form></Card></div>);
}`;

  // 为每个模型生成带搜索分页的 CRUD 页面
  for (const [modelName, modelDef] of models) {
    const lower = modelName.toLowerCase();
    const fields = Object.keys(modelDef.fields);
    const hasFile = Object.values(modelDef.fields).some(f =>  (f.type || 'string')  === 'file');

    const columnsCode = fields.map(f => {
      const type = modelDef.fields[f].type;
      if (type === 'boolean') return `{ title: '${f}', dataIndex: '${f}', key: '${f}', render: (val) => val ? '是' : '否' }`;
      if (type === 'file') return `{ title: '${f}', dataIndex: '${f}', key: '${f}', render: (url) => url ? <a href={url} target="_blank">查看文件</a> : '-' }`;
      return `{ title: '${f}', dataIndex: '${f}', key: '${f}', sorter: (a, b) => (a.${f} || '').localeCompare(b.${f} || '') }`;
    }).join(',\n    ');

    files[`src/pages/${modelName}List.jsx`] = `import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import { api } from '../api';

export default function ${modelName}List() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const items = await api.get${modelName}s();
      setData(items);
    } catch (e) { message.error('获取列表失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // WebSocket 实时更新（连接后端 WebSocket，监听数据变化）
  useEffect(() => {
    const ws = new WebSocket('ws://' + location.hostname + ':' + (parseInt(location.port || '3000') + 1));
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.channel === 'dataChange' && msg.data.model === '${modelName}') fetchData();
    };
    return () => ws.close();
  }, []);

  const handleCreate = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try { await api.delete${modelName}(id); message.success('删除成功'); fetchData(); }
    catch (e) { message.error('删除失败'); }
  };

  const handleOk = async () => {
    const values = form.getFieldsValue();
    try {
      if (editingItem) {
        await api.update${modelName}(editingItem.id, values);
        message.success('更新成功');
      } else {
        await api.create${modelName}(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchData();
    } catch (e) { message.error('操作失败'); }
  };

  const filteredData = data.filter(item =>
    ${fields.length ? fields.map(f => `(item.${f} && String(item.${f}).includes(searchText))`).join(' || ') : 'true'}
  );

  const columns = [
    ${columnsCode},
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col>
          <Input.Search placeholder="搜索..." allowClear onChange={(e) => setSearchText(e.target.value)} style={{ width: 200 }} />
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新增</Button>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          total: filteredData.length,
          showSizeChanger: true,
          onChange: (page, pageSize) => setPagination({ current: page, pageSize })
        }}
      />
      <Modal
        title={editingItem ? '编辑' : '新建'}
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          ${fields.filter(f => f !== 'id').map(f => {
            const type = modelDef.fields[f].type;
            if (type === 'file') {
              return `<Form.Item name="${f}" label="${f}">
                <Input placeholder="文件 URL" addonAfter={<UploadOutlined />} />
              </Form.Item>`;
            }
            return `<Form.Item name="${f}" label="${f}" rules={[{ required: true, message: '请输入' }]}>
              <Input />
            </Form.Item>`;
          }).join('\n')}
        </Form>
      </Modal>
    </div>
  );
}`;
  }

  return files;
}
