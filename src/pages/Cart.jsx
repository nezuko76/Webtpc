import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/format';
import { useCart } from '../contexts/CartContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, subtotal, removeItem, updateItem } = useCart();
  const [loading, setLoading] = useState({});

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    try {
      setLoading(prev => ({ ...prev, [cartItemId]: true }));
      if (newQuantity <= 0) {
        await removeItem(cartItemId);
        toast.success('Xóa khỏi giỏ hàng');
      } else {
        await updateItem(cartItemId, newQuantity);
      }
    } catch (error) {
      toast.error('Lỗi cập nhật giỏ hàng');
    } finally {
      setLoading(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  const handleRemove = async (cartItemId) => {
    try {
      setLoading(prev => ({ ...prev, [cartItemId]: true }));
      await removeItem(cartItemId);
      toast.success('Xóa khỏi giỏ hàng');
    } catch (error) {
      toast.error('Lỗi xóa sản phẩm');
    } finally {
      setLoading(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Giỏ hàng trống</h2>
        <p className="text-gray-500 mb-8">Hãy thêm sản phẩm vào giỏ hàng</p>
        <Link to="/products" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Giỏ hàng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Sản phẩm</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Giá</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Số lượng</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Thành tiền</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.cartItemId} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <Link to={`/products/${item.productId}`} className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium text-gray-800 hover:text-blue-600">
                            {item.productName}
                          </p>
                          <p className="text-xs text-gray-500">SKU: {item.skuCode}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-gray-700 font-medium">
                      {formatPrice(item.price)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}
                          disabled={loading[item.cartItemId] || item.quantity <= 1}
                          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.cartItemId, parseInt(e.target.value))}
                          min="1"
                          max={item.stockQuantity}
                          className="w-12 px-2 py-1 text-center border border-gray-300 rounded"
                          disabled={loading[item.cartItemId]}
                        />
                        <button
                          onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                          disabled={loading[item.cartItemId] || item.quantity >= item.stockQuantity}
                          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-700 font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleRemove(item.cartItemId)}
                        disabled={loading[item.cartItemId]}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm">Xóa</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Tóm tắt đơn hàng</h2>
            
            <div className="space-y-3 mb-4 pb-4 border-b">
              <div className="flex justify-between text-gray-700">
                <span>Tạm tính:</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Phí vận chuyển:</span>
                <span className="font-medium text-orange-500">Tính khi thanh toán</span>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Tổng cộng:</span>
                <span className="text-2xl font-bold text-green-600">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Tiến hành thanh toán
              </button>
              <Link to="/products">
                <button className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:border-gray-400 transition flex items-center justify-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Tiếp tục mua sắm
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
