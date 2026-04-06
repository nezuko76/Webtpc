import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Package, Tags, ShoppingBag, Users,
  Tag, Image, Star, Leaf, LogOut, ChevronRight, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/products', label: 'Sản phẩm', icon: Package },
  { to: '/admin/categories', label: 'Danh mục', icon: Tags },
  { to: '/admin/orders', label: 'Đơn hàng', icon: ShoppingBag },
  { to: '/admin/users', label: 'Người dùng', icon: Users },
  { to: '/admin/coupons', label: 'Mã giảm giá', icon: Tag },
  { to: '/admin/banners', label: 'Banner', icon: Image },
  { to: '/admin/reviews', label: 'Đánh giá', icon: Star },
];

export default function AdminLayout({ children }) {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (item) => item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-60 bg-gray-900 text-white flex flex-col transition-transform duration-200`}>
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-800">
          <div className="bg-green-600 p-1.5 rounded-lg"><Leaf className="h-5 w-5 text-white" /></div>
          <div>
            <p className="font-bold text-sm">Thực Phẩm Sạch</p>
            <p className="text-xs text-gray-400">Quản trị viên</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {NAV.map(item => (
            <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive(item) ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <Link to="/" onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors mb-1">
            <ChevronRight className="h-4.5 w-4.5 rotate-180" /> Về trang chủ
          </Link>
          <button onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors">
            <LogOut className="h-4.5 w-4.5" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-1.5 text-gray-600">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <h1 className="font-semibold text-gray-800 text-sm">
            {NAV.find(n => isActive(n))?.label || 'Admin'}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
