import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Spinner from '../../components/common/Spinner';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import toast from 'react-hot-toast';

const EMPTY = { code: '', description: '', discountType: 'PERCENTAGE', discountValue: '', minOrderAmount: '', maxDiscountAmount: '', usageLimit: '', expiresAt: '', isActive: true };

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    setLoading(true);
    adminService.getCoupons()
      .then(res => {
        const data = res?.data?.data || res?.data || [];
        setCoupons(Array.isArray(data) ? data : []);
      })
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      code: c.code, description: c.description || '',
      discountType: c.discountType, discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount || '', maxDiscountAmount: c.maxDiscountAmount || '',
      usageLimit: c.usageLimit || '', expiresAt: c.expiresAt ? c.expiresAt.slice(0, 16) : '',
      isActive: c.isActive
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.discountValue) { toast.error('Vui lòng điền đầy đủ'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiresAt: form.expiresAt ? form.expiresAt + ':00' : null,
      };
      if (editing) {
        await adminService.updateCoupon(editing.id, payload);
        toast.success('Cập nhật thành công');
      } else {
        await adminService.createCoupon(payload);
        toast.success('Tạo coupon thành công');
      }
      setModal(false); fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi lưu coupon');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa coupon này?')) return;
    try { await adminService.deleteCoupon(id); toast.success('Đã xóa'); fetch(); }
    catch { toast.error('Lỗi xóa coupon'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">Quản lý mã giảm giá</h1>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" /> Thêm mã
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="p-8"><Spinner /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Mã', 'Loại giảm', 'Giá trị', 'Đã dùng', 'Hết hạn', 'Trạng thái', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold text-green-700">{c.code}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {c.discountType === 'PERCENTAGE' ? 'Phần trăm' : 'Cố định'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : formatPrice(c.discountValue)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {c.usedCount}/{c.usageLimit || '∞'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {c.isActive ? 'Hoạt động' : 'Tắt'}
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
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-gray-800">{editing ? 'Sửa coupon' : 'Thêm coupon'}</h2>
              <button onClick={() => setModal(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1">Mã coupon *</label>
                  <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="SALE20" disabled={!!editing}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Loại giảm giá</label>
                  <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="PERCENTAGE">Phần trăm (%)</option>
                    <option value="FIXED_AMOUNT">Số tiền cố định</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Giá trị * {form.discountType === 'PERCENTAGE' ? '(%)' : '(VND)'}
                  </label>
                  <input type="number" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Đơn hàng tối thiểu (VND)</label>
                  <input type="number" value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Giảm tối đa (VND)</label>
                  <input type="number" value={form.maxDiscountAmount} onChange={e => setForm(f => ({ ...f, maxDiscountAmount: e.target.value }))}
                    placeholder="Không giới hạn"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Giới hạn lượt dùng</label>
                  <input type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))}
                    placeholder="Không giới hạn"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Ngày hết hạn</label>
                  <input type="datetime-local" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1">Mô tả</label>
                  <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Giảm 20% cho đơn từ 200k"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="accent-green-600" />
                  <span className="text-sm text-gray-600">Kích hoạt</span>
                </label>
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
