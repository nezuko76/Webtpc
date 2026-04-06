import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Spin, Empty } from 'antd';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarOutlined, ShoppingCartOutlined, UserOutlined, ProductOutlined } from '@ant-design/icons';
import apiClient from '../../api/apiClient';

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/dashboard');
      setDashboard(res.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;
  }

  if (!dashboard) {
    return <Empty />;
  }

  const topProductsColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Đã bán',
      dataIndex: 'soldCount',
      key: 'soldCount',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price.toLocaleString('vi-VN')}đ`,
    },
    {
      title: 'Đánh giá',
      dataIndex: 'averageRating',
      key: 'averageRating',
      render: (rating) => rating?.toFixed(1) || 'N/A',
    },
  ];

  return (
    <div style={{ padding: '40px 50px', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '30px' }}>Dashboard</h1>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '30px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Doanh thu toàn bộ"
              value={dashboard.totalRevenue}
              prefix={<DollarOutlined />}
              suffix="đ"
              valueStyle={{ color: '#16a34a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Doanh thu tháng này"
              value={dashboard.revenueThisMonth}
              prefix={<DollarOutlined />}
              suffix="đ"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={dashboard.totalOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đơn hàng chờ xử lý"
              value={dashboard.pendingOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#ff7a45' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '30px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Người dùng"
              value={dashboard.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Sản phẩm"
              value={dashboard.totalProducts}
              prefix={<ProductOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <Card>
            <Statistic
              title="Sản phẩm tồn kho thấp"
              value={dashboard.lowStockProducts}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: '30px' }}>
        <Col xs={24} md={12}>
          <Card title="Doanh thu 30 ngày">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboard.revenueChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#16a34a" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Sản phẩm bán chạy nhất">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={dashboard.topProducts?.slice(0, 5).map((p) => ({
                  name: p.name.substring(0, 15),
                  sold: p.soldCount,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sold" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Top Products Table */}
      <Card title="Sản phẩm hàng đầu">
        <Table
          columns={topProductsColumns}
          dataSource={dashboard.topProducts?.map((p) => ({ ...p, key: p.id }))}
          pagination={false}
        />
      </Card>
    </div>
  );
};
