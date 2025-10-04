import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../../provider/AuthProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Select from "react-select";

const AddDamageProduct = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productId: "",
    name: "",
    referenceNo: "",
    price: "",
    note: "",
    barcode: "",
    quantity: 1,  
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("https://e-commerce-server-api.onrender.com/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products", err));
  }, []);

  const productOptions = products.map((p) => ({
    value: p._id,
    label: `${p.name} (${p.barcode}) - ${p.newPrice}৳`,
    name: p.name,
    barcode: p.barcode,
    price: p.newPrice,
  }));

  const handleProductSelect = (selected) => {
    setFormData({
      ...formData,
      productId: selected.value,
      name: selected.name,
      price: selected.price,
      barcode: selected.barcode,
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.productId) {
      return Swal.fire("Error", "Please select a product", "error");
    }
    if (!imageFile) {
      return Swal.fire("Error", "Please select an image", "error");
    }

    setLoading(true);

    try {
      // Upload image to Cloudinary
      const cloudinaryData = new FormData();
      cloudinaryData.append("file", imageFile);
      cloudinaryData.append("upload_preset", "eCommerce");

      const cloudinaryRes = await axios.post(
        "https://api.cloudinary.com/v1_1/dt3bgis04/image/upload",
        cloudinaryData
      );

      const imageUrl = cloudinaryRes.data.secure_url;

      const damageProductData = {
        ...formData,
        image: imageUrl,
        email: user?.email,
        price: Number(formData.price),
        referenceNo: Number(formData.referenceNo),
        quantity: Number(formData.quantity),
      };

      const res = await axios.post(
        "https://e-commerce-server-api.onrender.com/damage-products",
        damageProductData
      );

      if (res.data.damageResult?.insertedId) {
        Swal.fire("Success", "Damage product added & stock updated!", "success");
        setFormData({
          productId: "",
          name: "",
          referenceNo: "",
          price: "",
          note: "",
          barcode: "",
          quantity: 1,
        });
        setImageFile(null);
        navigate("/dashboard/allDamageProducts");
      } else {
        Swal.fire("Error", "Server error. Product not added.", "error");
      }
    } catch (err) {
      console.error("❌ Add Damage Product Error:", err.response?.data || err.message);
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center">Add Damaged Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block mb-1 font-semibold">Select Product</label>
          <Select
            options={productOptions}
            onChange={handleProductSelect}
            placeholder="Search by product name or barcode..."
            isSearchable
          />
        </div>

        {/* Auto-filled product name */}
        <div>
          <label className="block mb-1 font-semibold">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            readOnly
            className="w-full px-4 py-2 border rounded bg-gray-100"
          />
        </div>

        {/* Auto-filled barcode */}
        <div>
          <label className="block mb-1 font-semibold">Barcode</label>
          <input
            type="text"
            name="barcode"
            value={formData.barcode}
            readOnly
            className="w-full px-4 py-2 border rounded bg-gray-100"
          />
        </div>

        {/* Auto-filled price */}
        <div>
          <label className="block mb-1 font-semibold">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            readOnly
            className="w-full px-4 py-2 border rounded bg-gray-100"
          />
        </div>

        {/* Damaged Quantity */}
        <div>
          <label className="block mb-1 font-semibold">Damaged Quantity</label>
          <input
            type="number"
            name="quantity"
            min="1"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Reference No</label>
          <input
            type="number"
            name="referenceNo"
            required
            value={formData.referenceNo}
            onChange={handleChange}
            placeholder="Reference Number"
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Note</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="Optional Note"
            className="w-full px-4 py-2 border rounded"
          />
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

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600"
        >
          {loading ? "Submitting..." : "Add Damaged Product"}
        </button>
      </form>
    </div>
  );
};

export default AddDamageProduct;
