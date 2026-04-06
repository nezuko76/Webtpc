import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Leaf } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      toast.success('Mã OTP đã gửi vào email!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email không tồn tại');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.resetPassword({ email, otp, newPassword });
      toast.success('Đặt lại mật khẩu thành công!');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP sai hoặc đã hết hạn');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-green-600 p-3 rounded-2xl inline-flex mb-3"><Leaf className="h-7 w-7 text-white" /></div>
          <h1 className="text-2xl font-bold text-gray-800">Quên mật khẩu</h1>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <p className="text-sm text-gray-500 text-center mb-4">Nhập email để nhận mã OTP đặt lại mật khẩu</p>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your-email@gmail.com" required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-60">
              {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-gray-500 text-center mb-2">Nhập mã OTP gửi đến <strong>{email}</strong></p>
            <input value={otp} onChange={(e) => setOtp(e.target.value)}
              placeholder="Nhập mã 6 số" maxLength={6} required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-green-500" />
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mật khẩu mới (tối thiểu 6 ký tự)" required minLength={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-60">
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-gray-700 font-semibold mb-2">Đặt lại mật khẩu thành công!</p>
            <Link to="/login" className="inline-block bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-green-700 transition-colors mt-2">
              Đăng nhập ngay
            </Link>
          </div>
        )}

        {step < 3 && (
          <p className="text-center text-sm text-gray-500 mt-5">
            <Link to="/login" className="text-green-600 font-medium hover:text-green-700">← Quay lại đăng nhập</Link>
          </p>
        )}
      </div>
    </div>
  );
}
