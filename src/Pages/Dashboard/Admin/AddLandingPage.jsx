import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../provider/AuthProvider";
import Select from "react-select";
import useAxiosPublic from "@/Hooks/useAxiosPublic";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const AddLandingPage = () => {
  const { user } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [bannerImage, setBannerImage] = useState(null);
  const [reviewImages, setReviewImages] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);

  const [formData, setFormData] = useState({
    productId: "",
    campaignTitle: "",
    campaignShortDescription: "",
    shortDescription: "",
    regularPrice: "",
    offerPrice: "",
    galleryHeading: "",
    galleryDescription: "",
    aboutHeading: "",
    aboutDescription: "",
    reviewHeading: "",
    orderFormHeading: "",
    orderButtonText: "",
    videoUrl: "",
    descriptionTitle: "",
    description: "",
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

      // Upload Multiple Gallery Images
      const uploadedGalleryUrls = [];
      if (galleryImages.length > 0) {
        for (let file of galleryImages) {
          uploadedGalleryUrls.push(await uploadImage(file));
        }
      }

      const landingData = {
        ...formData,
        bannerImage: bannerUrl,
        reviewImages: uploadedReviewUrls,
        galleryImages: uploadedGalleryUrls,
        // regularPrice: Number(formData.regularPrice),
        // offerPrice: Number(formData.offerPrice),
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
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow mt-10">
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

        {/* Campaign Title */}
        <input
          name="campaignTitle"
          placeholder="Campaign Title"
          className="w-full border p-2 rounded"
          required
          onChange={handleInput}
        />

        {/* Campaign Short Description */}
        <textarea
          name="campaignShortDescription"
          placeholder="Campaign Short Description"
          rows="2"
          className="w-full border p-2 rounded"
          onChange={handleInput}
          required
        />

        {/* Regular Price & Offer Price side by side */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="regularPrice"
            placeholder="Regular Price"
            type="number"
            className="w-full border p-2 rounded"
            onChange={handleInput}
            required
          />
          <input
            name="offerPrice"
            placeholder="Offer Price"
            type="number"
            className="w-full border p-2 rounded"
            onChange={handleInput}
          />
        </div> */}

        <div className="flex flex-col gap-2">
          <label className="font-semibold">Banner Image *</label>

          <label
            htmlFor="banner-image"
            className="cursor-pointer bg-cyan-500 text-white font-semibold px-4 py-2 rounded-xl shadow-md hover:opacity-90 transition inline-block w-fit"
          >
            Choose Image
          </label>

          <input
            id="banner-image"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => setBannerImage(e.target.files[0])}
          />

          {bannerImage && (
            <img
              src={URL.createObjectURL(bannerImage)}
              className="w-full h-40 object-cover rounded mt-3 border"
            />
          )}
        </div>

        {/* Short Description */}
        <textarea
          name="shortDescription"
          placeholder="Short Description"
          rows="2"
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

        {/* Gallery Section */}
        <input
          name="galleryHeading"
          placeholder="Gallery Section Heading"
          className="w-full border p-2 rounded"
          onChange={handleInput}
        />
        <textarea
          name="galleryDescription"
          placeholder="Gallery Section Description"
          rows="3"
          className="w-full border p-2 rounded"
          onChange={handleInput}
        />
        <div>
          <label className="font-semibold block mb-2">
            Gallery Images (Multiple)
          </label>

          <label className="bg-cyan-500 text-white px-4 py-2 rounded-xl cursor-pointer shadow-md hover:opacity-90 inline-block">
            Choose Images
            <input
              type="file"
              multiple
              className="hidden"
              accept="image/*"
              onChange={(e) =>
                setGalleryImages([
                  ...galleryImages,
                  ...Array.from(e.target.files),
                ])
              }
            />
          </label>

          {galleryImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {galleryImages.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(img)}
                    alt=""
                    className="w-full h-24 object-cover rounded"
                  />

                  {/* Remove Button */}
                  <button
                    onClick={() =>
                      setGalleryImages(
                        galleryImages.filter((_, i) => i !== index)
                      )
                    }
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-80 hover:opacity-100"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* About Section */}
        <input
          name="aboutHeading"
          placeholder="About Section Heading"
          className="w-full border p-2 rounded"
          onChange={handleInput}
        />
        <textarea
          name="aboutDescription"
          placeholder="About Section Description"
          rows="3"
          className="w-full border p-2 rounded"
          onChange={handleInput}
        />

        <input
          name="reviewHeading"
          placeholder="Review Section Heading"
          className="w-full border p-2 rounded"
          onChange={handleInput}
        />

        <div className="mt-2">
          <label className="font-semibold block mb-2">
            Review Images (Multiple)
          </label>

          <label className="bg-cyan-500 text-white px-4 py-2 rounded-xl cursor-pointer shadow-md hover:opacity-90 inline-block">
            Choose Images
            <input
              type="file"
              multiple
              className="hidden"
              accept="image/*"
              onChange={(e) =>
                setReviewImages([
                  ...reviewImages,
                  ...Array.from(e.target.files),
                ])
              }
            />
          </label>

          {reviewImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {reviewImages.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(img)}
                    alt=""
                    className="w-full h-24 object-cover rounded"
                  />

                  {/* Delete Button */}
                  <button
                    onClick={() =>
                      setReviewImages(
                        reviewImages.filter((_, i) => i !== index)
                      )
                    }
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-80 hover:opacity-100"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Description Title */}
        <input
          name="descriptionTitle"
          placeholder="Description Title (Optional)"
          className="w-full border p-2 rounded"
          onChange={handleInput}
        />

        {/* Description */}
        <textarea
          name="description"
          placeholder="Description (Optional)"
          rows="2"
          className="w-full border p-2 rounded"
          onChange={handleInput}
        />

        {/* Order Form Heading */}
        <input
          name="orderFormHeading"
          placeholder="Order Form Heading"
          className="w-full border p-2 rounded"
          onChange={handleInput}
        />
        <input
          name="orderButtonText"
          placeholder="Order Button Text"
          className="w-full border p-2 rounded"
          onChange={handleInput}
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
