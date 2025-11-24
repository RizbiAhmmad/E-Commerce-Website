import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { FaEdit, FaEye, FaPlus, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const CLOUDINARY_UPLOAD_URL =
  "https://api.cloudinary.com/v1_1/dt3bgis04/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "eCommerce";

const AllLandingPages = () => {
  const axiosPublic = useAxiosPublic();
  const isDemo = import.meta.env.VITE_DEMO_MODE === "true";

  const { data: landingPages = [], refetch } = useQuery({
    queryKey: ["landingPages"],
    queryFn: async () => {
      const res = await axiosPublic.get("/landing-pages");
      return res.data;
    },
  });

  const navigate = useNavigate();
  const [localLandingPages, setLocalLandingPages] = useState([]);
  const currentData =
    isDemo && localLandingPages.length ? localLandingPages : landingPages;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);

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
    bannerImage: "",
    reviewImages: [],
    galleryImages: [],
  });

  const [newBannerFile, setNewBannerFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLandingPages = currentData.slice(indexOfFirst, indexOfLast);

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axiosPublic.get("/products");
      return res.data;
    },
  });

  const openEditModal = (page) => {
    setSelectedPage(page);
    setFormData({
      productId: page.productId || "",
      campaignTitle: page.campaignTitle || "",
      campaignShortDescription: page.campaignShortDescription || "",
      shortDescription: page.shortDescription || "",
      regularPrice: page.regularPrice || "",
      offerPrice: page.offerPrice || "",
      galleryHeading: page.galleryHeading || "",
      galleryDescription: page.galleryDescription || "",
      aboutHeading: page.aboutHeading || "",
      aboutDescription: page.aboutDescription || "",
      reviewHeading: page.reviewHeading || "",
      orderFormHeading: page.orderFormHeading || "",
      orderButtonText: page.orderButtonText || "",
      videoUrl: page.videoUrl || "",
      descriptionTitle: page.descriptionTitle || "",
      description: page.description || "",
      bannerImage: page.bannerImage || "",
      reviewImages: Array.isArray(page.reviewImages)
        ? [...page.reviewImages]
        : [],
      galleryImages: Array.isArray(page.galleryImages)
        ? [...page.galleryImages]
        : [],
    });
    setNewBannerFile(null);
    setIsModalOpen(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBannerChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setNewBannerFile(f);
    }
  };

  const handleAddGalleryFiles = (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      galleryImages: [...prev.galleryImages, ...files],
    }));
  };

  const handleAddReviewFiles = (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      reviewImages: [...prev.reviewImages, ...files],
    }));
  };

  const removeGalleryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
    }));
  };

  const removeReviewImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      reviewImages: prev.reviewImages.filter((_, i) => i !== index),
    }));
  };

  const clearNewBanner = () => setNewBannerFile(null);
  const uploadToCloudinary = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await axiosPublic.post(CLOUDINARY_UPLOAD_URL, fd);
    return res.data.secure_url;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setUploading(true);
      let finalBannerUrl = formData.bannerImage || "";
      if (newBannerFile) {
        finalBannerUrl = await uploadToCloudinary(newBannerFile);
      }

      const oldGalleryUrls = (formData.galleryImages || []).filter(
        (i) => typeof i === "string"
      );
      const newGalleryFiles = (formData.galleryImages || []).filter(
        (i) => typeof i !== "string"
      );

      const uploadedGalleryUrls = [];
      for (const f of newGalleryFiles) {
        const url = await uploadToCloudinary(f);
        uploadedGalleryUrls.push(url);
      }
      const finalGalleryImages = [...oldGalleryUrls, ...uploadedGalleryUrls];

      const oldReviewUrls = (formData.reviewImages || []).filter(
        (i) => typeof i === "string"
      );
      const newReviewFiles = (formData.reviewImages || []).filter(
        (i) => typeof i !== "string"
      );

      const uploadedReviewUrls = [];
      for (const f of newReviewFiles) {
        const url = await uploadToCloudinary(f);
        uploadedReviewUrls.push(url);
      }
      const finalReviewImages = [...oldReviewUrls, ...uploadedReviewUrls];

      const payload = {
        productId: formData.productId,
        campaignTitle: formData.campaignTitle,
        campaignShortDescription: formData.campaignShortDescription,
        shortDescription: formData.shortDescription,
        regularPrice: Number(formData.regularPrice),
        offerPrice: Number(formData.offerPrice),
        galleryHeading: formData.galleryHeading,
        galleryDescription: formData.galleryDescription,
        aboutHeading: formData.aboutHeading,
        aboutDescription: formData.aboutDescription,
        reviewHeading: formData.reviewHeading,
        orderFormHeading: formData.orderFormHeading,
        orderButtonText: formData.orderButtonText,
        videoUrl: formData.videoUrl,
        descriptionTitle: formData.descriptionTitle,
        description: formData.description,
        bannerImage: finalBannerUrl,
        galleryImages: finalGalleryImages,
        reviewImages: finalReviewImages,
      };

      if (isDemo) {
        const updated = currentData.map((p) =>
          p._id === selectedPage._id ? { ...p, ...payload } : p
        );
        setLocalLandingPages(updated);
        setIsModalOpen(false);
        setUploading(false);
        Swal.fire("Demo Mode", "Landing page updated temporarily!", "info");
        return;
      }

      await axiosPublic.put(`/landing-pages/${selectedPage._id}`, payload);

      setUploading(false);
      setIsModalOpen(false);
      Swal.fire("Updated!", "Landing page updated.", "success");
      refetch();
    } catch (err) {
      console.error("Update failed:", err);
      setUploading(false);
      Swal.fire("Error", "Update failed", "error");
    }
  };

  // Delete landing page
  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This landing page will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (isDemo) {
          const filtered = currentData.filter((p) => p._id !== id);
          setLocalLandingPages(filtered);
          Swal.fire("Demo Mode", "Landing page removed temporarily!", "info");
          return;
        }

        const res = await axiosPublic.delete(`/landing-pages/${id}`);
        if (res.data.deletedCount > 0) {
          refetch();
          Swal.fire("Deleted!", "Landing page removed.", "success");
        }
      }
    });
  };

  return (
    <div className="max-w-4xl p-6 mx-auto">
      <h2 className="pb-4 mb-4 text-4xl font-bold text-center border-b-2 border-gray-200">
        All Landing Pages
      </h2>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate("/dashboard/addLandingPage")}
          className="flex items-center gap-2 px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600"
        >
          <FaPlus /> Add Landing Page
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full text-sm text-left table-auto">
          <thead className="tracking-wider text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Banner</th>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {currentLandingPages.map((lp, index) => (
              <tr key={lp._id} className="transition hover:bg-gray-50">
                <td className="px-6 py-4">{indexOfFirst + index + 1}</td>

                <td className="px-6 py-4">
                  <img
                    src={lp.bannerImage}
                    alt={lp.campaignTitle}
                    className="object-cover w-16 h-16 border rounded"
                  />
                </td>

                <td className="px-6 py-4 font-semibold text-gray-800">
                  {lp.campaignTitle}
                </td>

                <td className="px-6 py-4">
                  <span className="line-through text-gray-400">
                    {lp.regularPrice}৳
                  </span>
                  <span className="font-bold text-green-600 ml-2">
                    {lp.offerPrice}৳
                  </span>
                </td>

                <td className="flex gap-4 px-6 py-4">
                  <button onClick={() => navigate(`/landing-page/${lp._id}`)}>
                    <FaEye className="text-2xl text-green-500 hover:text-green-600" />
                  </button>

                  <button onClick={() => openEditModal(lp)}>
                    <FaEdit className="text-2xl text-cyan-500 hover:text-cyan-600" />
                  </button>
                  <button onClick={() => handleDelete(lp._id)}>
                    <FaTrashAlt className="text-2xl text-red-500 hover:text-red-700" />
                  </button>
                </td>
              </tr>
            ))}

            {currentData.length === 0 && (
              <tr>
                <td colSpan="5" className="py-6 text-center text-gray-500">
                  No landing pages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {currentData.length > itemsPerPage && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>

          {[...Array(totalPages).keys()].map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === num + 1
                  ? "bg-cyan-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {num + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 overflow-y-auto py-10">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl relative max-h-[90vh] overflow-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 text-xl"
            >
              ✖
            </button>

            <h3 className="text-2xl font-semibold mb-4">Edit Landing Page</h3>

            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Product ID (optional) */}
              <div>
                <label className="block text-sm font-medium">
                  Select Product
                </label>
                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">-- Select Product --</option>
                  {products.map((prod) => (
                    <option key={prod._id} value={prod._id}>
                      {prod.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campaign Title */}
              <div>
                <label className="block text-sm font-medium">
                  Campaign Title
                </label>
                <input
                  type="text"
                  name="campaignTitle"
                  value={formData.campaignTitle}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              {/* Campaign Short Description */}
              <div>
                <label className="block text-sm font-medium">
                  Campaign Short Description
                </label>
                <textarea
                  name="campaignShortDescription"
                  value={formData.campaignShortDescription}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                  rows={2}
                />
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">
                    Regular Price
                  </label>
                  <input
                    type="number"
                    name="regularPrice"
                    value={formData.regularPrice}
                    onChange={handleModalChange}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Offer Price
                  </label>
                  <input
                    type="number"
                    name="offerPrice"
                    value={formData.offerPrice}
                    onChange={handleModalChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              {/* Banner */}
              <div>
                <label className="block text-sm font-medium">
                  Banner Image
                </label>
                <div className="flex items-start gap-4">
                  <div>
                    <img
                      src={
                        newBannerFile
                          ? URL.createObjectURL(newBannerFile)
                          : formData.bannerImage
                      }
                      alt="banner"
                      className="w-44 h-28 object-cover rounded border"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerChange}
                    />
                    {newBannerFile && (
                      <button
                        type="button"
                        onClick={clearNewBanner}
                        className="text-sm px-3 py-1 bg-red-500 text-white rounded"
                      >
                        Remove selected
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium">
                  Short Description
                </label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-sm font-medium">Video URL</label>
                <input
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                  placeholder="https://..."
                />
              </div>

              {/* Gallery Section */}
              <div>
                <label className="block text-sm font-medium">
                  Gallery Heading
                </label>
                <input
                  name="galleryHeading"
                  value={formData.galleryHeading}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                  placeholder="Gallery Heading"
                />
                <label className="block text-sm font-medium mt-2">
                  Gallery Description
                </label>
                <textarea
                  name="galleryDescription"
                  value={formData.galleryDescription}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                  rows={2}
                />
              </div>

              {/* Gallery Images (preview + delete + add more) */}
              <div>
                <label className="block text-sm font-medium">
                  Gallery Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAddGalleryFiles}
                  className="block mt-2"
                />

                <div className="grid grid-cols-3 gap-3 mt-3">
                  {(formData.galleryImages || []).map((img, i) => (
                    <div key={i} className="relative">
                      <img
                        src={
                          typeof img === "string"
                            ? img
                            : URL.createObjectURL(img)
                        }
                        alt={`gallery-${i}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* About Section */}
              <div>
                <label className="block text-sm font-medium">
                  About Heading
                </label>
                <input
                  name="aboutHeading"
                  value={formData.aboutHeading}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                />
                <label className="block text-sm font-medium mt-2">
                  About Description
                </label>
                <textarea
                  name="aboutDescription"
                  value={formData.aboutDescription}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                  rows={2}
                />
              </div>

              {/* Review Images */}
              <div>
                <label className="block text-sm font-medium">
                  Review Heading
                </label>
                <input
                  name="reviewHeading"
                  value={formData.reviewHeading}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                  placeholder="Review Section Heading"
                />
              </div>

              {/* Review Images */}
              <div>
                <label className="block text-sm font-medium">
                  Review Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAddReviewFiles}
                  className="block mt-2"
                />

                <div className="grid grid-cols-3 gap-3 mt-3">
                  {(formData.reviewImages || []).map((img, i) => (
                    <div key={i} className="relative">
                      <img
                        src={
                          typeof img === "string"
                            ? img
                            : URL.createObjectURL(img)
                        }
                        alt={`review-${i}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeReviewImage(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description Title + Body */}
              <div>
                <label className="block text-sm font-medium">
                  Description Title
                </label>
                <input
                  name="descriptionTitle"
                  value={formData.descriptionTitle}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                />
                <label className="block text-sm font-medium mt-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>

              {/* Order Form */}
              <div>
                <label className="block text-sm font-medium">
                  Order Form Heading
                </label>
                <input
                  name="orderFormHeading"
                  value={formData.orderFormHeading}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                />
                <label className="block text-sm font-medium mt-2">
                  Order Button Text
                </label>
                <input
                  name="orderButtonText"
                  value={formData.orderButtonText}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-cyan-500 text-white py-2 rounded hover:bg-cyan-600 disabled:opacity-60"
                >
                  {uploading ? "Updating..." : "Update Landing Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllLandingPages;
