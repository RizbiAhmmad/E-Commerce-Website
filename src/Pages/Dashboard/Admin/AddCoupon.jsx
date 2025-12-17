import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const AddCoupon = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const axiosPublic = useAxiosPublic();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    startDate: "",
    expiryDate: "",
    status: "inactive",
    image: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => setImageFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile)
      return Swal.fire("Error", "Please select an image", "error");
    setLoading(true);

    try {
      // upload to Cloudinary
      const uploadData = new FormData();
      uploadData.append("file", imageFile);
      uploadData.append("upload_preset", "eCommerce");

      const uploadRes = await axiosPublic.post(
        "https://api.cloudinary.com/v1_1/dt3bgis04/image/upload",
        uploadData
      );

      const imageUrl = uploadRes.data.secure_url;
      const couponData = {
        ...formData,
        image: imageUrl,
        productIds: selectedProducts,
      };

      const res = await axiosPublic.post("/coupons", couponData, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.data.insertedId) {
        Swal.fire("Success", "Coupon added successfully!", "success");
        navigate("/dashboard/allCoupons");
      } else {
        Swal.fire("Error", "Something went wrong", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to add coupon", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axiosPublic.get("/products").then((res) => {
      setProducts(res.data);
    });
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.includes(search)
  );
  const toggleProduct = (id) => {
    const productId = String(id);

    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((pid) => pid !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div className="max-w-3xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center">Add New Coupon</h2>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <input
          name="name"
          placeholder="Coupon Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />

        <input
          name="code"
          placeholder="Coupon Code"
          value={formData.code}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />

        <select
          name="discountType"
          value={formData.discountType}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed Amount</option>
        </select>

        <input
          name="discountValue"
          placeholder="Discount Price"
          type="number"
          value={formData.discountValue}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />

        <input
          name="minOrderAmount"
          placeholder="Minimum Order Amount"
          type="number"
          value={formData.minOrderAmount}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <div className="md:col-span-2">
          <label className="block mb-2 font-semibold">
            Select Products for Coupon
          </label>

          <input
            type="text"
            placeholder="Search by product name or barcode"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 mb-2 border rounded"
          />

          <div className="max-h-50 overflow-y-auto border rounded p-2 space-y-2">
            {filteredProducts.map((product) => (
              <label
                key={product._id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(String(product._id))}
                  onChange={() => toggleProduct(product._id)}
                />

                <span className="text-sm">
                  {product.name}{" "}
                  <span className="text-gray-400">({product.barcode})</span>
                </span>
              </label>
            ))}
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Selected: {selectedProducts.length} product(s)
          </p>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Image</label>
          <div className="flex items-center gap-4">
            <label
              htmlFor="image"
              className="px-4 py-2 text-white transition bg-cyan-500 rounded-lg shadow cursor-pointer hover:bg-cyan-600"
            >
              Choose File
            </label>
            <span className="text-sm text-gray-600">
              {imageFile ? imageFile.name : "No file chosen"}
            </span>
          </div>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
            required
            className="hidden"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Start Date</label>
          <input
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Expire Date</label>
          <input
            name="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
        </div>

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
          className="w-full px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600 md:col-span-2"
        >
          {loading ? "Submitting..." : "Add Coupon"}
        </button>
      </form>
    </div>
  );
};

export default AddCoupon;
