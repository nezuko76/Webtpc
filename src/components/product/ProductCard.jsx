import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatPrice, getImageUrl } from '../../utils/format';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addItem, loading } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { navigate('/login'); return; }
    try {
      await addItem(product.id, 1);
      toast.success('Đã thêm vào giỏ hàng!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể thêm vào giỏ');
    }
  };

  return (
    <Link to={`/products/${product.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 flex flex-col">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={getImageUrl(product.primaryImageUrl) || 'https://placehold.co/300x300/f0fdf4/16a34a?text=🥬'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = 'https://placehold.co/300x300/f0fdf4/16a34a?text=🥬'; }}
        />
        {product.originalPrice && product.originalPrice > product.price && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </span>
        )}
        {product.certifications && (
          <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            {product.certifications.split(',')[0].trim()}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-gray-400 mb-1">{product.categoryName}</p>
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 flex-1">{product.name}</h3>

        {/* Rating */}
        {product.averageRating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gray-600">{product.averageRating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({product.reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-base font-bold text-green-700">{formatPrice(product.price)}</p>
            {product.originalPrice > product.price && (
              <p className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
            )}
          </div>
          <button onClick={handleAddToCart} disabled={loading || product.stockQuantity === 0}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
            <ShoppingCart className="h-3.5 w-3.5" />
            {product.stockQuantity === 0 ? 'Hết hàng' : 'Thêm'}
          </button>
        </div>

        {product.unit && <p className="text-xs text-gray-400 mt-1">ĐVT: {product.unit}</p>}
      </div>
    </Link>
  );
}
