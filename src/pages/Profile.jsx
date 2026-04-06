import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, Upload, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import userService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('profile');
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [profileData, setProfileData] = useState({
    email: '',
    fullName: '',
    phone: '',
  });
  const [addressForm, setAddressForm] = useState({
    recipientName: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    detail: '',
    isDefault: false,
  });

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
  }, []);

  const fetchProfile = async () => {
    try {
      const userData = await userService.getProfile();
      setProfileData({
        email: userData?.email || '',
        fullName: userData?.fullName || '',
        phone: userData?.phone || '',
      });
    } catch (error) {
      toast.error('Không thể tải hồ sơ');
      console.error('Failed to fetch profile:', error);
    }
  };

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const addrs = await userService.getAddresses();
      setAddresses(Array.isArray(addrs) ? addrs : []);
    } catch (error) {
      toast.error('Không thể tải danh sách địa chỉ');
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await userService.updateProfile(profileData);
      toast.success('Cập nhật hồ sơ thành công!');
      fetchProfile();
    } catch (error) {
      toast.error('Lỗi cập nhật hồ sơ');
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      recipientName: '',
      phone: '',
      province: '',
      district: '',
      ward: '',
      detail: '',
      isDefault: false,
    });
    setIsModalOpen(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm(address);
    setIsModalOpen(true);
  };

  const handleSaveAddress = async () => {
    if (!addressForm.recipientName || !addressForm.phone || !addressForm.detail) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      if (editingAddress) {
        await userService.updateAddress(editingAddress.id, addressForm);
        toast.success('Cập nhật địa chỉ thành công!');
      } else {
        await userService.addAddress(addressForm);
        toast.success('Thêm địa chỉ thành công!');
      }
      setIsModalOpen(false);
      fetchAddresses();
    } catch (error) {
      toast.error('Lỗi lưu địa chỉ');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (confirm('Bạn chắc chắn muốn xóa địa chỉ này?')) {
      try {
        await userService.deleteAddress(id);
        toast.success('Xóa địa chỉ thành công!');
        fetchAddresses();
      } catch (error) {
        toast.error('Lỗi xóa địa chỉ');
      }
    }
  };

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await userService.updateAvatar(file);
      toast.success('Cập nhật ảnh đại diện thành công!');
      fetchProfile();
    } catch (error) {
      toast.error('Lỗi cập nhật ảnh');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Tài khoản của tôi</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b">
        <button
          onClick={() => setTab('profile')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            tab === 'profile'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-800'
          }`}
        >
          Thông tin cá nhân
        </button>
        <button
          onClick={() => setTab('addresses')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            tab === 'addresses'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-800'
          }`}
        >
          Địa chỉ giao hàng
        </button>
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Avatar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh đại diện</label>
                <div className="flex items-end gap-4">
                  {profileData.avatar && (
                    <img
                      src={profileData.avatar}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover border"
                    />
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadAvatar}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={(e) => e.currentTarget.parentElement.querySelector('input').click()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Chọn ảnh
                    </button>
                  </label>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Cập nhật
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Addresses Tab */}
      {tab === 'addresses' && (
        <div>
          <button
            onClick={handleAddAddress}
            className="mb-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm địa chỉ mới
          </button>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500">Chưa có địa chỉ nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800">{address.recipientName}</h3>
                      <p className="text-sm text-gray-600 mt-1">{address.phone}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {address.detail}, {address.ward}, {address.district}, {address.province}
                      </p>
                    </div>
                    {address.isDefault && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded font-medium">
                        Mặc định
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditAddress(address)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editingAddress ? 'Sửa địa chỉ' : 'Thêm địa chỉ'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên người nhận</label>
                <input
                  type="text"
                  value={addressForm.recipientName}
                  onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                <input
                  type="text"
                  value={addressForm.province}
                  onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                <input
                  type="text"
                  value={addressForm.district}
                  onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
                <input
                  type="text"
                  value={addressForm.ward}
                  onChange={(e) => setAddressForm({ ...addressForm, ward: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết</label>
                <input
                  type="text"
                  value={addressForm.detail}
                  onChange={(e) => setAddressForm({ ...addressForm, detail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Đặt làm địa chỉ mặc định</span>
              </label>

              <div className="flex gap-2 justify-end pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveAddress}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
