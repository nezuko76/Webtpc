# Frontend Files - Copy các đoạn code này vào project

## 1. File: src/services/api.js

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // ⭐ QUAN TRỌNG: KHÔNG set Content-Type cho FormData
    // Để browser tự set "multipart/form-data; boundary=..."
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (config.data && typeof config.data === 'object') {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 2. File: src/services/adminService.js

```javascript
import api from './api';

export const adminService = {
  // ============ PRODUCTS ============
  
  getProducts: (params) => 
    api.get('/api/admin/products', { params }),

  createProduct: (formData) =>
    api.post('/api/admin/products', formData, {
      headers: { 'Content-Type': undefined }, // ← để axios/browser tự set boundary
    }),

  updateProduct: (id, formData) =>
    api.put(`/api/admin/products/${id}`, formData, {
      headers: { 'Content-Type': undefined },
    }),

  deleteProduct: (id) => 
    api.delete(`/api/admin/products/${id}`),

  getLowStock: () => 
    api.get('/api/admin/products/low-stock'),

  // ============ CATEGORIES ============

  getCategories: () => 
    api.get('/api/admin/categories'),

  createCategory: (formData) =>
    api.post('/api/admin/categories', formData, {
      headers: { 'Content-Type': undefined },
    }),

  updateCategory: (id, formData) =>
    api.put(`/api/admin/categories/${id}`, formData, {
      headers: { 'Content-Type': undefined },
    }),

  deleteCategory: (id) => 
    api.delete(`/api/admin/categories/${id}`),

  // ============ ORDERS ============

  getOrders: (params) => 
    api.get('/api/admin/orders', { params }),

  updateOrderStatus: (id, status) =>
    api.put(`/api/admin/orders/${id}/status`, null, { params: { status } }),

  // ============ USERS ============

  getUsers: (params) => 
    api.get('/api/admin/users', { params }),

  toggleUserStatus: (id) => 
    api.put(`/api/admin/users/${id}/status`),

  changeRole: (id, role) =>
    api.put(`/api/admin/users/${id}/role`, null, { params: { role } }),

  deleteUser: (id) => 
    api.delete(`/api/admin/users/${id}`),

  // ============ COUPONS ============

  getCoupons: () => 
    api.get('/api/admin/coupons'),

  createCoupon: (data) => 
    api.post('/api/admin/coupons', data),

  updateCoupon: (id, data) => 
    api.put(`/api/admin/coupons/${id}`, data),

  deleteCoupon: (id) => 
    api.delete(`/api/admin/coupons/${id}`),

  // ============ BANNERS ============

  getBanners: () => 
    api.get('/api/admin/banners'),

  createBanner: (formData) =>
    api.post('/api/admin/banners', formData, {
      headers: { 'Content-Type': undefined },
    }),

  toggleBanner: (id) => 
    api.put(`/api/admin/banners/${id}/status`),

  deleteBanner: (id) => 
    api.delete(`/api/admin/banners/${id}`),
};
```

---

## 3. Ví dụ sử dụng: Tạo sản phẩm

```javascript
import { adminService } from '../services/adminService';

// React component example
const ProductForm = () => {
  const handleSubmit = async (formData) => {
    try {
      // formData là FormData object, không phải object thường
      const data = new FormData();
      data.append('name', formData.name);
      data.append('categoryId', formData.categoryId);
      data.append('price', formData.price);
      data.append('originalPrice', formData.originalPrice);
      data.append('stockQuantity', formData.stockQuantity);
      data.append('description', formData.description);
      data.append('certifications', formData.certifications);
      data.append('origin', formData.origin);
      data.append('unit', formData.unit);
      data.append('isFeatured', formData.isFeatured ? 'true' : 'false');
      data.append('isActive', formData.isActive ? 'true' : 'false');
      
      // ⭐ Thêm file ảnh - có thể nhiều file
      if (formData.images && formData.images.length > 0) {
        for (let image of formData.images) {
          data.append('images', image);
        }
      }

      const response = await adminService.createProduct(data);
      console.log('Tạo sản phẩm thành công:', response.data.data);
      
    } catch (error) {
      console.error('Lỗi:', error.response?.data?.message || error.message);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit({
        name: e.target.name.value,
        categoryId: e.target.categoryId.value,
        price: e.target.price.value,
        stockQuantity: e.target.stockQuantity.value,
        images: e.target.images.files, // HTMLFileList
        // ... các trường khác
      });
    }}>
      <input type="text" name="name" required />
      <input type="number" name="price" required />
      <input type="number" name="stockQuantity" required />
      <input type="file" name="images" multiple accept="image/*" />
      <button type="submit">Tạo sản phẩm</button>
    </form>
  );
};

export default ProductForm;
```

---

## 4. Checklist Frontend

- [ ] Cài đặt axios: `npm install axios`
- [ ] Tạo file `src/services/api.js`
- [ ] Tạo file `src/services/adminService.js`
- [ ] Import và sử dụng `adminService` thay vì gọi axios trực tiếp
- [ ] Khi gửi dữ liệu + file, **PHẢI dùng FormData**
- [ ] **KHÔNG** set thủ công `'Content-Type': 'multipart/form-data'` 
- [ ] Sử dụng `headers: { 'Content-Type': undefined }` để axios tự xử lý

---

## 5. Troubleshooting

### Lỗi: "Required request part 'images' is not present"
- Backend tìm kiếm file với tên `images`
- Frontend sử dụng: `formData.append('images', file);` (có thể append nhiều file với cùng tên)

### Lỗi: "File không được vượt quá 10MB"
- Kiểm tra file size trước khi upload
- Hoặc nén ảnh nhỏ hơn

### Lỗi: Chỉ chấp nhận ảnh JPEG, PNG, WebP, GIF
- Kiểm tra contentType của file
- Chỉ upload ảnh đúng format

---

## 6. Backend Response Format

**Success (200)**:
```json
{
  "status": "SUCCESS",
  "message": "Tạo sản phẩm thành công",
  "data": {
    "id": 1,
    "name": "Sản phẩm mới",
    "price": 100000,
    "primaryImageUrl": "/uploads/abc123.jpg",
    "imageUrls": ["/uploads/abc123.jpg"],
    ...
  }
}
```

**Error (400/500)**:
```json
{
  "status": "ERROR",
  "message": "Lỗi chi tiết từ backend",
  "data": null
}
```

---

📝 **Cập nhật:** 2026-04-05  
🔧 **Backend Status:** Đã fix triệt để + build thành công  
⏳ **Frontend Status:** Cần tạo 2 files theo hướng dẫn trên
