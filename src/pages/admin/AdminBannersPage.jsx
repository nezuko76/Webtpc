import { useState, useEffect, useRef } from 'react';
import { adminService } from '../../services/adminService';
import Spinner from '../../components/common/Spinner';
import { Plus, Trash2, ToggleLeft, ToggleRight, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/format';

const bannerActive = (b) => b.active === true || b.isActive === true;

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', linkUrl: '', sortOrder: 0 });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const fetch = () => {
    setLoading(true);
    adminService.getBanners()
      .then(res => {
        const data = res?.data?.data || res?.data || [];
        setBanners(Array.isArray(data) ? data : []);
      })
      .catch(() => setBanners([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    if (!image && !form.title) { toast.error('Vui lòng chọn ảnh và nhập tiêu đề'); return; }
    if (!image) { toast.error('Vui lòng chọn ảnh banner'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      if (form.linkUrl) fd.append('linkUrl', form.linkUrl);
      fd.append('sortOrder', form.sortOrder);
      fd.append('image', image);
      await adminService.createBanner(fd);
      toast.success('Tạo banner thành công');
      setModal(false);
      setForm({ title: '', linkUrl: '', sortOrder: 0 });
      setImage(null); setPreview('');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi tạo banner');
    } finally { setSaving(false); }
  };

  const handleToggle = async (id) => {
    try {
      const res = await adminService.toggleBanner(id);
      setBanners(prev => prev.map(b =>
        b.id === id ? { ...b, ...res } : b
      ));
      toast.success('Cập nhật trạng thái thành công');
    } catch (err) {
      toast.error('Lỗi cập nhật');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa banner này?')) return;
    try { await adminService.deleteBanner(id); toast.success('Đã xóa banner'); fetch(); }
    catch { toast.error('Lỗi xóa banner'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">Quản lý Banner</h1>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" /> Thêm banner
        </button>
      </div>

      {loading ? <div className="p-8"><Spinner /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map(b => (
            <div key={b.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="relative aspect-[3/1] bg-gray-100">
                <img
                  src={getImageUrl(b.imageUrl)}
                  alt={b.title}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.src = 'https://placehold.co/600x200/f0fdf4/16a34a?text=Banner'; }}
                />
                {!bannerActive(b) && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">Đang ẩn</span>
                  </div>
                )}
              </div>
              <div className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{b.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${
                    bannerActive(b) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {bannerActive(b) ? '✅ Đang hiển thị' : '🚫 Đang ẩn'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(b.id)}
                    className={`p-2 rounded-xl transition-colors ${
                      bannerActive(b) ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    title={bannerActive(b) ? 'Ẩn banner' : 'Hiện banner'}
                  >
                    {bannerActive(b) ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {banners.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <p className="text-4xl mb-2">🖼️</p>
              <p>Chưa có banner nào</p>
            </div>
          )}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-gray-800">Thêm banner mới</h2>
              <button onClick={() => setModal(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Tiêu đề *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Link khi click (tùy chọn)</label>
                <input value={form.linkUrl} onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
                  placeholder="/products?categoryId=1"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Thứ tự</label>
                <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-2">Ảnh banner * (tỷ lệ 3:1 hoặc 16:5)</label>
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="" className="w-full rounded-xl object-cover aspect-[3/1]" />
                    <button onClick={() => { setImage(null); setPreview(''); }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-8 flex flex-col items-center gap-2 text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors">
                    <Upload className="h-8 w-8" />
                    <span className="text-sm">Nhấn để chọn ảnh</span>
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files[0]; if (f) { setImage(f); setPreview(URL.createObjectURL(f)); } }} />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={handleSave} disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl text-sm font-medium disabled:opacity-60">
                {saving ? 'Đang lưu...' : 'Tạo banner'}
              </button>
              <button onClick={() => setModal(false)} className="border border-gray-200 text-gray-600 px-6 py-2 rounded-xl text-sm">Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
