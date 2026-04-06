import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Spinner from '../../components/common/Spinner';
import Pagination from '../../components/common/Pagination';
import { Edit2, Trash2, Shield, ShieldOff, X, User } from 'lucide-react';
import { formatDate } from '../../utils/format';
import toast from 'react-hot-toast';

const ROLES = ['CUSTOMER', 'ADMIN'];

const EMPTY_EDIT = {
  fullName: '', phone: '', role: 'CUSTOMER', isActive: true, note: '',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_EDIT);
  const [saving, setSaving] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    adminService.getUsers({ page, size: 15 })
      .then(res => {
        const data = res.data?.data?.content || res.data?.data || [];
        // Lọc bỏ user không có id
        setUsers(Array.isArray(data) ? data.filter(u => u && u.id) : []);
        setTotalPages(res.data?.data?.totalPages || 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const userActive = (u) => u.active === true || u.isActive === true;

  const openEdit = (u) => {
    if (!u?.id) return;
    setEditing(u);
    setForm({
      fullName: u.fullName || '',
      phone: u.phone || u.phoneNumber || '',
      role: u.role || 'CUSTOMER',
      isActive: userActive(u),
      note: '',
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.fullName?.trim()) { toast.error('Vui lòng nhập họ tên'); return; }
    setSaving(true);
    try {
      // Thay đổi role nếu thay đổi
      if (form.role !== editing.role) {
        await adminService.changeRole(editing.id, form.role);
      }

      // Thay đổi trạng thái nếu thay đổi
      if (form.isActive !== userActive(editing)) {
        await adminService.toggleUserStatus(editing.id);
      }

      toast.success('Cập nhật người dùng thành công');
      setModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    if (!id) return;
    try {
      await adminService.toggleUserStatus(id);
      setUsers(prev => prev.map(u =>
        u.id === id
          ? { ...u, active: !(u.active === true || u.isActive === true), isActive: !(u.active === true || u.isActive === true) }
          : u
      ));
      toast.success('Cập nhật trạng thái thành công');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật');
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!confirm('Xóa người dùng này? Hành động không thể hoàn tác.')) return;
    try {
      await adminService.deleteUser(id);
      toast.success('Đã xóa người dùng');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi xóa người dùng');
    }
  };

  const inp = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500';

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-5">Quản lý người dùng</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="p-8"><Spinner /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Họ tên', 'Email', 'SĐT', 'Vai trò', 'Trạng thái', 'Ngày tạo', 'Thao tác'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u, index) => (
                  <tr key={u.id ?? `user-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {u.avatarUrl ? (
                            <img
                              src={u.avatarUrl.startsWith('http') ? u.avatarUrl : `http://localhost:8080${u.avatarUrl}`}
                              alt=""
                              className="h-9 w-9 object-cover"
                              onError={e => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <span className="text-green-700 font-bold text-sm">
                              {u.fullName?.charAt(0) || '?'}
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-gray-800 max-w-[120px] truncate">
                          {u.fullName || '—'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[160px] truncate">
                      {u.email}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {u.phone || u.phoneNumber || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {u.role === 'ADMIN' ? '👑 Admin' : '👤 Khách hàng'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${userActive(u) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {userActive(u) ? '✅ Hoạt động' : '🔒 Bị khóa'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* Sửa */}
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        {/* Khóa/Mở */}
                        <button
                          onClick={() => handleToggle(u.id)}
                          className={`p-1.5 rounded-lg transition-colors ${userActive(u) ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={userActive(u) ? 'Khóa tài khoản' : 'Mở khóa'}
                        >
                          {userActive(u)
                            ? <ShieldOff className="h-3.5 w-3.5" />
                            : <Shield className="h-3.5 w-3.5" />}
                        </button>

                        {/* Xóa */}
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
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

      {/* Modal chỉnh sửa chi tiết */}
      {modal && editing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 text-lg">Chỉnh sửa người dùng</h2>
              <button onClick={() => setModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">

              {/* Avatar + Email (chỉ xem) */}
              <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {editing.avatarUrl ? (
                    <img
                      src={editing.avatarUrl.startsWith('http') ? editing.avatarUrl : `http://localhost:8080${editing.avatarUrl}`}
                      alt=""
                      className="h-14 w-14 object-cover"
                    />
                  ) : (
                    <User className="h-7 w-7 text-green-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{editing.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Tham gia: {formatDate(editing.createdAt)}
                  </p>
                  <p className="text-xs text-gray-400">
                    Đăng nhập cuối: {editing.lastLogin ? formatDate(editing.lastLogin) : 'Chưa có'}
                  </p>
                </div>
              </div>

              {/* Họ tên */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Họ và tên <span className="text-gray-400">(hiển thị)</span>
                </label>
                <input
                  disabled
                  value={form.fullName}
                  placeholder="Thông tin từ profile"
                  className={`${inp} bg-gray-50 cursor-not-allowed opacity-60`}
                />
              </div>

              {/* SĐT */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Số điện thoại <span className="text-gray-400">(hiển thị)</span></label>
                <input
                  disabled
                  value={form.phone}
                  placeholder="Thông tin từ profile"
                  className={`${inp} bg-gray-50 cursor-not-allowed opacity-60`}
                />
              </div>

              {/* Vai trò */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Vai trò</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className={inp}
                >
                  <option value="CUSTOMER">👤 Khách hàng</option>
                  <option value="ADMIN">👑 Admin</option>
                </select>
              </div>

              {/* Trạng thái */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">Trạng thái tài khoản</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setForm(f => ({ ...f, isActive: true }))}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-colors ${form.isActive ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    ✅ Hoạt động
                  </button>
                  <button
                    onClick={() => setForm(f => ({ ...f, isActive: false }))}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-colors ${!form.isActive ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    🔒 Bị khóa
                  </button>
                </div>
              </div>

              {/* Thông tin xác minh */}
              <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 mb-2">THÔNG TIN TÀI KHOẢN</p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Email xác minh</span>
                  <span className={editing.emailVerified ? 'text-green-600 font-medium' : 'text-orange-500'}>
                    {editing.emailVerified ? '✅ Đã xác minh' : '⏳ Chưa xác minh'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Đăng nhập Google</span>
                  <span className={editing.googleId ? 'text-blue-600' : 'text-gray-400'}>
                    {editing.googleId ? '✅ Có liên kết' : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">ID người dùng</span>
                  <span className="text-gray-600 font-mono">#{editing.id}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : '💾 Lưu thay đổi'}
              </button>
              <button
                onClick={() => setModal(false)}
                className="px-6 border border-gray-200 text-gray-600 hover:bg-gray-100 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
