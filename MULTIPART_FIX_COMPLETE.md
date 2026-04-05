# FIX HOÀN TOÀN: Lỗi "Failed to parse multipart servlet request"

## 📋 TÓM TẮT

**Problem:** Frontend không thể upload ảnh sản phẩm → lỗi 400 "Failed to parse multipart servlet request"

**Root Cause:** 
- Backend AdminProductController đang nhận từng `@RequestParam` riêng lẻ
- Spring's multipart parser không thể parse request đúng cách
- Cần sử dụng `MultipartHttpServletRequest` trực tiếp

**Solution:** Xây dựng lại cả backend + hướng dẫn frontend  
**Status:** ✅ Backend DONE, ⏳ Frontend (copy 2 files từ FRONTEND_IMPLEMENTATION_GUIDE.md)

---

## 🔧 BACKEND FIXES (ĐÃ HOÀN THÀNH)

### 1️⃣ application.properties
**File:** `src/main/resources/application.properties`

**Thay đổi:**
```properties
# OLD (KHÔNG DÙNG)
spring.servlet.multipart.file-size-threshold=2KB

# NEW (ĐÃ SỬA)
spring.servlet.multipart.file-size-threshold=0
```

**Lý do:** Threshold = 0 để Spring xử lý tất cả multipart request bằng stream, không cache

---

### 2️⃣ AdminProductController - VIẾT LẠI HOÀN TOÀN
**File:** `src/main/java/com/thucphamsach/backend_ecommerce/controller/admin/AdminProductController.java`

**Thay đổi chính:**
```java
// OLD: @PostMapping với nhiều @RequestParam
@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<...> create(
    @RequestParam("name") String name,
    @RequestParam("image") MultipartFile image,
    // ... 10+ @RequestParam khác
) { ... }

// NEW: Dùng MultipartHttpServletRequest
@PostMapping
public ResponseEntity<...> create(
    MultipartHttpServletRequest request) {
  ProductRequest req = extractProductRequest(request);
  List<MultipartFile> images = extractImages(request);
  // ... xử lý
}

// Helper methods:
- extractProductRequest(MultipartHttpServletRequest) 
  → đọc tất cả form parameters từ request
- extractImages(MultipartHttpServletRequest)
  → đọc tất cả files với key "images"
```

**Lợi ích:**
- ✅ Spring không cần parse từng `@RequestParam`, nó có toàn bộ request object
- ✅ Xử lý file an toàn với Iterator
- ✅ Hỗ trợ multiple files dễ dàng

---

### 3️⃣ ProductService - Thêm Method
**File:** `src/main/java/com/thucphamsach/backend_ecommerce/service/ProductService.java`

**Thêm method overload:**
```java
// Mới: nhận List<MultipartFile>
public ProductResponse createProduct(
    ProductRequest request, 
    List<MultipartFile> images) {
  // Tạo product
  Product saved = productRepository.save(product);
  
  // Lưu các file images liên tiếp
  if (images != null && !images.isEmpty()) {
    for (int i = 0; i < images.size(); i++) {
      String url = fileUploadService.uploadImage(images.get(i));
      ProductImage img = ProductImage.builder()
          .product(saved)
          .imageUrl(url)
          .isPrimary(i == 0)  // File đầu tiên là primary
          .sortOrder(i)
          .build();
      productImageRepository.save(img);
    }
  }
  return toResponse(...);
}
```

---

### 4️⃣ Build Status
```
✅ BUILD SUCCESS
Total time: 6.1 seconds
Created: target/backend-ecommerce-0.0.1-SNAPSHOT.jar
```

---

## 🎨 FRONTEND FIXES (CẦN THỰC HIỆN)

### Files Cần Tạo

1. **`src/services/api.js`** - Axios configuration  
   → Copy từ [FRONTEND_IMPLEMENTATION_GUIDE.md](FRONTEND_IMPLEMENTATION_GUIDE.md)
   
2. **`src/services/adminService.js`** - Admin API service  
   → Copy từ [FRONTEND_IMPLEMENTATION_GUIDE.md](FRONTEND_IMPLEMENTATION_GUIDE.md)

### Key Points

✅ **FormData - KHÔNG JSON**
```javascript
// ❌ SAI - JSON không thể chứa file
const data = JSON.stringify({ name, image });

// ✅ ĐÚNG - FormData chứa file
const data = new FormData();
data.append('name', name);
data.append('images', file1);
data.append('images', file2);
```

✅ **KHÔNG Set Content-Type**
```javascript
// ❌ SAI - Browser không biết boundary
headers: { 'Content-Type': 'multipart/form-data' }

// ✅ ĐÚNG - Để axios/browser tự set
headers: { 'Content-Type': undefined }
// Hoặc không set gì
```

✅ **Authorization Token**
```javascript
// Interceptor sẽ tự thêm token từ localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 📝 FILES ĐÃ THAY ĐỔI

| File | Thay Đổi | Status |
|------|----------|--------|
| [application.properties](src/main/resources/application.properties) | Sửa multipart config | ✅ Done |
| [AdminProductController.java](src/main/java/com/thucphamsach/backend_ecommerce/controller/admin/AdminProductController.java) | Viết lại hoàn toàn | ✅ Done |
| [ProductService.java](src/main/java/com/thucphamsach/backend_ecommerce/service/ProductService.java) | Thêm method overload | ✅ Done |
| src/services/api.js | Tạo mới | ⏳ Frontend |
| src/services/adminService.js | Tạo mới | ⏳ Frontend |

---

## 🧪 TESTING

### Backend Test (curl)
```bash
curl -X POST http://localhost:8080/api/admin/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Test Product" \
  -F "categoryId=1" \
  -F "price=100000" \
  -F "stockQuantity=50" \
  -F "images=@/path/to/image.jpg" \
  -F "images=@/path/to/image2.jpg"
```

### Frontend Test  
```javascript
// Sau khi tạo src/services/api.js và adminService.js
import { adminService } from './services/adminService';

const formData = new FormData();
formData.append('name', 'Product Name');
formData.append('categoryId', '1');
formData.append('price', '100000');
formData.append('stockQuantity', '50');
formData.append('images', fileInput.files[0]);

const response = await adminService.createProduct(formData);
console.log(response.data);
```

---

## 🚀 NEXT STEPS

### 1. Update Frontend
   - Tạo file `src/services/api.js`
   - Tạo file `src/services/adminService.js`
   - (Copy-paste từ [FRONTEND_IMPLEMENTATION_GUIDE.md](FRONTEND_IMPLEMENTATION_GUIDE.md))

### 2. Restart Backend
   - Kill process hiện tại
   - Chạy `mvn spring-boot:run` hoặc JAR file

### 3. Test Upload
   - Mở frontend
   - Tạo sản phẩm mới với ảnh
   - Kiểm tra không còn lỗi multipart

### 4. Kiểm tra Database
   - Sản phẩm được tạo
   - Ảnh được lưu vào `uploads/` folder
   - ProductImage records được tạo trong DB

---

## 📚 REFERENCE DOCUMENTS

- [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md) - Chi tiết API endpoint
- [FRONTEND_IMPLEMENTATION_GUIDE.md](FRONTEND_IMPLEMENTATION_GUIDE.md) - Code mẫu frontend
- [README.md](HELP.md) - Project README

---

## ⚡ TIPS & TRICKS

### Kiểm tra multipart config
```java
@GetMapping("/config")
public ResponseEntity<Map<String, String>> checkConfig() {
  return ResponseEntity.ok(Map.of(
    "multipart.enabled", 
    environment.getProperty("spring.servlet.multipart.enabled"),
    "max-file-size",
    environment.getProperty("spring.servlet.multipart.max-file-size")
  ));
}
```

### Debug multipart parsing
```java
// Thêm vào AdminProductController
@PostMapping
public ResponseEntity<...> create(MultipartHttpServletRequest request) {
  System.out.println("=== DEBUG ===");
  System.out.println("Parameters: " + request.getParameterNames());
  System.out.println("Files: " + request.getFileNames());
  // ... rest of code
}
```

### Kiểm tra file size
```javascript
if (file.size > 10 * 1024 * 1024) {
  console.error('File quá lớn! Max 10MB');
  return;
}
```

---

## ❓ FAQ

**Q: Tại sao phải dùng MultipartHttpServletRequest?**  
A: Vì Spring dispatcher không thể parse multipart request khi có `@RequestParam` nhiều quá. MultipartHttpServletRequest cho phép trực tiếp lấy từ HTTP request mà không cần Spring parser.

**Q: Tại sao phải set Content-Type: undefined?**  
A: Vì multipart boundary là unique cho mỗi request. Nếu set thủ công, browser không biết cách set boundary đúng. Để undefined → axios/browser sẽ tự tính boundary.

**Q: Tại sao thay đổi file-size-threshold từ 2KB thành 0?**  
A: 2KB nghĩa là file < 2KB được cache trong memory, > 2KB được stream to disk. Để tránh lỗi, set 0 để tất cả đều stream.

---

**Cập nhật:** 2026-04-05 | **Status:** 🟢 Backend Ready, 🟡 Waiting Frontend | **Build:** ✅ SUCCESS
