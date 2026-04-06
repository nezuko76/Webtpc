import { useState, useEffect, useRef } from 'react';
import { adminService } from '../../services/adminService';
import Spinner from '../../components/common/Spinner';
import { Plus, Edit2, Trash2, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = { name: '', description: '', sortOrder: 0, isActive: true };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const fetch = () => {
    setLoading(true);
    adminService.getCategories()
      .then(res => {
        const data = res?.data?.data || res?.data || [];
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => {
    setEditing(null); setForm(EMPTY);
    setImage(null); setPreview(''); setModal(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description || '', sortOrder: c.sortOrder, isActive: c.isActive });
    setImage(null); setPreview(c.imageUrl || ''); setModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Vui lòng nhập tên danh mục'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      if (form.description) fd.append('description', form.description);
      fd.append('sortOrder', String(form.sortOrder));
      fd.append('isActive', form.isActive ? 'true' : 'false');
      if (image) fd.append('image', image);

      if (editing) {
        await adminService.updateCategory(editing.id, fd);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await adminService.createCategory(fd);
        toast.success('Tạo danh mục thành công');
      }
      setModal(false); fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi lưu danh mục');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa danh mục này?')) return;
    try {
      await adminService.deleteCategory(id);
      toast.success('Đã xóa danh mục');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi xóa danh mục');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">Quản lý danh mục</h1>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" /> Thêm danh mục
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="p-8"><Spinner /></div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Danh mục', 'Slug', 'Thứ tự', 'Trạng thái', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {c.imageUrl ? (
                        <img src={c.imageUrl} alt="" className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl">🥬</div>
                      )}
                      <span className="font-medium text-gray-800">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{c.slug}</td>
                  <td className="px-4 py-3 text-gray-600">{c.sortOrder}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.isActive ? 'Hiện' : 'Ẩn'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-gray-800">{editing ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
              <button onClick={() => setModal(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Tên danh mục *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Mô tả</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Thứ tự hiển thị</label>
                <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="accent-green-600" />
                <span className="text-sm text-gray-600">Hiển thị danh mục</span>
              </label>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-2">Hình ảnh</label>
                {preview && <img src={preview} alt="" className="w-20 h-20 rounded-xl object-cover mb-2" />}
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 border border-dashed border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-500 hover:border-green-400 transition-colors">
                  <Upload className="h-4 w-4" /> Chọn ảnh
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files[0]; if (f) { setImage(f); setPreview(URL.createObjectURL(f)); } }} />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={handleSave} disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl text-sm font-medium disabled:opacity-60">
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button onClick={() => setModal(false)} className="border border-gray-200 text-gray-600 px-6 py-2 rounded-xl text-sm">Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
