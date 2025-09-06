import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaStar } from "react-icons/fa6";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import Loading from "@/Shared/Loading";
import { AuthContext } from "@/provider/AuthProvider";
import Swal from "sweetalert2";

const ProductDetailsPage = () => {
  const { user } = useContext(AuthContext);

  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [brands, setBrands] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewName, setReviewName] = useState(user?.displayName || "");
  const [reviewEmail, setReviewEmail] = useState(user?.email || "");
  const [reviews, setReviews] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch product data
    axios.get(`http://localhost:5000/products/${id}`).then((res) => {
      setProduct(res.data);
      if (res.data.colors?.length > 0) {
        setSelectedColor(res.data.colors[0]);
      }
      if (res.data.sizes?.length > 0) {
        setSelectedSize(res.data.sizes[0]);
      }
    });

    // Fetch reviews separately by productId
    axios
      .get(`http://localhost:5000/reviews?productId=${id}`)
      .then((res) => setReviews(res.data))
      .catch((err) => {
        console.error("Error fetching reviews:", err);
        setReviews([]);
      });
  }, [id]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/brands")
      .then((res) => setBrands(res.data));
  }, []);

  useEffect(() => {
    if (user) {
      setReviewName(user.displayName || "");
      setReviewEmail(user.email || "");
    }
  }, [user]);

  if (!product) return <Loading />;

  const getBrandName = (id) =>
    brands.find((b) => b._id === id)?.name || "Unknown";

  const oldPriceNum = Number(product.oldPrice);
  const newPriceNum = Number(product.newPrice);
  const hasDiscount =
    oldPriceNum > newPriceNum && oldPriceNum > 0 && newPriceNum > 0;
  const discountPercent = hasDiscount
    ? Math.round(((oldPriceNum - newPriceNum) / oldPriceNum) * 100)
    : 0;

  const formatPrice = (price) =>
    `৳ ${price.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (reviewRating === 0) {
      Swal.fire({ icon: "warning", title: "Please select a rating." });
      return;
    }
    if (!reviewText.trim()) {
      Swal.fire({ icon: "warning", title: "Please enter your review." });
      return;
    }
    if (!user) {
      Swal.fire({
        icon: "error",
        title: "You must be logged in to submit a review.",
      });
      return;
    }

    const reviewData = {
      productId: id,
      rating: reviewRating,
      text: reviewText.trim(),
      name: user.displayName || "Anonymous",
      email: user.email,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/reviews",
        reviewData
      );
      if (response.data.acknowledged) {
        setReviews((prev) => [...prev, response.data.review]);
        setReviewRating(0);
        setReviewText("");
        Swal.fire({
          icon: "success",
          title: "Thank you!",
          text: "Your review has been submitted.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "There was an error submitting your review.",
      });
    }
  };

  // Add this function inside ProductDetailsPage
  const handleAddToCart = async () => {
    if (!user) {
      Swal.fire({
        icon: "error",
        title: "You must be logged in to add to cart",
      });
      navigate("/login");
      return;
    }

    const cartData = {
      name: user.displayName || "Anonymous",
      email: user.email,
      productId: product._id,
      quantity,
      selectedColor,
      selectedSize,
    };

    try {
      const res = await axios.post("http://localhost:5000/cart", cartData);
      if (res.data.insertedId) {
        Swal.fire({
          icon: "success",
          title: "Added to cart successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        window.dispatchEvent(new Event("cartUpdated"));
        navigate("/cart");
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Failed to add to cart",
      });
    }
  };

  return (
    <div className="mx-auto dark:bg-black dark:text-white max-w-7xl px-4 md:px-12 py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Left - Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square">
            <div className="absolute top-4 left-4 z-10 space-y-2">
              {product.variant === "new" && (
                <span className="inline-block px-2 py-1 text-xs font-semibold bg-cyan-500 text-white">
                  NEW
                </span>
              )}
              {hasDiscount && (
                <div className="inline-block px-2 py-1 text-xs font-semibold rounded-2xl bg-emerald-500 text-white">
                  Discount {discountPercent}%
                </div>
              )}
            </div>
            <div className="relative h-full">
              <img
                src={
                  product.images?.[currentImageIndex] ||
                  "https://via.placeholder.com/400"
                }
                alt={product.name}
                className="w-full h-full object-cover rounded-md"
              />
              {product.images?.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex(
                        (prev) =>
                          (prev - 1 + product.images.length) %
                          product.images.length
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-lg hover:bg-[#0FABCA] hover:text-white"
                    aria-label="Previous image"
                  >
                    <BiChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex(
                        (prev) => (prev + 1) % product.images.length
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow-lg hover:bg-[#0FABCA] hover:text-white"
                    aria-label="Next image"
                  >
                    <BiChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Thumbnail images */}
          <div className="flex gap-4 justify-start">
            {product.images?.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`relative transition-all duration-300 w-[5rem] aspect-square rounded-md overflow-hidden ${
                  currentImageIndex === idx
                    ? "ring-2 ring-[#0FABCA]"
                    : "hover:ring-2 hover:ring-[#0FABCA]"
                }`}
                aria-label={`Select image ${idx + 1}`}
              >
                <img
                  src={img}
                  alt={`${product.name} image ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right - Product Info */}
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold">{product.name}</h1>

          {/* Specification */}
          <div className="mt-2 p-4 dark:bg-black dark:text-white bg-white ">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">
              Specification
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              {product.specification ? (
                product.specification
                  .split("\n")
                  .filter((line) => line.trim() !== "")
                  .map((line, idx) => <li key={idx}>{line}</li>)
              ) : (
                <li>No specification provided.</li>
              )}
            </ul>
          </div>

          {/* Brand */}
          <div className="flex justify-between gap-4 text-gray-700">
            <p>
              <span className="font-semibold">Brand:</span>{" "}
              {getBrandName(product.brandId)}
            </p>
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="w-5 h-5 fill-yellow-500" />
              ))}
              <span className="text-sm text-gray-600">
                {reviews.length} Reviews
              </span>
            </div>
          </div>

          {/* Prices */}
          <div className="flex items-center gap-3 text-xl font-semibold mt-3">
            <span className="text-[#0FABCA]">{formatPrice(newPriceNum)}</span>
            {hasDiscount && (
              <span className="line-through text-gray-500">
                {formatPrice(oldPriceNum)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <p
            className={`mt-2 font-semibold ${
              product.stock > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="mt-4">
              <p className="font-medium">Choose Color</p>
              <p className="font-semibold capitalize">{selectedColor}</p>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColor === color
                        ? "border-[#0FABCA]"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  ></button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="mt-4">
              <p className="font-medium">Choose Size</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`border rounded px-3 py-1 text-sm cursor-pointer select-none ${
                      selectedSize === size
                        ? "bg-[#0FABCA] text-white border-[#0FABCA]"
                        : "border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Wishlist */}
          <div className="flex gap-4 items-center pt-6">
            <div className="flex items-center dark:bg-black dark:text-white bg-gray-100 rounded-md">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-12 text-center bg-transparent"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4"
              >
                +
              </button>
            </div>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="py-3 border rounded-md flex items-center justify-center gap-2 grow hover:bg-gray-50"
            >
              {isFavorite ? (
                <FaHeart className="w-5 h-5 text-purple-500" />
              ) : (
                <FaRegHeart className="w-5 h-5" />
              )}
              Wishlist
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full px-6 py-3 bg-[#0FABCA] text-white rounded-md hover:bg-[#0FABCA]/90"
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Review Section */}
      <div className="mt-16">
        {/* Tabs */}
        <div className="border-b border-gray-300 flex gap-6 justify-center">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-2 ${
              activeTab === "description"
                ? "border-b-2 border-[#0FABCA] text-[#0FABCA] font-semibold"
                : "text-gray-600 hover:text-[#0FABCA]"
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-2 ${
              activeTab === "reviews"
                ? "border-b-2 border-[#0FABCA] text-[#0FABCA] font-semibold"
                : "text-gray-600 hover:text-[#0FABCA]"
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6 text-center">
          {activeTab === "description" && (
            <div>
              <p className="text-gray-600 whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              {/* Review Form */}
              <h2 className="text-2xl font-semibold mb-4">Give a Review</h2>
              <form
                onSubmit={handleReviewSubmit}
                className="space-y-4 max-w-xl mx-auto"
              >
                {/* Name */}
                <input
                  type="text"
                  placeholder="Your Name"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0FABCA]"
                  disabled={!!user}
                />
                {/* Email */}
                <input
                  type="email"
                  placeholder="Your Email"
                  value={reviewEmail}
                  onChange={(e) => setReviewEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#0FABCA]"
                  disabled={!!user}
                />
                {/* Rating Stars */}
                <div className="flex items-center gap-2 justify-center">
                  <h3 className="text-[24px] font-semibold dark:text-[#abc2d3] text-[#333333] mt-[20px]">
                    Hey Drop some Rating!
                  </h3>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`w-8 h-8 mt-4 cursor-pointer ${
                        reviewRating >= star
                          ? "fill-yellow-400"
                          : "fill-gray-300"
                      }`}
                      onClick={() => setReviewRating(star)}
                    />
                  ))}
                </div>
                {/* Review Text */}
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  placeholder="Write your review here..."
                  className="w-full border border-gray-300 rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#0FABCA]"
                  required
                />
                {/* Submit Button */}
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#0FABCA] text-white rounded-md hover:bg-[#0FABCA]/90"
                >
                  Submit Review
                </button>
              </form>

              {/* Display Reviews */}
              <div className="mt-8 max-w-xl mx-auto text-left">
                <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
                {reviews.length === 0 ? (
                  <p className="text-gray-600">No reviews yet.</p>
                ) : (
                  <ul className="space-y-4">
                    {reviews.map((r) => (
                      <li
                        key={r._id || r.id}
                        className="border p-4 rounded-md bg-gray-50"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <strong>{r.name || "Anonymous"}</strong>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          {[...Array(5)].map((_, i) => {
                            const starNumber = i + 1;
                            return (
                              <FaStar
                                key={i}
                                className={`w-5 h-5 ${
                                  starNumber <= r.rating
                                    ? "fill-yellow-400"
                                    : "fill-gray-300"
                                }`}
                              />
                            );
                          })}
                        </div>
                        <p className="text-gray-800 whitespace-pre-line">
                          {r.text}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
