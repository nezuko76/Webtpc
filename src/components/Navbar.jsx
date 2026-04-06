import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Badge, Input, Space } from 'antd';
import { ShoppingCartOutlined, UserOutlined, LogoutOutlined, LoginOutlined, DashboardOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const { Header } = Layout;

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/products?search=${value}`);
      setSearchTerm('');
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Hồ sơ',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile'),
    },
    {
      key: 'orders',
      label: 'Đơn hàng',
      onClick: () => navigate('/orders'),
    },
    ...(user?.role === 'ADMIN'
      ? [
          {
            type: 'divider',
          },
          {
            key: 'admin',
            label: 'Quản lý',
            icon: <DashboardOutlined />,
            onClick: () => navigate('/admin/dashboard'),
          },
        ]
      : []),
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        background: '#fff',
        padding: '0 50px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>
        🌿 Thực Phẩm Sạch
      </Link>

      <Space size="large">
        <Input.Search
          placeholder="Tìm sản phẩm..."
          onSearch={handleSearch}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 250 }}
        />

        <Link to="/products">
          <Button type="text">Sản phẩm</Button>
        </Link>

        <Badge count={totalItems} offset={[-5, 5]}>
          <Link to="/cart">
            <Button icon={<ShoppingCartOutlined />} type="text">
              Giỏ hàng
            </Button>
          </Link>
        </Badge>

        {isAuthenticated ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button icon={<UserOutlined />}>{user?.fullName}</Button>
          </Dropdown>
        ) : (
          <>
            <Link to="/auth/login">
              <Button icon={<LoginOutlined />}>Đăng nhập</Button>
            </Link>
            <Link to="/auth/register">
              <Button type="primary">Đăng ký</Button>
            </Link>
          </>
        )}
      </Space>
    </Header>
  );
};
