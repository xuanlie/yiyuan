import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button } from 'antd';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CategoryList from './pages/CategoryList';
import DishList from './pages/DishList';
import TableList from './pages/TableList';
import OrderList from './pages/OrderList';
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
          <Menu.Item key="Category"><Link to="/categorys">Category</Link></Menu.Item>
<Menu.Item key="Dish"><Link to="/dishs">Dish</Link></Menu.Item>
<Menu.Item key="Table"><Link to="/tables">Table</Link></Menu.Item>
<Menu.Item key="Order"><Link to="/orders">Order</Link></Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button onClick={handleLogout}>退出</Button>
        </Header>
        <Content style={{ margin: '16px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/categorys" element={<CategoryList />} />
<Route path="/dishs" element={<DishList />} />
<Route path="/tables" element={<TableList />} />
<Route path="/orders" element={<OrderList />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}