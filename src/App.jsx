import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { PrivateRoute, AdminRoute } from './components/common/PrivateRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AdminLayout from './pages/admin/AdminLayout';

import HomePage from './pages/Home';
import ProductListPage from './pages/ProductList';
import ProductDetailPage from './pages/ProductDetail';
import CartPage from './pages/Cart';
import CheckoutPage from './pages/Checkout';
import OrderHistoryPage from './pages/Orders';
import OrderDetailPage from './pages/OrderDetailPage';
import ProfilePage from './pages/Profile';
import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';
import ForgotPasswordPage from './pages/auth/ForgotPassword';
import OAuth2CallbackPage from './pages/auth/OAuth2Callback';

import DashboardPage from './pages/admin/Dashboard';
import AdminProductsPage from './pages/admin/Products';
import AdminOrdersPage from './pages/admin/Orders';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminBannersPage from './pages/admin/AdminBannersPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';

function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function CartBridge() {
  const { fetchCartRef, isLoggedIn } = useAuth();
  const { fetchCart } = useCart();

  useEffect(() => {
    fetchCartRef.current = fetchCart;
  }, [fetchCart]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchCart();
    }
  }, [isLoggedIn, fetchCart]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <CartBridge />
          <Toaster position="top-right" toastOptions={{
            duration: 3000,
            style: { borderRadius: '12px', fontSize: '14px' },
            success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
          }} />
          <Routes>
            {/* Auth routes - no navbar */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminRoute><AdminLayout><DashboardPage /></AdminLayout></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminLayout><AdminProductsPage /></AdminLayout></AdminRoute>} />
            <Route path="/admin/categories" element={<AdminRoute><AdminLayout><AdminCategoriesPage /></AdminLayout></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminLayout><AdminOrdersPage /></AdminLayout></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminLayout><AdminUsersPage /></AdminLayout></AdminRoute>} />
            <Route path="/admin/coupons" element={<AdminRoute><AdminLayout><AdminCouponsPage /></AdminLayout></AdminRoute>} />
            <Route path="/admin/banners" element={<AdminRoute><AdminLayout><AdminBannersPage /></AdminLayout></AdminRoute>} />
            <Route path="/admin/reviews" element={<AdminRoute><AdminLayout><AdminReviewsPage /></AdminLayout></AdminRoute>} />

            {/* Customer routes */}
            <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
            <Route path="/products" element={<MainLayout><ProductListPage /></MainLayout>} />
            <Route path="/products/:id" element={<MainLayout><ProductDetailPage /></MainLayout>} />
            <Route path="/cart" element={<MainLayout><CartPage /></MainLayout>} />
            <Route path="/checkout" element={<MainLayout><PrivateRoute><CheckoutPage /></PrivateRoute></MainLayout>} />
            <Route path="/orders" element={<MainLayout><PrivateRoute><OrderHistoryPage /></PrivateRoute></MainLayout>} />
            <Route path="/orders/:id" element={<MainLayout><PrivateRoute><OrderDetailPage /></PrivateRoute></MainLayout>} />
            <Route path="/profile" element={<MainLayout><PrivateRoute><ProfilePage /></PrivateRoute></MainLayout>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

