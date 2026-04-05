# Hướng Dẫn API Upload Ảnh Sản Phẩm

## Endpoint Tạo Sản Phẩm Với Ảnh

**URL:** `http://localhost:8080/api/admin/products`  
**Method:** `POST`  
**Content-Type:** `multipart/form-data` (Browser tự set, KHÔNG set thủ công)

## Yêu Cầu (Request Parameters)

| Tên trường | Kiểu | Bắt buộc | Mô tả |
|-----------|------|---------|-------|
| name | string | ✓ | Tên sản phẩm |
| categoryId | number | ✓ | ID danh mục |
| price | number | ✓ | Giá bán (VND) |
| originalPrice | number | | Giá gốc (VND) |
| stockQuantity | number | ✓ | Số lượng tồn kho |
| description | string | | Mô tả sản phẩm |
| certifications | string | | Chứng chỉ |
| origin | string | | Xuất xứ |
| unit | string | | Đơn vị tính |
| isFeatured | boolean | | Sản phẩm nổi bật (true/false) |
| isActive | boolean | | Kích hoạt (true/false) |
| **image** | **file** | | **Ảnh sản phẩm (JPEG/PNG/WebP/GIF, max 10MB)** |

## Ví Dụ Frontend - React/JavaScript

### ❌ SAI - Cách OLD (Backend sẽ rejected)
```javascript
// SAI: Gửi JSON @RequestBody
const response = await fetch('http://localhost:8080/api/admin/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }, // ❌ SAI
  body: JSON.stringify({
    name: 'Sản phẩm test',
    categoryId: 1,
    price: 100000,
    image: file, // ❌ File không thể serialize thành JSON
  })
});
```

### ✅ ĐÚNG - Cách NEW (Backend sẽ accept)
```javascript
// ✅ ĐÚNG: Gửi FormData
const formData = new FormData();
formData.append('name', 'Sản phẩm test');
formData.append('categoryId', '1');
formData.append('price', '100000');
formData.append('originalPrice', '120000');
formData.append('stockQuantity', '50');
formData.append('description', 'Mô tả sản phẩm');
formData.append('certifications', 'Chứng chỉ');
formData.append('origin', 'Việt Nam');
formData.append('unit', 'Cái');
formData.append('isFeatured', 'false');
formData.append('isActive', 'true');
formData.append('image', imageFile); // imageFile là File object từ <input type="file">

const response = await fetch('http://localhost:8080/api/admin/products', {
  method: 'POST',
  body: formData,
  // ❌ KHÔNG set headers: { 'Content-Type': 'multipart/form-data' }
  // Browser tự động set đúng headers khi body là FormData
});

const data = await response.json();
if (response.ok) {
  console.log('Tạo sản phẩm thành công:', data.data);
} else {
  console.error('Lỗi:', data.message);
}
```

### Ví dụ với axios
```javascript
const formData = new FormData();
formData.append('name', 'Sản phẩm test');
formData.append('categoryId', '1');
formData.append('price', '100000');
formData.append('image', imageFile);

const { data } = await axios.post(
  'http://localhost:8080/api/admin/products',
  formData,
  {
    headers: {
      'Authorization': `Bearer ${token}` // Nếu cần auth
      // KHÔNG cần set Content-Type, axios sẽ tự set
    }
  }
);
```

### Ví dụ React Hook Form + FormData
```javascript
const { register, watch } = useForm();
const imageFile = watch('image')[0]; // Lấy file từ input

const onSubmit = async (data) => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('categoryId', data.categoryId);
  formData.append('price', data.price);
  // ... các trường khác
  formData.append('image', imageFile);

  const response = await fetch('http://localhost:8080/api/admin/products', {
    method: 'POST',
    body: formData,
  });
};
```

## Lỗi Thường Gặp Và Cách Fix

### 1. "Failed to parse multipart servlet request"
**Nguyên nhân:** Frontend gửi sai định dạng (JSON thay vì FormData)  
**Fix:** Sử dụng FormData, KHÔNG set Content-Type header

### 2. "Required request part 'image' is not present"
**Nguyên nhân:** Không gửi file image hoặc tên trường sai  
**Fix:** Đảm bảo `formData.append('image', fileObject)` với đúng tên trường

### 3. "File không được vượt quá 10MB"
**Nguyên nhân:** File quá lớn  
**Fix:** Nén hoặc sử dụng ảnh nhỏ hơn 10MB

### 4. "Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF)"
**Nguyên nhân:** Gửi định dạng file không hỗ trợ  
**Fix:** Chỉ upload ảnh JPEG, PNG, WebP, hoặc GIF

## Response Thành Công (200 OK)
```json
{
  "status": "SUCCESS",
  "message": "Tạo sản phẩm thành công",
  "data": {
    "id": 1,
    "name": "Sản phẩm test",
    "price": 100000,
    "primaryImageUrl": "/uploads/abc123.jpg",
    "imageUrls": ["/uploads/abc123.jpg"],
    // ...
  }
}
```

## Response Lỗi (400/500)
```json
{
  "status": "ERROR",
  "message": "Lỗi chi tiết",
  "data": null
}
```

---
**Cập nhật:** 2026-04-05  
**Nghiêm túc:** PHẢI dùng FormData, KHÔNG được gửi JSON khi có file!
