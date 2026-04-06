import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader, Eye, AlertCircle } from 'lucide-react';
import { formatPrice, formatDate, ORDER_STATUS } from '../utils/format';
import orderService from '../services/orderService';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 0, size: 10, total: 0 });

  useEffect(() => {
    fetchOrders(0);
  }, []);

  const fetchOrders = async (page) => {
    try {
      setLoading(true);
      const result = await orderService.getMyOrders({ page, size: pagination.size });
      setOrders(result.content || []);
      setPagination((prev) => ({
        ...prev,
        page,
        total: result.totalElements || 0,
      }));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    SHIPPING: 'bg-cyan-100 text-cyan-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  const paymentStatusColors = {
    UNPAID: 'bg-orange-100 text-orange-800',
    PAID: 'bg-green-100 text-green-800',
    REFUNDED: 'bg-red-100 text-red-800',
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Đơn hàng của tôi</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Chưa có đơn hàng</h2>
          <p className="text-gray-500 mt-2">Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 md:p-6">
                  {/* Order ID */}
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Mã đơn hàng</p>
                    <p className="font-bold text-gray-800">#{order.id}</p>
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Ngày tạo</p>
                    <p className="text-gray-700">{formatDate(order.createdAt)}</p>
                  </div>

                  {/* Total */}
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Tổng tiền</p>
                    <p className="font-bold text-green-600 text-lg">{formatPrice(order.totalAmount)}</p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Trạng thái</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${statusColors[order.status]}`}>
                        {ORDER_STATUS[order.status]?.label || order.status}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${paymentStatusColors[order.paymentStatus]}`}>
                        {order.paymentStatus === 'UNPAID' ? 'Chưa thanh toán' : order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Hoàn tiền'}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex items-end justify-end">
                    <Link to={`/orders/${order.id}`}>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm">
                        <Eye className="w-4 h-4" />
                        Chi tiết
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.total > pagination.size && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => fetchOrders(Math.max(0, pagination.page - 1))}
                disabled={pagination.page === 0}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Trước
              </button>

              {Array.from({ length: Math.ceil(pagination.total / pagination.size) }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => fetchOrders(idx)}
                  className={`px-4 py-2 rounded-lg ${
                    pagination.page === idx
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                onClick={() => fetchOrders(Math.min(Math.ceil(pagination.total / pagination.size) - 1, pagination.page + 1))}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.size) - 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
