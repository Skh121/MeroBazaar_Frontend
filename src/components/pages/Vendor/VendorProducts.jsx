import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  Upload,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import axios from "axios";
import { useAuthStore } from "../../../store/lib/authStore";

const CATEGORIES = [
  "Food & Spices",
  "Textiles",
  "Handicrafts",
  "Agriculture",
  "Dairy & Cheese",
  "Others",
];

const UNITS = ["piece", "kg", "gram", "liter", "ml", "dozen", "pack"];

const BADGES = ["Best Seller", "New", "Sale", "Limited"];

const VendorProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [notification, setNotification] = useState(null);

  const token = useAuthStore((state) => state.token);
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    comparePrice: "",
    category: "Food & Spices",
    stock: "",
    unit: "piece",
    badge: "",
    isFeatured: false,
    isRegionalSpecialty: false,
    images: [],
    tags: "",
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}/products/vendor`, config);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      showNotification("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      comparePrice: "",
      category: "Food & Spices",
      stock: "",
      unit: "piece",
      badge: "",
      isFeatured: false,
      isRegionalSpecialty: false,
      images: [],
      tags: "",
    });
    setEditingProduct(null);
    setImageFiles([]);
    setImagePreviews([]);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      comparePrice: product.comparePrice?.toString() || "",
      category: product.category,
      stock: product.stock.toString(),
      unit: product.unit,
      badge: product.badge || "",
      isFeatured: product.isFeatured,
      isRegionalSpecialty: product.isRegionalSpecialty,
      images: product.images || [],
      tags: product.tags?.join(", ") || "",
    });
    setImageFiles([]);
    // Set existing images as previews
    setImagePreviews(
      (product.images || []).map((img) => ({
        url: img.url.startsWith("http") ? img.url : `${API_URL.replace("/api", "")}${img.url}`,
        isExisting: true,
      }))
    );
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check total images limit (5 max)
    const totalImages = imagePreviews.length + files.length;
    if (totalImages > 5) {
      showNotification("Maximum 5 images allowed", "error");
      return;
    }

    // Create preview URLs for new files
    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      isExisting: false,
      file: file,
    }));

    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    const removedPreview = imagePreviews[index];

    // If it's an existing image (from server), remove from formData.images
    if (removedPreview.isExisting) {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    } else {
      // If it's a new file, remove from imageFiles
      const newFileIndex = imagePreviews
        .slice(0, index)
        .filter((p) => !p.isExisting).length;
      setImageFiles((prev) => prev.filter((_, i) => i !== newFileIndex));
    }

    // Remove from previews
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];

    const formDataUpload = new FormData();
    imageFiles.forEach((file) => {
      formDataUpload.append("images", file);
    });

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    const response = await axios.post(
      `${API_URL}/upload/products`,
      formDataUpload,
      config
    );
    return response.data.images;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Upload new images first if there are any
      let uploadedImages = [];
      if (imageFiles.length > 0) {
        setUploadingImages(true);
        uploadedImages = await uploadImages();
        setUploadingImages(false);
      }

      // Combine existing images with newly uploaded ones
      const existingImages = formData.images.filter((_, index) => {
        const preview = imagePreviews[index];
        return preview && preview.isExisting;
      });
      const allImages = [...existingImages, ...uploadedImages];

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
        category: formData.category,
        stock: parseInt(formData.stock),
        unit: formData.unit,
        badge: formData.badge || null,
        isFeatured: formData.isFeatured,
        isRegionalSpecialty: formData.isRegionalSpecialty,
        images: allImages,
        tags: formData.tags.split(",").map((t) => t.trim()).filter((t) => t),
      };

      if (editingProduct) {
        await axios.put(`${API_URL}/products/${editingProduct._id}`, productData, config);
        showNotification("Product updated successfully");
      } else {
        await axios.post(`${API_URL}/products`, productData, config);
        showNotification("Product created successfully");
      }

      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Failed to save product:", error);
      showNotification(error.response?.data?.message || "Failed to save product", "error");
    } finally {
      setSubmitLoading(false);
      setUploadingImages(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    setDeleteLoading(productId);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}/products/${productId}`, config);
      showNotification("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      showNotification("Failed to delete product", "error");
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "inactive":
        return "bg-gray-100 text-gray-700";
      case "out_of_stock":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div>
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
            notification.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"
          }`}
        >
          {notification.type === "error" ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          {notification.message}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-500">Manage your product catalog</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-merogreen text-white rounded-lg font-medium hover:bg-green-700 transition"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none ml-2 flex-1 text-sm"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 size={32} className="mx-auto mb-2 text-merogreen animate-spin" />
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Stock
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                          {product.images?.[0]?.url ? (
                            <img
                              src={
                                product.images[0].url.startsWith("http")
                                  ? product.images[0].url
                                  : `${API_URL.replace("/api", "")}${product.images[0].url}`
                              }
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package size={20} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{product.name}</p>
                          {product.badge && (
                            <span className="text-xs text-merogreen font-medium">{product.badge}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{product.category}</td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-gray-800">Rs. {product.price}</p>
                        {product.comparePrice && (
                          <p className="text-xs text-gray-400 line-through">Rs. {product.comparePrice}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {product.stock} {product.unit}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={deleteLoading === product._id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          title="Delete"
                        >
                          {deleteLoading === product._id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Package size={48} className="mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500 mb-4">
              {searchQuery ? "No products match your search" : "No products yet"}
            </p>
            {!searchQuery && (
              <button
                onClick={openAddModal}
                className="text-merogreen font-medium hover:underline"
              >
                Add your first product
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                    placeholder="e.g., Himalayan Organic Honey"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                    placeholder="Describe your product..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Badge
                  </label>
                  <select
                    name="badge"
                    value={formData.badge}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                  >
                    <option value="">No Badge</option>
                    {BADGES.map((badge) => (
                      <option key={badge} value={badge}>
                        {badge}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (Rs.) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                    placeholder="599"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compare Price (Rs.)
                  </label>
                  <input
                    type="number"
                    name="comparePrice"
                    value={formData.comparePrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                    placeholder="799 (optional, for showing discount)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                  >
                    {UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                    placeholder="organic, natural, himalayan"
                  />
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images (Max 5)
                </label>
                <div className="flex flex-wrap gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden group">
                      <img src={preview.url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={16} className="text-white" />
                      </button>
                      {!preview.isExisting && (
                        <span className="absolute top-1 left-1 bg-merogreen text-white text-[10px] px-1 rounded">
                          New
                        </span>
                      )}
                    </div>
                  ))}
                  {imagePreviews.length < 5 && (
                    <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-merogreen hover:text-merogreen transition cursor-pointer">
                      <Upload size={20} />
                      <span className="text-xs mt-1">Upload</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB per image.
                </p>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-merogreen focus:ring-merogreen border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Featured Product</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isRegionalSpecialty"
                    checked={formData.isRegionalSpecialty}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-merogreen focus:ring-merogreen border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Regional Specialty</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || uploadingImages}
                  className="flex items-center gap-2 px-4 py-2.5 bg-merogreen text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                >
                  {(submitLoading || uploadingImages) && <Loader2 size={18} className="animate-spin" />}
                  {uploadingImages ? "Uploading Images..." : editingProduct ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProducts;
