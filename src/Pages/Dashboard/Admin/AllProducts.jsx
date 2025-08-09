import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { AuthContext } from "../../../provider/AuthProvider";
import Select from "react-select";
import { FaEdit, FaPlus, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AllProducts = () => {
  const { user } = useContext(AuthContext);

  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  // Form states for Add and Edit
  const initialFormData = {
    name: "",
    description: "",
    specification: "",
    categoryId: "",
    subcategoryId: "",
    brandId: "",
    sizes: [],
    colors: [],
    purchasePrice: "",
    oldPrice: "",
    newPrice: "",
    status: "active",
    variant: "",
    images: [],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch all data once on mount
  useEffect(() => {
    fetchProducts();
    axios
      .get("http://localhost:5000/categories")
      .then((res) => setCategories(res.data));
    axios
      .get("http://localhost:5000/subcategories")
      .then((res) => setSubcategories(res.data));
    axios
      .get("http://localhost:5000/brands")
      .then((res) => setBrands(res.data));
    axios.get("http://localhost:5000/sizes").then((res) => setSizes(res.data));
    axios
      .get("http://localhost:5000/colors")
      .then((res) => setColors(res.data));
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:5000/products");
    setProducts(res.data);
  };

  // Delete product
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This product will be deleted",
      icon: "warning",
      showCancelButton: true,
    });
    if (confirm.isConfirmed) {
      await axios.delete(`http://localhost:5000/products/${id}`);
      Swal.fire("Deleted!", "Product deleted successfully", "success");
      fetchProducts();
    }
  };

  // Open Edit modal with product data
  const handleEdit = (product) => {
    setEditProduct(product);
    setImageFiles([]);
  };

  // Close modals & reset states
  const closeModals = () => {
    setShowAddModal(false);
    setEditProduct(null);
    setFormData(initialFormData);
    setImageFiles([]);
  };

  // Handle form input change (for both add and edit forms)
  const handleChange = (e) => {
    const value = e.target.value;
    if (editProduct) {
      setEditProduct({ ...editProduct, [e.target.name]: value });
    } else {
      setFormData({ ...formData, [e.target.name]: value });
    }
  };

  // Handle multi select changes (sizes, colors)
  const handleMultiSelectChange = (selectedOptions, name) => {
    const values = selectedOptions
      ? selectedOptions.map((opt) => opt.value)
      : [];
    if (editProduct) {
      setEditProduct({ ...editProduct, [name]: values });
    } else {
      setFormData({ ...formData, [name]: values });
    }
  };

  // Handle file input changes
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (editProduct) {
      setImageFiles(files);
    } else {
      setImageFiles(files);
    }
  };

  // Upload images to Cloudinary and return URLs
  const uploadImages = async (files) => {
    const uploadPromises = files.map((file) => {
      const cloudinaryData = new FormData();
      cloudinaryData.append("file", file);
      cloudinaryData.append("upload_preset", "eCommerce");
      return axios.post(
        "https://api.cloudinary.com/v1_1/dt3bgis04/image/upload",
        cloudinaryData
      );
    });
    const responses = await Promise.all(uploadPromises);
    return responses.map((res) => res.data.secure_url);
  };

  // Submit Add Product form
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      return Swal.fire("Error", "Please select at least one image", "error");
    }
    setLoading(true);

    try {
      const imageUrls = await uploadImages(imageFiles);

      const productData = {
        ...formData,
        images: imageUrls,
        email: user?.email,
      };

      const res = await axios.post(
        "http://localhost:5000/products",
        productData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.data.insertedId) {
        Swal.fire("Success", "Product added successfully!", "success");
        fetchProducts();
        closeModals();
      } else {
        Swal.fire("Error", "Something went wrong", "error");
      }
    } catch (err) {
      console.error("Add Product Error:", err);
      Swal.fire("Error", "Failed to add product", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Start with existing images (already filtered on UI)
      let imageUrls = editProduct.images || [];

      // Step 2: Upload new images (if any) and append URLs to existing images array
      if (imageFiles.length > 0) {
        const uploadedUrls = await uploadImages(imageFiles);
        imageUrls = [...imageUrls, ...uploadedUrls];
      }

      // Step 3: Prepare updated product data with combined images
      const updatedData = { ...editProduct, images: imageUrls };

      // Step 4: Send update request
      await axios.put(
        `http://localhost:5000/products/${editProduct._id}`,
        updatedData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      Swal.fire("Success", "Product updated successfully!", "success");
      fetchProducts();
      closeModals();
    } catch (err) {
      console.error("Update Error:", err);
      Swal.fire("Error", "Failed to update product", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExistingImage = (urlToDelete) => {
    setEditProduct((prev) => ({
      ...prev,
      images: prev.images.filter((url) => url !== urlToDelete),
    }));
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">

      <h2 className="pb-4 mb-8 text-4xl font-bold text-center border-b-2 border-gray-200">
              All Products
            </h2>

            {/* Add Product Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => navigate("/dashboard/addProduct")}
                className="flex items-center gap-2 px-4 py-2 text-white bg-purple-500 rounded hover:bg-purple-600"
              >
                <FaPlus /> Add Product
              </button>
            </div>

      {/* Product Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full text-sm text-left table-auto">
          <thead className="tracking-wider text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Images</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Brand</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3">Sizes</th>
              <th className="px-6 py-3">Colors</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.length === 0 && (
              <tr>
                <td colSpan={9} className="py-6 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
            {products.map((p, index) => (
              <tr
                key={p._id}
                className="transition duration-200 hover:bg-gray-50"
              >
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4">
                  {p.images && p.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-1 max-w-[100px]">
                      {p.images.map((imgUrl, idx) => (
                        <img
                          key={idx}
                          src={imgUrl}
                          alt={`${p.name}-${idx}`}
                          className="w-full h-16 object-cover rounded"
                          style={{ aspectRatio: "1 / 1" }}
                        />
                      ))}
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-800">
                  {p.name}
                </td>
                <td className="px-6 py-4">
                  {categories.find((c) => c._id === p.categoryId)?.name || "-"}
                </td>
                <td className="px-6 py-4">
                  {brands.find((b) => b._id === p.brandId)?.name || "-"}
                </td>
                <td className="px-6 py-4 font-mono">
                  {p.newPrice ? `$${p.newPrice}` : "-"}
                </td>
                <td className="px-6 py-4 font-mono">
                  {p.stock ? `${p.stock}` : "-"}
                </td>
                <td className="px-6 py-4">{p.sizes?.join(", ") || "-"}</td>
                <td className="px-6 py-4">{p.colors?.join(", ") || "-"}</td>

<td className="px-6 py-4">
                  {p.status === "active" ? (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                      Inactive
                    </span>
                  )}
                </td>

                <td className="flex gap-4 px-6 py-6">
                  <button
                    onClick={() => handleEdit(p)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit"
                  >
                    <FaEdit className="text-xl" />
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <FaTrashAlt className="text-xl" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-16 z-50 overflow-auto">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative">
            <h3 className="text-xl font-bold mb-4">Add New Product</h3>
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold"
              onClick={closeModals}
              title="Close"
            >
              &times;
            </button>
            <form
              onSubmit={handleAddSubmit}
              className="grid gap-4 md:grid-cols-2 max-h-[80vh] overflow-y-auto"
            >
              <input
                name="name"
                placeholder="Product Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="border p-2 rounded"
              />

              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="border p-2 rounded"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                name="subcategoryId"
                value={formData.subcategoryId}
                onChange={handleChange}
                required
                className="border p-2 rounded"
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>

              <select
                name="brandId"
                value={formData.brandId}
                onChange={handleChange}
                required
                className="border p-2 rounded"
              >
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <Select
                isMulti
                name="sizes"
                options={sizes.map((s) => ({ value: s.name, label: s.name }))}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={(selected) =>
                  handleMultiSelectChange(selected, "sizes")
                }
                value={sizes
                  .filter((s) => formData.sizes.includes(s.name))
                  .map((s) => ({ value: s.name, label: s.name }))}
              />

              <Select
                isMulti
                name="colors"
                options={colors.map((c) => ({ value: c.name, label: c.name }))}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={(selected) =>
                  handleMultiSelectChange(selected, "colors")
                }
                value={colors
                  .filter((c) => formData.colors.includes(c.name))
                  .map((c) => ({ value: c.name, label: c.name }))}
              />

              <select
                name="variant"
                value={formData.variant}
                onChange={handleChange}
                className="border p-2 rounded"
                required
              >
                <option value="">Select Variant</option>
                <option value="popular">Popular Product</option>
                <option value="new">New Arrival</option>
                <option value="top">Top Rated</option>
              </select>

              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="border p-2 rounded md:col-span-2"
              />
              <textarea
                name="specification"
                placeholder="Specification"
                value={formData.specification}
                onChange={handleChange}
                rows="3"
                className="border p-2 rounded md:col-span-2"
              />

              <div className="md:col-span-2">
                <label className="block mb-2 font-semibold">
                  Product Image (You can select Multiple)
                </label>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  id="addImageUpload"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="addImageUpload"
                  className="inline-block bg-purple-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-purple-700"
                >
                  Upload Images
                </label>

                {/* Show existing images with delete button */}
                {editProduct.images && editProduct.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {editProduct.images.map((url, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={url}
                          alt={`existing-${idx}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingImage(url)}
                          className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-bl hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <input
                name="purchasePrice"
                placeholder="Purchase Price"
                type="number"
                value={formData.purchasePrice}
                onChange={handleChange}
                required
                className="border p-2 rounded"
              />
              <input
                name="oldPrice"
                placeholder="Old Price"
                type="number"
                value={formData.oldPrice}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <input
                name="newPrice"
                placeholder="New Price"
                type="number"
                value={formData.newPrice}
                onChange={handleChange}
                required
                className="border p-2 rounded"
              />
              <input
                name="stock"
                placeholder="Stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                required
                className="border p-2 rounded"
              />

              <div>
                <label className="block mb-1 font-semibold">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 text-white bg-purple-600 rounded hover:bg-purple-700 md:col-span-2"
              >
                {loading ? "Submitting..." : "Add Product"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editProduct && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex justify-center items-start pt-16 z-50 overflow-auto">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative">
            <h3 className="text-xl font-bold mb-4">Edit Product</h3>
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold"
              onClick={closeModals}
              title="Close"
            >
              &times;
            </button>
            <form
              onSubmit={handleEditSubmit}
              className="grid gap-4 md:grid-cols-2 max-h-[80vh] overflow-y-auto"
            >
              <input
                name="name"
                value={editProduct.name}
                onChange={handleChange}
                placeholder="Product Name"
                required
                className="border p-2 rounded"
              />

              <select
                name="categoryId"
                value={editProduct.categoryId}
                onChange={handleChange}
                required
                className="border p-2 rounded"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                name="subcategoryId"
                value={editProduct.subcategoryId}
                onChange={handleChange}
                required
                className="border p-2 rounded"
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>

              <select
                name="brandId"
                value={editProduct.brandId}
                onChange={handleChange}
                required
                className="border p-2 rounded"
              >
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <Select
                isMulti
                name="sizes"
                options={sizes.map((s) => ({ value: s.name, label: s.name }))}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={(selected) =>
                  handleMultiSelectChange(selected, "sizes")
                }
                value={sizes
                  .filter((s) => editProduct.sizes?.includes(s.name))
                  .map((s) => ({ value: s.name, label: s.name }))}
              />

              <Select
                isMulti
                name="colors"
                options={colors.map((c) => ({ value: c.name, label: c.name }))}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={(selected) =>
                  handleMultiSelectChange(selected, "colors")
                }
                value={colors
                  .filter((c) => editProduct.colors?.includes(c.name))
                  .map((c) => ({ value: c.name, label: c.name }))}
              />

              <select
                name="variant"
                value={editProduct.variant}
                onChange={handleChange}
                className="border p-2 rounded"
                required
              >
                <option value="">Select Variant</option>
                <option value="popular">Popular Product</option>
                <option value="new">New Arrival</option>
                <option value="top">Top Rated</option>
              </select>

              <textarea
                name="description"
                placeholder="Description"
                value={editProduct.description}
                onChange={handleChange}
                rows="3"
                className="border p-2 rounded md:col-span-2"
              />
              <textarea
                name="specification"
                placeholder="Specification"
                value={editProduct.specification}
                onChange={handleChange}
                rows="3"
                className="border p-2 rounded md:col-span-2"
              />

              <div className="md:col-span-2">
                <label className="block mb-2 font-semibold">
                  Product Image (You can select Multiple)
                </label>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  id="editImageUpload"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="editImageUpload"
                  className="inline-block bg-purple-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-purple-700"
                >
                  Upload Images
                </label>

                {/* Show existing images with delete button */}
                {editProduct.images && editProduct.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {editProduct.images.map((url, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={url}
                          alt={`existing-${idx}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingImage(url)}
                          className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-bl hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Preview newly selected images */}
                {imageFiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {imageFiles.map((file, index) => {
                      const imageURL = URL.createObjectURL(file);
                      return (
                        <div key={index} className="relative">
                          <img
                            src={imageURL}
                            alt={`preview-${index}`}
                            className="w-full h-24 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setImageFiles(
                                imageFiles.filter((_, i) => i !== index)
                              )
                            }
                            className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-bl hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <input
                name="purchasePrice"
                placeholder="Purchase Price"
                type="number"
                value={editProduct.purchasePrice}
                onChange={handleChange}
                required
                className="border p-2 rounded"
              />
              <input
                name="oldPrice"
                placeholder="Old Price"
                type="number"
                value={editProduct.oldPrice}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <input
                name="newPrice"
                placeholder="New Price"
                type="number"
                value={editProduct.newPrice}
                onChange={handleChange}
                required
                className="border p-2 rounded"
              />
              <input
                name="stock"
                placeholder="Stock"
                type="number"
                value={editProduct.stock}
                onChange={handleChange}
                required
                className="border p-2 rounded"
              />

              <div>
                <label className="block mb-1 font-semibold">Status</label>
                <select
                  name="status"
                  value={editProduct.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 text-white bg-purple-600 rounded hover:bg-purple-700 md:col-span-2"
              >
                {loading ? "Updating..." : "Update Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProducts;