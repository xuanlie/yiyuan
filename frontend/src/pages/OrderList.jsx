import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import { api } from '../api';

export default function OrderList() {
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
      const items = await api.getOrders();
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
      if (msg.channel === 'dataChange' && msg.data.model === 'Order') fetchData();
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
    try { await api.deleteOrder(id); message.success('删除成功'); fetchData(); }
    catch (e) { message.error('删除失败'); }
  };

  const handleOk = async () => {
    const values = form.getFieldsValue();
    try {
      if (editingItem) {
        await api.updateOrder(editingItem.id, values);
        message.success('更新成功');
      } else {
        await api.createOrder(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchData();
    } catch (e) { message.error('操作失败'); }
  };

  const filteredData = data.filter(item =>
    (item.fields && String(item.fields).includes(searchText))
  );

  const columns = [
    { title: 'fields', dataIndex: 'fields', key: 'fields', sorter: (a, b) => (a.fields || '').localeCompare(b.fields || '') },
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
          <Form.Item name="fields" label="fields" rules={[{ required: true, message: '请输入' }]}>
              <Input />
            </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}