import { Card, Row, Col, Statistic, Spin, message } from 'antd';
import { useState, useEffect } from 'react';
import { api } from '../api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const promises = [api.getCategorys(),api.getDishs(),api.getTables(),api.getOrders()];
        const results = await Promise.all(promises);
        const newStats = {};
        newStats['Category'] = results[0]?.length || 0;
newStats['Dish'] = results[1]?.length || 0;
newStats['Table'] = results[2]?.length || 0;
newStats['Order'] = results[3]?.length || 0;
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
          
          <Col span={6}>
            <Card>
              <Link to="/categorys">
                <Statistic title="Category" value={stats['Category'] || 0} suffix="条" />
              </Link>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Link to="/dishs">
                <Statistic title="Dish" value={stats['Dish'] || 0} suffix="条" />
              </Link>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Link to="/tables">
                <Statistic title="Table" value={stats['Table'] || 0} suffix="条" />
              </Link>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Link to="/orders">
                <Statistic title="Order" value={stats['Order'] || 0} suffix="条" />
              </Link>
            </Card>
          </Col>
        </Row>
      </Spin>
      {/* WebSocket 连接实时更新（可选提示） */}
      <p style={{ marginTop: 24, color: '#888' }}>数据实时同步中... (WebSocket)</p>
    </div>
  );
}