import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Loader, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductCard from '../components/product/ProductCard';
import { formatPrice } from '../utils/format';
import productService from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 0, size: 12, total: 0 });
  const [filters, setFilters] = useState({
    categoryId: searchParams.get('categoryId') || null,
    search: searchParams.get('search') || '',
    sort: 'newest',
    minPrice: null,
    maxPrice: null,
  });
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filters, pagination.page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const result = await productService.getProducts({
        ...filters,
        page: pagination.page,
        size: pagination.size,
      });
      setProducts(result.content || []);
      setPagination((prev) => ({
        ...prev,
        total: result.totalElements || 0,
      }));
    } catch (error) {
      toast.error('Lỗi tải danh sách sản phẩm');
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await productService.getCategories();
      setCategories(result);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }
    try {
      await addItem(productId, 1);
      toast.success('Thêm vào giỏ hàng thành công!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi thêm vào giỏ hàng');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Danh sách sản phẩm</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4 space-y-6">
              <h3 className="text-lg font-bold text-gray-800">Bộ lọc</h3>
              
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục:</label>
                <select
                  value={filters.categoryId || ''}
                  onChange={(e) => handleFilterChange('categoryId', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sắp xếp:</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá thấp đến cao</option>
                  <option value="price_desc">Giá cao đến thấp</option>
                  <option value="sold">Bán chạy</option>
                  <option value="rating">Đánh giá cao</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Khoảng giá:</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => {
                        const newMin = parseInt(e.target.value) || 0;
                        setPriceRange(prev => ({ ...prev, min: newMin }));
                        handleFilterChange('minPrice', newMin);
                      }}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded text-sm"
                      placeholder="Từ"
                    />
                    <span className="text-gray-500">—</span>
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => {
                        const newMax = parseInt(e.target.value) || 1000000;
                        setPriceRange(prev => ({ ...prev, max: newMax }));
                        handleFilterChange('maxPrice', newMax);
                      }}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded text-sm"
                      placeholder="Đến"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <h2 className="text-xl font-semibold text-gray-700">Không tìm thấy sản phẩm</h2>
                <p className="text-gray-500 mt-2">Vui lòng thử lại với bộ lọc khác</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {products.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAddToCart={() => handleAddToCart(product.id)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.total > pagination.size && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(0, prev.page - 1) }))}
                      disabled={pagination.page === 0}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    >
                      Trước
                    </button>
                    
                    {Array.from({ length: Math.ceil(pagination.total / pagination.size) }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPagination(prev => ({ ...prev, page: idx }))}
                        className={`px-4 py-2 rounded-lg ${
                          pagination.page === idx
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setPagination(prev => ({ 
                        ...prev, 
                        page: Math.min(Math.ceil(pagination.total / pagination.size) - 1, prev.page + 1) 
                      }))}
                      disabled={pagination.page >= Math.ceil(pagination.total / pagination.size) - 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
