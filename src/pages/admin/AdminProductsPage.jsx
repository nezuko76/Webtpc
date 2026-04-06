const handleSave = async () => {
  if (!form.name?.trim()) { toast.error('Vui lòng nhập tên sản phẩm'); return; }
  if (!form.categoryId) { toast.error('Vui lòng chọn danh mục'); return; }
  if (!form.price) { toast.error('Vui lòng nhập giá bán'); return; }
  if (!form.stockQuantity) { toast.error('Vui lòng nhập số lượng'); return; }

  setSaving(true);
  try {
    // Bước 1: Lưu thông tin JSON
    const data = {
      name: form.name.trim(),
      categoryId: Number(form.categoryId),
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      stockQuantity: Number(form.stockQuantity),
      description: form.description || null,
      certifications: form.certifications || null,
      origin: form.origin || null,
      unit: form.unit || null,
      isFeatured: form.isFeatured === true,
      isActive: form.isActive !== false,
    };

    let productId;
    if (editing) {
      const res = await adminService.updateProduct(editing.id, data);
      productId = res.data?.data?.id || editing.id;
    } else {
      const res = await adminService.createProduct(data);
      productId = res.data?.data?.id;
    }

    // Bước 2: Upload ảnh riêng nếu có
    const hasNewImages = Array.isArray(images)
      && images.length > 0
      && images[0] instanceof File;

    if (hasNewImages && productId) {
      await adminService.uploadProductImages(productId, images);
    }

    toast.success(editing ? 'Cập nhật sản phẩm thành công' : 'Tạo sản phẩm thành công');
    setModal(false);
    fetchProducts();
  } catch (err) {
    console.error('Save error:', err.response?.data);
    toast.error(err.response?.data?.message || 'Lỗi lưu sản phẩm');
  } finally {
    setSaving(false);
  }
};