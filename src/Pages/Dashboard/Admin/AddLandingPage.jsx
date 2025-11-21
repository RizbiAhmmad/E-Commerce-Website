import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../provider/AuthProvider";
import Select from "react-select";
import useAxiosPublic from "@/Hooks/useAxiosPublic";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import JsBarcode from "jsbarcode";

const AddLandingPage = () => {
  const { user } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [bannerImage, setBannerImage] = useState(null);
  const [reviewImages, setReviewImages] = useState([]);

  const [formData, setFormData] = useState({
    productId: "",
    campaignTitle: "",
    shortDescription: "",
    videoUrl: "",
    descriptionTitle: "",
    description: "",
    whyChooseUs: "",
  });

  // Load products
  useEffect(() => {
    axiosPublic.get("/products").then((res) => {
      setProducts(
        res.data.map((p) => ({
          value: p._id,
          label: p.name,
          full: p,
        }))
      );
    });
  }, []);

  // Generate Barcode
  useEffect(() => {
    if (selectedProduct) {
      const canvas = document.getElementById("preview-barcode");
      if (canvas && selectedProduct.barcode) {
        JsBarcode(canvas, selectedProduct.barcode, {
          format: "CODE128",
          displayValue: false,
          width: 2,
          height: 70,
        });
      }
    }
  }, [selectedProduct]);

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Upload Single Image
  const uploadImage = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "eCommerce");

    const res = await axiosPublic.post(
      "https://api.cloudinary.com/v1_1/dt3bgis04/image/upload",
      data
    );
    return res.data.secure_url;
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      Swal.fire({ title: "Uploading...", didOpen: () => Swal.showLoading() });

      // Upload Banner
      const bannerUrl = bannerImage ? await uploadImage(bannerImage) : "";

      // Upload Multiple Review Images
      const uploadedReviewUrls = [];
      if (reviewImages.length > 0) {
        for (let file of reviewImages) {
          uploadedReviewUrls.push(await uploadImage(file));
        }
      }

      const landingData = {
        ...formData,
        bannerImage: bannerUrl,
        reviewImages: uploadedReviewUrls,
        email: user?.email,
      };

      const res = await axiosPublic.post("/landing-pages", landingData);

      if (res.data.insertedId) {
        Swal.fire("Success", "Landing Page Added!", "success");
        navigate("/dashboard/allLandingPages");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to add landing page", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-5 text-center">Add Landing Page</h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Product Select */}
        <div>
          <label className="font-semibold">Select Product *</label>
          <Select
            options={products}
            onChange={(selected) => {
              setFormData({ ...formData, productId: selected.value });
              setSelectedProduct(selected.full);
            }}
          />
        </div>

        {/* Product Preview + Barcode */}
        {selectedProduct && (
          <div className="border p-4 rounded mt-4 flex items-center gap-4 bg-gray-50">
            <canvas id="preview-barcode"></canvas>
            <div className="text-sm leading-tight">
              <p className="font-bold">{selectedProduct.name}</p>
              <p>
                <strong>Colors:</strong> {selectedProduct.colors?.join(", ")}
              </p>
              <p>
                <strong>Sizes:</strong> {selectedProduct.sizes?.join(", ")}
              </p>
            </div>
          </div>
        )}

        {/* Campaign Title */}
        <input
          name="campaignTitle"
          placeholder="Campaign Title"
          className="w-full border p-2 rounded"
          required
          onChange={handleInput}
        />

        {/* Banner Image */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Banner Image *</label>

          {/* Custom Button */}
          <label
            htmlFor="banner-image"
            className="cursor-pointer bg-cyan-500 text-white font-semibold px-4 py-2 rounded-xl shadow-md hover:opacity-90 transition inline-block w-fit"
          >
            Choose Image
          </label>

          {/* Hidden File Input */}
          <input
            id="banner-image"
            type="file"
            className="hidden"
            onChange={(e) => setBannerImage(e.target.files[0])}
            required
          />
        </div>

        {/* Short Description */}
        <textarea
          name="shortDescription"
          placeholder="Short Description"
          rows="4"
          className="w-full border p-2 rounded"
          onChange={handleInput}
          required
        />

        {/* Video URL */}
        <input
          name="videoUrl"
          placeholder="Video URL (Optional)"
          className="w-full border p-2 rounded"
          onChange={handleInput}
        />

        <div>
          <label className="font-semibold block mb-2">
            Review Images (Multiple)
          </label>

          <label className="bg-cyan-500 text-white px-4 py-2 rounded-xl cursor-pointer shadow-md hover:opacity-90 inline-block">
            Choose Images
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => setReviewImages([...e.target.files])}
              accept="image/*"
            />
          </label>

          {/* Preview Selected Files */}
          {reviewImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {reviewImages.map((img, idx) => (
                <p key={idx} className="text-xs bg-gray-200 p-2 rounded">
                  {img.name}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Description Title */}
        <input
          name="descriptionTitle"
          placeholder="Description Title"
          className="w-full border p-2 rounded"
          onChange={handleInput}
        />

        {/* Description */}
        <textarea
          name="description"
          placeholder="Description"
          rows="4"
          className="w-full border p-2 rounded"
          onChange={handleInput}
        />

        {/* Why Choose Us */}
        <textarea
          name="whyChooseUs"
          placeholder="Why Choose Us?"
          rows="4"
          className="w-full border p-2 rounded"
          onChange={handleInput}
          required
        />

        <button
          type="submit"
          className="bg-cyan-500 text-white px-4 py-2 rounded-xl w-full"
        >
          Add Landing Page
        </button>
      </form>
    </div>
  );
};

export default AddLandingPage;
