import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { formatPrice, formatDate, ORDER_STATUS } from '../../utils/format';
import Spinner from '../../components/common/Spinner';
import Pagination from '../../components/common/Pagination';
import { X, MapPin, CreditCard, Tag, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

const STATUS_FLOW = {
  PENDING: ['PENDING', 'CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['CONFIRMED', 'SHIPPING', 'CANCELLED'],
  SHIPPING: ['SHIPPING', 'DELIVERED', 'CANCELLED'],
  DELIVERED: ['DELIVERED'],
  CANCELLED: ['CANCELLED'],
};

const isLocked = (status) => status === 'DELIVERED' || status === 'CANCELLED';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    adminService.getOrders({ page, size: 15 })
      .then(res => {
        const data = res.data?.data?.content || [];
        setOrders(data.filter(o => o && o.id)); // lọc bỏ row lỗi
        setTotalPages(res.data?.data?.totalPages || 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [page]);

  const handleStatusChange = async (id, status) => {
    try {
      const res = await adminService.updateOrderStatus(id, status);
      const updated = res.data?.data;
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updated } : o));
      if (detail?.id === id) setDetail(prev => ({ ...prev, ...updated }));
      toast.success('Cập nhật trạng thái thành công');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật');
    }
  };

  const statusColor = (s) => ORDER_STATUS[s]?.color || 'bg-gray-100 text-gray-600';
  const statusLabel = (s) => ORDER_STATUS[s]?.label || s;

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-5">Quản lý đơn hàng</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="p-8"><Spinner /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Mã', 'Khách', 'SP', 'Tổng tiền', 'Trạng thái', 'Thanh toán', 'Ngày đặt', 'Cập nhật'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(o => (
                  <tr
                    key={o.id}
                    onClick={() => setDetail(o)}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${isLocked(o.status) ? 'opacity-70' : ''}`}
                  >
                    <td className="px-3 py-3 font-mono text-xs font-bold text-gray-600">#{o.id}</td>
                    <td className="px-3 py-3">
                      <p className="text-xs font-medium text-gray-800 truncate max-w-[80px]">
                        {o.shippingAddress?.recipientName || '—'}
                      </p>
                      <p className="text-xs text-gray-400 truncate max-w-[80px]">
                        {o.shippingAddress?.phone || ''}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {o.items?.length || 0} SP
                    </td>
                    <td className="px-3 py-3 font-bold text-green-700 whitespace-nowrap">
                      {formatPrice(o.totalAmount)}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${statusColor(o.status)}`}>
                        {statusLabel(o.status)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${o.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {o.paymentStatus === 'PAID' ? 'Đã TT' : 'Chưa TT'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                      {isLocked(o.status) ? (
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <Lock className="h-3.5 w-3.5" />
                          <span>Đã khoá</span>
                        </div>
                      ) : (
                        <select
                          value={o.status}
                          onChange={e => handleStatusChange(o.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
                        >
                          {(STATUS_FLOW[o.status] || STATUS_OPTIONS).map(s => (
                            <option key={s} value={s}>{statusLabel(s)}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      {/* Modal chi tiết */}
      {detail && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <div>
                <h2 className="font-bold text-gray-800 text-lg">
                  Chi tiết đơn hàng #{detail.id}
                  {isLocked(detail.status) && (
                    <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-normal">
                      🔒 Đã hoàn thành
                    </span>
                  )}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(detail.createdAt)}</p>
              </div>
              <button onClick={() => setDetail(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Trạng thái */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Trạng thái đơn hàng</p>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${statusColor(detail.status)}`}>
                    {statusLabel(detail.status)}
                  </span>
                </div>
                {!isLocked(detail.status) ? (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cập nhật trạng thái</p>
                    <select
                      value={detail.status}
                      onChange={e => handleStatusChange(detail.id, e.target.value)}
                      className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white font-medium"
                    >
                      {(STATUS_FLOW[detail.status] || STATUS_OPTIONS).map(s => (
                        <option key={s} value={s}>{statusLabel(s)}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400 text-sm bg-gray-100 px-3 py-2 rounded-xl">
                    <Lock className="h-4 w-4" />
                    <span>Không thể thay đổi</span>
                  </div>
                )}
              </div>

              {/* Địa chỉ + Thanh toán */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-2">
                    <MapPin className="h-3.5 w-3.5" /> Giao đến
                  </p>
                  <p className="text-sm font-semibold text-gray-800">{detail.shippingAddress?.recipientName}</p>
                  <p className="text-xs text-gray-500">{detail.shippingAddress?.phone}</p>
                  <p className="text-xs text-gray-500 mt-1">{detail.shippingAddress?.fullAddress}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-2">
                    <CreditCard className="h-3.5 w-3.5" /> Thanh toán
                  </p>
                  <p className="text-sm text-gray-700">
                    {detail.paymentMethod === 'COD' ? '💵 Tiền mặt COD' : '🏦 Chuyển khoản'}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${detail.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {detail.paymentStatus === 'PAID' ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}
                  </span>
                </div>
              </div>

              {/* Sản phẩm */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">SẢN PHẨM ({detail.items?.length || 0})</p>
                <div className="space-y-2">
                  {detail.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      <img
                        src={item.productImage
                          ? (item.productImage.startsWith('http') ? item.productImage : `http://localhost:8080${item.productImage}`)
                          : 'https://placehold.co/48x48/f0fdf4/16a34a?text=SP'}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                        onError={e => { e.target.src = 'https://placehold.co/48x48/f0fdf4/16a34a?text=SP'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.productName}</p>
                        <p className="text-xs text-gray-400">{formatPrice(item.price)} × {item.quantity}</p>
                      </div>
                      <p className="font-bold text-gray-800 flex-shrink-0">{formatPrice(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tổng tiền */}
              <div className="bg-green-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tạm tính</span><span>{formatPrice(detail.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Phí vận chuyển</span><span>{formatPrice(detail.shippingFee)}</span>
                </div>
                {detail.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" />
                      Giảm giá {detail.couponCode && `(${detail.couponCode})`}
                    </span>
                    <span>-{formatPrice(detail.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg text-gray-800 border-t border-green-200 pt-2">
                  <span>Tổng cộng</span>
                  <span className="text-green-700">{formatPrice(detail.totalAmount)}</span>
                </div>
              </div>

              {detail.notes && (
                <div className="bg-yellow-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Ghi chú</p>
                  <p className="text-sm text-gray-700">{detail.notes}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100">
              <button onClick={() => setDetail(null)}
                className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 py-2.5 rounded-xl text-sm font-medium transition-colors">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
