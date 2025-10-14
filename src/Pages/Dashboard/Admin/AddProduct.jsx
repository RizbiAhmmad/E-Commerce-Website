import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../../../provider/AuthProvider";
import Select from "react-select";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const AddProduct = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();

  const [formData, setFormData] = useState({
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
    stock: "",
    status: "inactive",
    variant: "",
    barcode: "",
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

  useEffect(() => {
    axiosPublic
      .get("/categories")
      .then((res) =>
        setCategories(res.data.filter((cat) => cat.status === "active"))
      );

    axiosPublic
      .get("/subcategories")
      .then((res) =>
        setSubcategories(res.data.filter((sub) => sub.status === "active"))
      );

    axiosPublic
      .get("/brands")
      .then((res) => setBrands(res.data.filter((b) => b.status === "active")));

    axiosPublic
      .get("/sizes")
      .then((res) => setSizes(res.data.filter((s) => s.status === "active")));

    axiosPublic
      .get("/colors")
      .then((res) => setColors(res.data.filter((c) => c.status === "active")));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMultiSelectChange = (e) => {
    const selected = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData({ ...formData, [e.target.name]: selected });
  };

  const handleImageChange = (e) => {
    setImageFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFiles.length)
      return Swal.fire("Error", "Please select at least one image", "error");
    setLoading(true);

    try {
      // Upload all images
      const imageUploadPromises = imageFiles.map((file) => {
        const cloudinaryData = new FormData();
        cloudinaryData.append("file", file);
        cloudinaryData.append("upload_preset", "eCommerce");
        return axiosPublic.post(
          "https://api.cloudinary.com/v1_1/dt3bgis04/image/upload",
          cloudinaryData
        );
      });

      const cloudinaryResponses = await Promise.all(imageUploadPromises);
      const imageUrls = cloudinaryResponses.map((res) => res.data.secure_url);

      const productData = {
        ...formData,
        purchasePrice: Number(formData.purchasePrice),
        oldPrice: Number(formData.oldPrice),
        newPrice: Number(formData.newPrice),
        stock: Number(formData.stock),
        images: imageUrls,
        email: user?.email,
      };

      const res = await axiosPublic.post(
        "/products",
        productData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.data.insertedId) {
        Swal.fire("Success", "Product added successfully!", "success");
        navigate("/dashboard/allProducts");
      } else {
        Swal.fire("Error", "Something went wrong", "error");
      }
    } catch (err) {
      console.error("Add Product Error:", err.message);
      Swal.fire("Error", "Failed to add product", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center">Add New Product</h2>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <input
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />

        <input
          name="barcode"
          placeholder="Barcode"
          value={formData.barcode}
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

        {/* Smooth Multi-Select for Sizes */}
        <Select
          isMulti
          name="sizes"
          options={sizes.map((s) => ({ value: s.name, label: s.name }))}
          className="basic-multi-select"
          classNamePrefix="select"
          onChange={(selected) =>
            setFormData({
              ...formData,
              sizes: selected.map((opt) => opt.value),
            })
          }
        />

        {/* Smooth Multi-Select for Colors */}
        <Select
          isMulti
          name="colors"
          options={colors.map((c) => ({ value: c.name, label: c.name }))}
          className="basic-multi-select"
          classNamePrefix="select"
          onChange={(selected) =>
            setFormData({
              ...formData,
              colors: selected.map((opt) => opt.value),
            })
          }
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
          <option value="flash">Flash Sale</option>
          <option value="top">Top Selling</option>
        </select>

        <textarea
          name="specification"
          placeholder="Specification"
          value={formData.specification}
          onChange={handleChange}
          rows="3"
          className="border p-2 rounded md:col-span-2"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="border p-2 rounded md:col-span-2"
        />

        <div className="md:col-span-2">
          <label className="block mb-2 font-semibold">
            Product Image (1200x1200) (You can select Multiple)
          </label>

          {/* Hidden file input */}
          <input
            type="file"
            multiple
            accept="image/*"
            id="imageUpload"
            onChange={(e) => {
              const files = Array.from(e.target.files);
              setImageFiles(files);
            }}
            className="hidden"
          />

          {/* Custom upload button */}
          <label
            htmlFor="imageUpload"
            className="inline-block bg-cyan-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-cyan-600"
          >
            Upload Images
          </label>

          {/* Preview selected files */}
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
                        setImageFiles(imageFiles.filter((_, i) => i !== index))
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
            {/* <option value="active">Active</option> */}
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600 md:col-span-2"
        >
          {loading ? "Submitting..." : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
