import { useState, useEffect, useRef } from 'react';
import { adminService } from '../../services/adminService';
import { productService } from '../../services/productService';
import { formatPrice } from '../../utils/format';
import Spinner from '../../components/common/Spinner';
import Pagination from '../../components/common/Pagination';
import { Plus, Edit2, Trash2, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', categoryId: '', price: '', originalPrice: '',
  stockQuantity: '', description: '', certifications: '',
  origin: '', unit: '', isFeatured: false, isActive: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const fetchProducts = () => {
    setLoading(true);
    adminService.getProducts({ page, size: 15 })
      .then(res => {
        const pageData = res.data?.data || {};
        setProducts(pageData.content || []);
        setTotalPages(pageData.totalPages || 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [page]);

  useEffect(() => {
    productService.getCategories().then(r => {
      setCategories(Array.isArray(r) ? r : []);
    }).catch(() => setCategories([]));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImages([]);
    setPreviews([]);
    setModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || '',
      categoryId: String(p.categoryId || ''),
      price: p.price || '',
      originalPrice: p.originalPrice || '',
      stockQuantity: p.stockQuantity || '',
      description: p.description || '',
      certifications: p.certifications || '',
      origin: p.origin || '',
      unit: p.unit || '',
      isFeatured: p.featured === true || p.isFeatured === true,
      isActive: p.active !== false && p.isActive !== false,
    });
    setImages([]);
    setPreviews(p.imageUrls || []);
    setModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).filter(f => f instanceof File);
    if (files.length === 0) return;
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSave = async () => {
    if (!form.name?.trim()) { toast.error('Vui lòng nhập tên sản phẩm'); return; }
    if (!form.categoryId) { toast.error('Vui lòng chọn danh mục'); return; }
    if (!form.price) { toast.error('Vui lòng nhập giá bán'); return; }
    if (!form.stockQuantity) { toast.error('Vui lòng nhập số lượng'); return; }

    setSaving(true);

    const hasNewImages = Array.isArray(images)
      && images.length > 0
      && images[0] instanceof File;

    try {
      const jsonData = {
        name: form.name.trim(),
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        stockQuantity: Number(form.stockQuantity),
        description: form.description || null,
        certifications: form.certifications || null,
        origin: form.origin || null,
        unit: form.unit || null,
        isFeatured: form.isFeatured === true,
        isActive: form.isActive !== false,
      };

      let productId;
      if (editing) {
        const res = await adminService.updateProductJson(editing.id, jsonData);
        productId = res.data?.data?.id || editing.id;
      } else {
        const res = await adminService.createProductJson(jsonData);
        productId = res.data?.data?.id;
      }

      if (hasNewImages && productId) {
        const fd = new FormData();
        images.forEach(img => fd.append('images', img));
        await adminService.uploadProductImages(productId, fd);
      }

      toast.success(editing ? 'Cập nhật sản phẩm thành công' : 'Tạo sản phẩm thành công');
      setModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi lưu sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    try {
      await adminService.deleteProduct(id);
      toast.success('Đã xóa sản phẩm');
      fetchProducts();
    } catch {
      toast.error('Lỗi xóa sản phẩm');
    }
  };

  const prodActive = (p) => p.active === true || p.isActive === true;
  const prodFeatured = (p) => p.featured === true || p.isFeatured === true;

  const inp = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500';

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">Quản lý sản phẩm</h1>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" /> Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="p-8"><Spinner /></div> : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">📦</p>
            <p>Chưa có sản phẩm nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Sản phẩm', 'Danh mục', 'Giá', 'Tồn kho', 'Trạng thái', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.primaryImageUrl
                            ? (p.primaryImageUrl.startsWith('http') ? p.primaryImageUrl : `http://localhost:8080${p.primaryImageUrl}`)
                            : 'https://placehold.co/40x40/f0fdf4/16a34a?text=SP'}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                          onError={e => { e.target.src = 'https://placehold.co/40x40/f0fdf4/16a34a?text=SP'; }}
                        />
                        <div>
                          <p className="font-medium text-gray-800 max-w-[180px] truncate">{p.name}</p>
                          {p.certifications && <span className="text-xs text-green-600">{p.certifications}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.categoryName}</td>
                    <td className="px-4 py-3 font-semibold text-green-700">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${p.stockQuantity <= 5 ? 'text-red-500' : p.stockQuantity <= 20 ? 'text-amber-500' : 'text-gray-700'}`}>
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit ${prodActive(p) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {prodActive(p) ? 'Đang bán' : 'Ẩn'}
                        </span>
                        {prodFeatured(p) && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium w-fit bg-yellow-100 text-yellow-700">Nổi bật</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="font-bold text-gray-800 text-lg">
                {editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h2>
              <button onClick={() => setModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Tên sản phẩm <span className="text-red-500">*</span></label>
                  <input value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="VD: Rau cải xanh VietGAP 500g"
                    className={inp} />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Danh mục <span className="text-red-500">*</span></label>
                  <select value={form.categoryId}
                    onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                    className={inp}>
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Giá bán (VND) <span className="text-red-500">*</span></label>
                  <input type="number" min="0" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="25000"
                    className={inp} />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Giá gốc (VND)</label>
                  <input type="number" min="0" value={form.originalPrice}
                    onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                    placeholder="30000"
                    className={inp} />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Tồn kho <span className="text-red-500">*</span></label>
                  <input type="number" min="0" value={form.stockQuantity}
                    onChange={e => setForm(f => ({ ...f, stockQuantity: e.target.value }))}
                    placeholder="100"
                    className={inp} />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Đơn vị</label>
                  <input value={form.unit}
                    onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                    placeholder="kg, bó, túi..."
                    className={inp} />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Xuất xứ</label>
                  <input value={form.origin}
                    onChange={e => setForm(f => ({ ...f, origin: e.target.value }))}
                    placeholder="Đà Lạt, Lâm Đồng..."
                    className={inp} />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Chứng nhận</label>
                  <input value={form.certifications}
                    onChange={e => setForm(f => ({ ...f, certifications: e.target.value }))}
                    placeholder="VietGAP, Organic..."
                    className={inp} />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Mô tả</label>
                  <textarea value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                    placeholder="Mô tả chi tiết sản phẩm..."
                    className={`${inp} resize-none`} />
                </div>

                <div className="col-span-2 flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured}
                      onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))}
                      className="w-4 h-4 accent-yellow-500" />
                    <span className="text-sm text-gray-700">⭐ Sản phẩm nổi bật</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive}
                      onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                      className="w-4 h-4 accent-green-600" />
                    <span className="text-sm text-gray-700">✅ Đang bán / hiển thị</span>
                  </label>
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-2">
                    Hình ảnh sản phẩm
                    {editing && <span className="text-gray-400 font-normal"> (bỏ trống = giữ ảnh cũ)</span>}
                  </label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors">
                    {previews.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {previews.map((url, i) => (
                          <div key={i} className="relative">
                            <img
                              src={url.startsWith('http') || url.startsWith('blob') ? url : `http://localhost:8080${url}`}
                              alt=""
                              className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                            />
                            {i === 0 && (
                              <span className="absolute -top-1 -left-1 bg-green-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">1</span>
                            )}
                          </div>
                        ))}
                        <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 text-xs gap-1">
                          <Upload className="h-4 w-4" />
                          <span>Thêm</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Nhấn để chọn ảnh</p>
                        <p className="text-xs text-gray-300 mt-1">JPG, PNG, WebP — tối đa 10MB</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" multiple accept="image/*"
                    className="hidden" onChange={handleImageChange} />
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
                {saving ? 'Đang lưu...' : editing ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
              </button>
              <button onClick={() => setModal(false)}
                className="px-6 border border-gray-200 text-gray-600 hover:bg-gray-100 py-2.5 rounded-xl text-sm font-medium transition-colors">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
