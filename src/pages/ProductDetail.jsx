import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader, ShoppingCart, Star, Truck, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/format';
import ProductCard from '../components/product/ProductCard';
import productService from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const productData = await productService.getById(id);
      setProduct(productData);
      setSelectedImage(0);

      // Fetch related products
      if (productData.categoryId) {
        const relatedData = await productService.getRelated(id, productData.categoryId);
        setRelated(relatedData);
      }
    } catch (error) {
      toast.error('Không thể tải sản phẩm');
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }
    try {
      await addItem(product.id, quantity);
      toast.success('Thêm vào giỏ hàng thành công!');
      setQuantity(1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi thêm vào giỏ hàng');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Sản phẩm không tồn tại</h2>
        <Link to="/products" className="text-blue-600 hover:text-blue-700">
          Quay lại
        </Link>
      </div>
    );
  }

  const images = product.imageUrls || [product.primaryImageUrl];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-12">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-600 mb-8">
        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-blue-600">Sản phẩm</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          {/* Main Image */}
          <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-96 object-cover"
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition ${
                    selectedImage === idx
                      ? 'border-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(product.averageRating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.averageRating?.toFixed(1) || '0'}/5 ({product.reviewCount || 0} đánh giá)
            </span>
            <span className="text-sm text-gray-600">• Đã bán {product.soldCount || 0}</span>
          </div>

          {/* Category */}
          <p className="text-sm text-gray-600 mb-4">Danh mục: {product.categoryName}</p>

          {/* Price */}
          <div className="mb-6 p-4 bg-orange-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {formatPrice(product.price)}
            </div>
            {product.originalPrice && (
              <div className="text-sm text-gray-600 line-through">
                {formatPrice(product.originalPrice)}
              </div>
            )}
          </div>

          {/* Stock Status */}
          <div className={`mb-6 p-3 rounded-lg ${
            product.stockQuantity > 0
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}>
            {product.stockQuantity > 0
              ? `✓ Còn ${product.stockQuantity} sản phẩm trong kho`
              : '✗ Hết hàng'}
          </div>

          {/* Add to Cart */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng:</label>
              <div className="flex items-center gap-3 w-32">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stockQuantity, parseInt(e.target.value) || 1)))}
                  className="w-full text-center px-2 py-2 border border-gray-300 rounded"
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  disabled={quantity >= product.stockQuantity}
                  className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Thêm vào giỏ hàng
            </button>
          </div>

          {/* Features */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Giao hàng toàn quốc</p>
                <p className="text-sm text-gray-600">Miễn phí từ 100.000đ</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Đổi trả trong 7 ngày</p>
                <p className="text-sm text-gray-600">Nếu sản phẩm lỗi hoặc không đúng</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-12">
        <div className="flex border-b">
          {['description', 'info', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium border-b-2 transition ${
                activeTab === tab
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-800'
              }`}
            >
              {tab === 'description' && 'Mô tả'}
              {tab === 'info' && 'Thông tin'}
              {tab === 'reviews' && 'Đánh giá'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'description' && (
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-4">
              {product.origin && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Xuất xứ:</h4>
                  <p className="text-gray-700">{product.origin}</p>
                </div>
              )}
              {product.unit && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Đơn vị:</h4>
                  <p className="text-gray-700">{product.unit}</p>
                </div>
              )}
              {product.certifications && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Chứng chỉ:</h4>
                  <p className="text-gray-700">{product.certifications}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="text-center text-gray-600">
              <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {related.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
                onAddToCart={() => {
                  if (!isAuthenticated) {
                    toast.error('Vui lòng đăng nhập');
                    return;
                  }
                  addItem(relatedProduct.id, 1).then(() => {
                    toast.success('Thêm vào giỏ hàng thành công!');
                  });
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const ReviewSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/products/${productId}/reviews?page=0&size=10`);
      setReviews(res.data.data.content);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spin />;

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {reviews.length === 0 ? (
        <div>Chưa có đánh giá</div>
      ) : (
        reviews.map((review) => (
          <Card key={review.id} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Rate value={review.rating} disabled />
                <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>{review.userName}</span>
              </div>
              <p>{review.comment}</p>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {new Date(review.createdAt).toLocaleDateString('vi-VN')}
              </div>
            </Space>
          </Card>
        ))
      )}
    </Space>
  );
};
