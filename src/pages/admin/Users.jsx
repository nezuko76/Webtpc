import { useState, useEffect } from 'react';
import { Edit2, Trash2, Shield, ShieldOff, Loader, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import api from '../../services/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 0, size: 15, total: 0 });
  const [editModal, setEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({ page: pagination.page, size: pagination.size });
      const pageData = res?.data?.data || res?.data || {};
      setUsers(pageData.content || []);
      setPagination(prev => ({ ...prev, total: pageData.totalElements || 0 }));
    } catch {
      toast.error('Lỗi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const updated = await adminService.toggleUserStatus(userId);
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
      toast.success('Cập nhật trạng thái thành công');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật trạng thái');
    }
  };

  const handleChangeRole = async (userId, role) => {
    try {
      const updated = await adminService.changeRole(userId, role);
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
      toast.success('Đã thay đổi quyền');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi thay đổi quyền');
    }
  };

  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({ fullName: user.fullName || '', phone: user.phone || '' });
    setEditModal(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/api/admin/users/${editUser.id}/info`, editForm);
      setUsers(prev => prev.map(u => u.id === editUser.id ? res.data.data : u));
      setEditModal(false);
      toast.success('Cập nhật thông tin thành công');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Xóa người dùng này? Không thể hoàn tác!')) return;
    try {
      await adminService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('Đã xóa người dùng');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi xóa người dùng');
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.size);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Quản lý người dùng</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Chưa có người dùng nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Họ tên</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">SĐT</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Vai trò</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Trạng thái</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{user.fullName}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3 text-gray-500">{user.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={e => handleChangeRole(user.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none bg-white"
                      >
                        <option value="CUSTOMER">Khách hàng</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                          title="Sửa thông tin"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`p-1.5 rounded-lg ${user.isActive ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                        >
                          {user.isActive ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Trước
          </button>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setPagination(prev => ({ ...prev, page: idx }))}
              className={`px-4 py-2 rounded-lg ${pagination.page === idx ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page >= totalPages - 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}

      {editModal && editUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-gray-800">Sửa thông tin người dùng</h2>
              <button onClick={() => setEditModal(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Email (không thể thay đổi)</p>
                <p className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded-xl">{editUser.email}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Họ và tên</label>
                <input
                  value={editForm.fullName}
                  onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Số điện thoại</label>
                <input
                  value={editForm.phone}
                  onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="0901 234 567"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl text-sm font-medium disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button
                onClick={() => setEditModal(false)}
                className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-2 rounded-xl text-sm"
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
