import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, MapPin, CreditCard, Tag, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/format';
import api from '../services/api';
import orderService from '../services/orderService';
import userService from '../services/userService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [couponCode, setCouponCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState(null);
  const [notes, setNotes] = useState('');
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const totalDiscount = Number(discountInfo?.discountAmount || 0);
  const finalTotal = Math.max(0, subtotal + shippingFee - totalDiscount);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const result = await userService.getAddresses();
      setAddresses(result);
      if (result.length > 0) {
        const defaultAddr = result.find((a) => a.isDefault);
        setSelectedAddress(defaultAddr?.id || result[0].id);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách địa chỉ');
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await api.get('/api/coupons/validate', {
        params: { code: couponCode.trim().toUpperCase(), subtotal },
      });
      setDiscountInfo(res.data.data);
      toast.success('Áp dụng mã giảm giá thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mã giảm giá không hợp lệ');
      setDiscountInfo(null);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast.error('Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    try {
      setSubmitting(true);
      const checkoutData = {
        addressId: selectedAddress,
        paymentMethod,
        couponCode: totalDiscount > 0 ? couponCode.trim().toUpperCase() : undefined,
        notes,
      };

      await orderService.checkout(checkoutData);
      toast.success('Đặt hàng thành công!');
      clearCart();
      navigate('/orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi đặt hàng');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Giỏ hàng trống</h2>
        <button
          onClick={() => navigate('/products')}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700"
        >
          Quay lại mua hàng
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Section - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-800">Chọn địa chỉ giao hàng</h2>
            </div>

            <div className="space-y-3 mb-4">
              {addresses.map((addr) => (
                <label key={addr.id} className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition" style={{ borderColor: selectedAddress === addr.id ? '#2563eb' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    checked={selectedAddress === addr.id}
                    onChange={() => setSelectedAddress(addr.id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{addr.recipientName}</p>
                    <p className="text-sm text-gray-600">{addr.fullAddress}</p>
                    <p className="text-sm text-gray-600 mt-1">{addr.phone}</p>
                    {addr.isDefault && (
                      <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Mặc định</span>
                    )}
                  </div>
                </label>
              ))}
            </div>

            <button
              onClick={() => navigate('/profile')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              + Thêm địa chỉ mới
            </button>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-800">Phương thức thanh toán</h2>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition">
                <input
                  type="radio"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                />
                <div>
                  <p className="font-medium text-gray-800">Thanh toán khi nhận hàng (COD)</p>
                  <p className="text-sm text-gray-500">Thanh toán tiền mặt khi nhận đơn hàng</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition">
                <input
                  type="radio"
                  checked={paymentMethod === 'BANK_TRANSFER'}
                  onChange={() => setPaymentMethod('BANK_TRANSFER')}
                />
                <div>
                  <p className="font-medium text-gray-800">Chuyển khoản ngân hàng</p>
                  <p className="text-sm text-gray-500">Chuyển tiền trước khi giao hàng</p>
                </div>
              </label>
            </div>
          </div>

          {/* Coupon Code */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Tag className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-800">Mã giảm giá</h2>
            </div>

            <div className="flex gap-3 mb-3">
              <input
                type="text"
                placeholder="Nhập mã giảm giá"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleApplyCoupon}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Áp dụng
              </button>
            </div>

            {discountInfo && (
              <p className="text-green-600 text-sm">✓ {discountInfo.description}</p>
            )}
          </div>

          {/* Order Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-800">Ghi chú đơn hàng</h2>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Ghi chú cho người bán..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Right Section - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Tóm tắt đơn hàng</h2>

            {/* Items List */}
            <div className="space-y-2 mb-4 pb-4 border-b max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex justify-between text-sm text-gray-700">
                  <span>{item.productName} x{item.quantity}</span>
                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="space-y-2 mb-4 pb-4 border-b text-sm">
              <div className="flex justify-between text-gray-700">
                <span>Tạm tính:</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-gray-700">
                <span>Phí vận chuyển:</span>
                <span className="font-medium">{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
              </div>

              {totalDiscount > 0 ? (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  <span className="font-medium">-{formatPrice(totalDiscount)}</span>
                </div>
              ) : (
                <div className="flex justify-between text-gray-500">
                  <span>Mã giảm giá:</span>
                  <span className="font-medium">Chưa áp dụng</span>
                </div>
              )}

              <div className="flex justify-between text-gray-700">
                <span>Phí vận chuyển:</span>
                <span className="font-medium">{formatPrice(shippingFee)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Tổng cộng:</span>
                <span className="text-2xl font-bold text-green-600">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={!selectedAddress || submitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting && <Loader className="w-4 h-4 animate-spin" />}
              {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
