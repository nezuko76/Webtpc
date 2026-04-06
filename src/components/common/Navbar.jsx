import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Leaf, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

export default function Navbar() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-green-600 p-1.5 rounded-lg">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-green-700 text-lg hidden sm:block">Thực Phẩm Sạch</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm rau củ, trái cây..."
                className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-green-600 transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {cart?.totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cart.totalItems > 99 ? '99+' : cart.totalItems}
                </span>
              )}
            </Link>

            {/* User menu */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-700 font-semibold text-sm">
                        {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </button>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                      <div className="px-4 py-2 border-b border-gray-50">
                        <p className="text-sm font-semibold text-gray-800 truncate">{user?.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <User className="h-4 w-4" /> Tài khoản của tôi
                      </Link>
                      <Link to="/orders" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <ShoppingCart className="h-4 w-4" /> Đơn hàng
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50 font-medium">
                          <Settings className="h-4 w-4" /> Quản trị
                        </Link>
                      )}
                      <hr className="my-1" />
                      <button onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="h-4 w-4" /> Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm text-gray-600 hover:text-green-600 font-medium px-3 py-1.5">
                  Đăng nhập
                </Link>
                <Link to="/register"
                  className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-full hover:bg-green-700 font-medium transition-colors">
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600">
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {menuOpen && (
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
}
