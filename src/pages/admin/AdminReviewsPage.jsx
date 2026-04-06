import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Spinner from '../../components/common/Spinner';
import { Star, Eye, EyeOff, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/format';
import toast from 'react-hot-toast';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    adminService.getReviews({ page: 0, size: 50 })
      .then(res => {
        const pageData = res.data?.data || {};
        setReviews(pageData.content || []);
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleToggle = async (id) => {
    try {
      await adminService.toggleReview(id);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, visible: !r.visible } : r));
      toast.success('Cập nhật thành công');
    } catch { toast.error('Lỗi'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa đánh giá này?')) return;
    try {
      await adminService.deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success('Đã xóa đánh giá');
    } catch { toast.error('Lỗi xóa đánh giá'); }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-5">Quản lý đánh giá</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="p-8"><Spinner /></div> : reviews.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Star className="h-12 w-12 mx-auto mb-3 text-gray-200" />
            <p>Chưa có đánh giá nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {reviews.map(r => (
              <div key={r.id} className="p-4 flex items-start gap-4 hover:bg-gray-50">
                <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  {r.userAvatar ? (
                    <img src={r.userAvatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <span className="text-green-700 font-bold text-sm">{r.userName?.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-800">{r.userName}</span>
                    <div className="flex">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                    {!r.visible && (
                      <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Đang ẩn</span>
                    )}
                  </div>
                  {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleToggle(r.id)}
                    className={`p-1.5 rounded-lg transition-colors ${r.visible ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                    title={r.visible ? 'Ẩn đánh giá' : 'Hiện đánh giá'}>
                    {r.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => handleDelete(r.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
