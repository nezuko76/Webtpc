import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/common/Spinner';
import { formatPrice, formatDate } from '../utils/format';
import { ShoppingCart, Star, Shield, Minus, Plus, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, loading: cartLoading } = useCart();
  const { isLoggedIn } = useAuth();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState({ total: 0, pages: 0 });
  const [quantity, setQuantity] = useState(1);
  const [ activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    productService.getById(id).then(res => {
      const p = res.data.data;
      setProduct(p);
      setActiveImg(0);
      productService.getRelated(id, p.categoryId).then(r => setRelated(r.data.data || []));
    }).finally(() => setLoading(false));
    api.get(`/api/products/${id}/reviews`).then(res => {
      setReviews(res.data.data.content || []);
      setReviewPage({ total: res.data.data.totalElements, pages: res.data.data.totalPages });
    });
  }, [id]);

  const handleAddToCart = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    try {
      await addItem(product.id, quantity);
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi thêm vào giỏ');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      const res = await api.post(`/api/products/${id}/reviews`, { rating, comment });
      setReviews(prev => [res.data.data, ...prev]);
      setComment('');
      toast.success('Đánh giá thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi gửi đánh giá');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!product) return <div className="text-center py-20 text-gray-500">Sản phẩm không tồn tại</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-green-600">Trang chủ</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/products" className="hover:text-green-600">Sản phẩm</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-800 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3">
            <img
              src={product.imageUrls?.[activeImg] || '/placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://placehold.co/600x600/f0fdf4/16a34a?text=🥬'; }}
            />
          </div>
          {product.imageUrls?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.imageUrls.map((url, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === activeImg ? 'border-green-600' : 'border-transparent hover:border-gray-300'}`}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start gap-2 mb-2">
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{product.categoryName}</span>
            {product.certifications && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <Shield className="h-3 w-3" /> {product.certifications}
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">{product.name}</h1>

          {/* Rating */}
          {product.averageRating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`h-4 w-4 ${s <= Math.round(product.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <span className="text-sm text-gray-600">{product.averageRating.toFixed(1)} ({reviewPage.total} đánh giá)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-end gap-3 mb-6">
            <span className="text-3xl font-bold text-green-700">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-lg">
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* Details */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
            {product.origin && <div className="flex gap-2"><span className="text-gray-500 w-24">Xuất xứ:</span><span className="font-medium">{product.origin}</span></div>}
            {product.unit && <div className="flex gap-2"><span className="text-gray-500 w-24">Đơn vị:</span><span className="font-medium">{product.unit}</span></div>}
            <div className="flex gap-2">
              <span className="text-gray-500 w-24">Tình trạng:</span>
              <span className={`font-medium ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stockQuantity > 0 ? `Còn ${product.stockQuantity} sản phẩm` : 'Hết hàng'}
              </span>
            </div>
          </div>

          {/* Quantity + Add to cart */}
          {product.stockQuantity > 0 && (
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-3 hover:bg-gray-100 transition-colors">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
                  className="p-3 hover:bg-gray-100 transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button onClick={handleAddToCart} disabled={cartLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors disabled:opacity-60">
                <ShoppingCart className="h-5 w-5" />
                Thêm vào giỏ hàng
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Mô tả sản phẩm</h2>
          <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line">{product.description}</div>
        </div>
      )}

      {/* Reviews */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-10">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Đánh giá ({reviewPage.total})</h2>

        {/* Write review */}
        <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="font-medium text-gray-700 mb-3">Viết đánh giá của bạn</p>
          <div className="flex gap-1 mb-3">
            {[1,2,3,4,5].map(s => (
              <button key={s} type="button" onClick={() => setRating(s)}>
                <Star className={`h-6 w-6 transition-colors ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`} />
              </button>
            ))}
          </div>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
            rows={3} className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 mb-3" />
          <button type="submit" disabled={submitting}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>

        {/* Review list */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Chưa có đánh giá nào</p>
          ) : reviews.map(r => (
            <div key={r.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
              <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                {r.userAvatar ? (
                  <img src={r.userAvatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <span className="text-green-700 font-bold text-sm">{r.userName?.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-gray-800">{r.userName}</span>
                  <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                </div>
                <div className="flex my-1">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-5">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
