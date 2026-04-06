export const API_URL = 'http://localhost:8080';

export const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('blob')) return url;
  return `${API_URL}${url}`;
};

export const ORDER_STATUS = {
  PENDING:   { label: 'Chờ xử lý',  color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
  SHIPPING:  { label: 'Đang giao',   color: 'bg-purple-100 text-purple-700' },
  DELIVERED: { label: 'Đã giao',     color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Đã hủy',      color: 'bg-red-100 text-red-700' },
};
