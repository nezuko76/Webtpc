import { Link } from 'react-router-dom';
import { Leaf, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-green-600 p-1.5 rounded-lg">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">Thực Phẩm Sạch</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Cung cấp thực phẩm sạch, an toàn theo tiêu chuẩn VietGAP và hữu cơ. Cam kết nguồn gốc rõ ràng.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-white mb-4">Danh mục</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/products?categoryId=1" className="hover:text-green-400 transition-colors">Rau củ sạch</Link></li>
            <li><Link to="/products?categoryId=2" className="hover:text-green-400 transition-colors">Trái cây hữu cơ</Link></li>
            <li><Link to="/products?categoryId=3" className="hover:text-green-400 transition-colors">Thịt sạch</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-white mb-4">Hỗ trợ</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/orders" className="hover:text-green-400 transition-colors">Theo dõi đơn hàng</Link></li>
            <li><Link to="/profile" className="hover:text-green-400 transition-colors">Tài khoản</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-white mb-4">Liên hệ</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-green-500" /> 0901 234 567</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-green-500" /> hello@thucphamsach.vn</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-green-500" /> TP. Hồ Chí Minh</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-500">
        © 2024 Thực Phẩm Sạch. All rights reserved.
      </div>
    </footer>
  );
}
