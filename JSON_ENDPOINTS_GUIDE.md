# ✅ 新增: JSON 端点用于创建/更新产品 (不上传图像)

## 📌 两个新 Endpoint 已添加

### 1. POST /api/admin/products/no-image
**用途:** 创建产品而不上传图像  
**Content-Type:** `application/json`  
**Request Body:**
```json
{
  "name": "Sản phẩm test",
  "categoryId": "1",
  "price": "100000",
  "originalPrice": "120000",
  "stockQuantity": "50",
  "description": "Mô tả sản phẩm",
  "certifications": "Chứng chỉ",
  "origin": "Việt Nam",
  "unit": "Cái",
  "isFeatured": "false",
  "isActive": "true"
}
```

**Response (201):**
```json
{
  "status": "SUCCESS",
  "message": "Tạo sản phẩm thành công",
  "data": {
    "id": 1,
    "name": "Sản phẩm test",
    ...
  }
}
```

---

### 2. PUT /api/admin/products/{id}/no-image
**用途:** 更新产品而不改变图像  
**Path:** `/api/admin/products/1/no-image`  
**Content-Type:** `application/json`  
**Request Body:** (同创建)

**Response (200):**
```json
{
  "status": "SUCCESS",
  "message": "Cập nhật sản phẩm thành công",
  "data": { ... }
}
```

---

## 🎯 Frontend 使用示例

### 使用 Fetch API
```javascript
// 创建产品不上传图像
const handleCreateProduct = async (formData) => {
  try {
    const response = await fetch('http://localhost:8080/api/admin/products/no-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: formData.name,
        categoryId: formData.categoryId.toString(),
        price: formData.price.toString(),
        originalPrice: formData.originalPrice?.toString() || '',
        stockQuantity: formData.stockQuantity.toString(),
        description: formData.description || '',
        certifications: formData.certifications || '',
        origin: formData.origin || '',
        unit: formData.unit || '',
        isFeatured: formData.isFeatured ? 'true' : 'false',
        isActive: formData.isActive ? 'true' : 'false'
      })
    });
    const result = await response.json();
    if (response.ok) {
      console.log('Tạo thành công:', result.data);
    } else {
      console.error('Lỗi:', result.message);
    }
  } catch (err) {
    console.error('Error:', err);
  }
};

// 更新产品不改变图像
const handleUpdateProduct = async (id, formData) => {
  try {
    const response = await fetch(`http://localhost:8080/api/admin/products/${id}/no-image`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: formData.name,
        categoryId: formData.categoryId.toString(),
        price: formData.price.toString(),
        ...
      })
    });
    const result = await response.json();
    if (response.ok) {
      console.log('Cập nhật thành công:', result.data);
    } else {
      console.error('Lỗi:', result.message);
    }
  } catch (err) {
    console.error('Error:', err);
  }
};
```

### 使用 Axios
```javascript
// 创建
const createProduct = async (data) => {
  return axios.post('/api/admin/products/no-image', data, {
    headers: { 'Content-Type': 'application/json' }
  });
};

// 更新
const updateProduct = async (id, data) => {
  return axios.put(`/api/admin/products/${id}/no-image`, data, {
    headers: { 'Content-Type': 'application/json' }
  });
};
```

### 使用 React/adminService
```javascript
// 在 adminService.js 中添加:
export const adminService = {
  // ... 现有方法

  createProductNoImage: (data) =>
    api.post('/api/admin/products/no-image', data),

  updateProductNoImage: (id, data) =>
    api.put(`/api/admin/products/${id}/no-image`, data),
};

// 在组件中使用:
const handleSave = async () => {
  const data = {
    name: form.name,
    categoryId: form.categoryId.toString(),
    price: form.price.toString(),
    stockQuantity: form.stockQuantity.toString(),
    // ... 其他字段
  };

  try {
    if (editing) {
      await adminService.updateProductNoImage(editing.id, data);
      toast.success('Cập nhật thành công');
    } else {
      await adminService.createProductNoImage(data);
      toast.success('Tạo thành công');
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'Lỗi');
  }
};
```

---

## 📋 Backend 实现细节

### AdminProductController.java
```java
// 创建产品不上传图像
@PostMapping("/no-image")
public ResponseEntity<ApiResponse<ProductResponse>> createNoImage(
        @RequestBody Map<String, String> body) {
    ProductRequest req = buildFromMap(body);
    return ResponseEntity.ok(ApiResponse.success(
            productService.create(req, null), "Tạo sản phẩm thành công"));
}

// 更新产品不改变图像
@PutMapping("/{id}/no-image")
public ResponseEntity<ApiResponse<ProductResponse>> updateNoImage(
        @PathVariable Long id,
        @RequestBody Map<String, String> body) {
    ProductRequest req = buildFromMap(body);
    return ResponseEntity.ok(ApiResponse.success(productService.update(id, req, null)));
}

// Helper: 从 Map 构建 ProductRequest
private ProductRequest buildFromMap(Map<String, String> body) {
    ProductRequest req = new ProductRequest();
    req.setName(body.get("name"));
    req.setCategoryId(Long.parseLong(body.get("categoryId")));
    req.setPrice(new BigDecimal(body.get("price")));
    String op = body.get("originalPrice");
    if (op != null && !op.isBlank()) 
        req.setOriginalPrice(new BigDecimal(op));
    req.setStockQuantity(Integer.parseInt(body.get("stockQuantity")));
    req.setDescription(body.get("description"));
    req.setCertifications(body.get("certifications"));
    req.setOrigin(body.get("origin"));
    req.setUnit(body.get("unit"));
    req.setFeatured("true".equalsIgnoreCase(body.get("isFeatured")));
    req.setActive(!"false".equalsIgnoreCase(body.get("isActive")));
    return req;
}
```

---

## 🎯 使用场景

| 情况 | 使用 Endpoint |
|------|--------------|
| 创建产品 + 上传图像 | `POST /api/admin/products` (multipart) |
| 创建产品 不上传图像 | `POST /api/admin/products/no-image` (JSON) |
| 更新产品 + 改变图像 | `PUT /api/admin/products/{id}` (multipart) |
| 更新产品 不改变图像 | `PUT /api/admin/products/{id}/no-image` (JSON) |
| 删除产品 | `DELETE /api/admin/products/{id}` |

---

## ✅ 测试

### Curl 测试
```bash
# 创建产品不上传图像
curl -X POST http://localhost:8080/api/admin/products/no-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "categoryId": "1",
    "price": "100000",
    "stockQuantity": "50",
    "isFeatured": "false",
    "isActive": "true"
  }'

# 更新产品不改变图像
curl -X PUT http://localhost:8080/api/admin/products/1/no-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Product",
    "categoryId": "1",
    "price": "120000",
    "stockQuantity": "45",
    "isFeatured": "true",
    "isActive": "true"
  }'
```

---

## 🚀 Status

✅ **Backend:** 两个端点已添加 + Build SUCCESS  
⏳ **Frontend:** 可选 - 根据需求使用对应端点  

---

*新增功能: JSON 端点支持不上传/改变图像的产品操作, 简化前端逻辑*
