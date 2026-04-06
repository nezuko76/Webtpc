import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import Spinner from '../components/common/Spinner';
import { formatPrice, formatDate, ORDER_STATUS } from '../utils/format';
import { ChevronLeft, MapPin, CreditCard, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    orderService.getOrderDetail(id)
      .then(orderData => {
        if (!orderData) {
          setError('Dữ liệu đơn hàng trống');
          return;
        }
        setOrder(orderData);
      })
      .catch(err => {
        console.error('Order fetch error:', err); // Full error object
        console.error('Error response:', err.response); // Response from server
        const errorMsg = err.response?.data?.message 
          || `Lỗi ${err.response?.status || 'unknown'}: ${err.message}`;
        setError(errorMsg);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    setCancelling(true);
    try {
      const updated = await orderService.cancelOrder(id);
      if (updated) {
        setOrder(updated);
      } else {
        const refreshed = await orderService.getOrderDetail(id);
        setOrder(refreshed);
      }
      toast.success('Hủy đơn hàng thành công');
    } catch (err) {
      if (err.response?.status === 200 || !err.response) {
        const refreshed = await orderService.getOrderDetail(id);
        setOrder(refreshed);
        toast.success('Đã hủy đơn hàng');
      } else {
        toast.error(err.response?.data?.message || 'Không thể hủy đơn hàng');
      }
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Spinner size="lg" />
    </div>
  );

  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-center">
      <p className="text-red-500 text-lg mb-4">{error}</p>
      <button onClick={() => navigate('/orders')}
        className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700">
        Quay lại đơn hàng
      </button>
    </div>
  );

  if (!order) return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-center text-gray-500">
      Đơn hàng không tồn tại
    </div>
  );

  const statusInfo = ORDER_STATUS[order.status];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/orders" className="flex items-center gap-2 text-gray-500 hover:text-green-600 mb-6 text-sm">
        <ChevronLeft className="h-4 w-4" /> Quay lại đơn hàng
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Đơn hàng #{order.id}</h1>
          <p className="text-sm text-gray-400 mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${statusInfo?.color || 'bg-gray-100 text-gray-700'}`}>
          {statusInfo?.label || order.status}
        </span>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
        <h2 className="font-semibold text-gray-800 mb-4">Sản phẩm ({order.items?.length || 0})</h2>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex gap-3 pb-3 border-b border-gray-50 last:border-0">
              <img
                src={item.productImage
                  ? (item.productImage.startsWith('http') ? item.productImage : `http://localhost:8080${item.productImage}`)
                  : 'https://placehold.co/60x60/f0fdf4/16a34a?text=SP'}
                alt={item.productName}
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                onError={e => { e.target.src = 'https://placehold.co/60x60/f0fdf4/16a34a?text=SP'; }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm">{item.productName}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatPrice(item.price)} × {item.quantity}</p>
              </div>
              <p className="font-bold text-gray-800 flex-shrink-0">{formatPrice(item.subtotal)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Address + Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {order.shippingAddress && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-2 text-sm">
              <MapPin className="h-4 w-4 text-green-600" /> Địa chỉ giao
            </h3>
            <p className="text-sm font-medium text-gray-800">{order.shippingAddress.recipientName}</p>
            <p className="text-sm text-gray-500">{order.shippingAddress.phone}</p>
            <p className="text-sm text-gray-500 mt-1">{order.shippingAddress.fullAddress}</p>
          </div>
        )}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-2 text-sm">
            <CreditCard className="h-4 w-4 text-green-600" /> Thanh toán
          </h3>
          <p className="text-sm text-gray-600">
            {order.paymentMethod === 'COD' ? '💵 Tiền mặt (COD)' : '🏦 Chuyển khoản'}
          </p>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {order.paymentStatus === 'PAID' ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}
          </span>
        </div>
      </div>

      {/* Price summary */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Tạm tính</span><span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Phí vận chuyển</span><span>{formatPrice(order.shippingFee)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                Giảm giá {order.couponCode && `(${order.couponCode})`}
              </span>
              <span>-{formatPrice(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg text-gray-800 border-t border-gray-100 pt-2">
            <span>Tổng cộng</span>
            <span className="text-green-700">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Cancel button */}
      {order.status === 'PENDING' && (
        <button onClick={handleCancel} disabled={cancelling}
          className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-xl font-semibold transition-colors disabled:opacity-60">
          {cancelling ? 'Đang hủy...' : '❌ Hủy đơn hàng'}
        </button>
      )}
    </div>
  );
}
