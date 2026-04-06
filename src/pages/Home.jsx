import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Shield, Truck, Award, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductCard from '../components/product/ProductCard';
import { getImageUrl } from '../utils/format';
import productService from '../services/productService';

const bannerActive = (b) => b.active === true || b.isActive === true;

const features = [
  { icon: Shield, title: 'Chứng nhận VietGAP', desc: 'Toàn bộ sản phẩm đạt chuẩn an toàn' },
  { icon: Truck, title: 'Giao hàng tận nơi', desc: 'Miễn phí ship đơn từ 500.000đ' },
  { icon: Award, title: 'Cam kết chất lượng', desc: 'Hoàn tiền 100% nếu không hài lòng' },
  { icon: Leaf, title: 'Tươi mỗi ngày', desc: 'Thu hoạch và giao trong ngày' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);

  useEffect(() => {
    Promise.all([
      productService.getFeatured(),
      productService.getCategories(),
      productService.getBanners(),
    ]).then(([f, c, b]) => {
      setFeatured(f.data?.data || f || []);
      setCategories(c.data?.data || c || []);
      // Chỉ lấy banner đang active
      const allBanners = b.data?.data || b || [];
      const activeBanners = allBanners.filter(bn => bannerActive(bn));
      setBanners(activeBanners);
    }).catch(err => {
      console.error('Error loading home data:', err);
      toast.error('Lỗi tải dữ liệu');
    }).finally(() => setLoading(false));
  }, []);

  // Auto slide
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setBannerIdx(i => (i + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners]);

  const prevBanner = () => setBannerIdx(i => (i - 1 + banners.length) % banners.length);
  const nextBanner = () => setBannerIdx(i => (i + 1) % banners.length);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-2 border-green-200 border-t-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ===== BANNER SLIDER ===== */}
      {banners.length > 0 ? (
        <div className="relative overflow-hidden bg-gray-900" style={{ height: '400px' }}>
          {/* Slides */}
          {banners.map((b, i) => (
            <div
              key={b.id}
              className={`absolute inset-0 transition-opacity duration-700 ${i === bannerIdx ? 'opacity-100' : 'opacity-0'}`}
            >
              <img
                src={getImageUrl(b.imageUrl)}
                alt={b.title || 'Banner'}
                className="w-full h-full object-cover"
                onError={e => {
                  e.target.style.display = 'none';
                  e.target.parentElement.style.background = 'linear-gradient(135deg, #14532d, #16a34a)';
                }}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/20" />
              {/* Text overlay */}
              {b.title && (
                <div className="absolute bottom-8 left-8 right-8">
                  <h2 className="text-white text-2xl font-bold drop-shadow-lg">{b.title}</h2>
                  {b.linkUrl && (
                    <Link to={b.linkUrl}
                      className="inline-block mt-2 bg-white text-green-700 px-5 py-2 rounded-full font-semibold text-sm hover:bg-green-50 transition-colors">
                      Xem ngay →
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Nút prev/next */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prevBanner}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all z-10"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextBanner}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all z-10"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Dots indicator */}
          {banners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setBannerIdx(i)}
                  className={`rounded-full transition-all ${i === bannerIdx ? 'bg-white w-6 h-2' : 'bg-white/50 w-2 h-2'}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Hero mặc định nếu không có banner */
        <div className="bg-gradient-to-br from-green-700 to-green-500 py-20 px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">🌿 Thực Phẩm Sạch</h1>
          <p className="text-lg text-green-100 mb-8 max-w-xl mx-auto">
            Rau củ quả tươi sạch, chứng nhận VietGAP
          </p>
          <Link to="/products"
            className="inline-flex items-center gap-2 bg-white text-green-700 px-8 py-3 rounded-full font-bold hover:bg-green-50 transition-colors">
            Mua ngay <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      )}

      {/* ===== FEATURES ===== */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
              <div className="bg-green-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <f.icon className="h-6 w-6 text-green-700" />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Danh mục sản phẩm</h2>
            <Link to="/products" className="text-green-600 text-sm font-medium flex items-center gap-1 hover:text-green-700">
              Xem tất cả <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map(cat => (
              <Link key={cat.id} to={`/products?categoryId=${cat.id}`}
                className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all group">
                <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2 overflow-hidden group-hover:bg-green-100 transition-colors">
                  {cat.imageUrl ? (
                    <img
                      src={getImageUrl(cat.imageUrl)}
                      alt={cat.name}
                      className="h-full w-full object-cover rounded-full"
                      onError={e => { e.target.src = ''; e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <Leaf className="h-7 w-7 text-green-600" />
                  )}
                </div>
                <p className="text-xs font-medium text-gray-700 line-clamp-2">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== FEATURED PRODUCTS ===== */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Sản phẩm nổi bật</h2>
            <Link to="/products" className="text-green-600 text-sm font-medium flex items-center gap-1 hover:text-green-700">
              Xem tất cả <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

    </div>
  );
}
