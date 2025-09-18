import React, { useState, useContext, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { IoIosHeart, IoMdHeartEmpty } from "react-icons/io";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import Loading from "@/Shared/Loading";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Typewriter } from "react-simple-typewriter";
import { AuthContext } from "@/provider/AuthProvider";
import { GrView } from "react-icons/gr";

const fetchProducts = async () => {
  const { data } = await axios.get("http://localhost:5000/products");
  return data;
};

const fetchBrands = async () => {
  const { data } = await axios.get("http://localhost:5000/brands");
  return data;
};

const fetchReviews = async () => {
  const { data } = await axios.get("http://localhost:5000/reviews");
  return data;
};

const ProductCard = () => {
  const {
    data: products,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: fetchBrands,
  });

  const { data: reviews } = useQuery({
    queryKey: ["reviews"],
    queryFn: fetchReviews,
  });

  const [visibleCount, setVisibleCount] = useState(40);

  if (isLoading) return <Loading />;
  if (isError)
    return <p className="text-center text-red-500">{error.message}</p>;

  const getBrandName = (brandId) => {
    return brands?.find((b) => b._id === brandId)?.name || "Unknown";
  };

  const activeProducts =
    products?.filter((product) => product.status === "active") || [];

  const getAverageRating = (productId) => {
    if (!reviews) return 0;
    const productReviews = reviews.filter((r) => r.productId === productId);
    if (productReviews.length === 0) return 0;
    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / productReviews.length;
  };

  return (
    <div className="max-w-7xl dark:bg-black dark:text-white mx-auto">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        className="text-3xl font-extrabold text-transparent bg-clip-text bg-cyan-500 text-center my-8 select-none drop-shadow-lg"
      >
        <Typewriter
          words={["All Products"]}
          loop={0}
          cursor
          cursorStyle="|"
          typeSpeed={70}
          deleteSpeed={50}
          delaySpeed={2000}
        />
      </motion.h1>

      <div className="grid p-4 gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {activeProducts.slice(0, visibleCount).map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.1,
              type: "spring",
              stiffness: 100,
            }}
            whileHover={{
              scale: 1.03,
              y: -5,
              boxShadow: "0px 8px 20px rgba(0,0,0,0.15)",
            }}
          >
            <SingleProduct
              product={product}
              brandName={getBrandName(product.brandId)}
              averageRating={getAverageRating(product._id)}
            />
          </motion.div>
        ))}
      </div>

      {visibleCount < activeProducts.length && (
        <div className="text-center my-6">
          <button
            onClick={() => setVisibleCount((prev) => prev + 20)}
            className="px-6 py-2 bg-[#0FABCA] text-white rounded-md hover:bg-[#0c99b3] transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

const SingleProduct = ({ product, brandName, averageRating }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const oldPriceNum = Number(product.oldPrice);
  const newPriceNum = Number(product.newPrice);

  const hasDiscount =
    oldPriceNum > newPriceNum && oldPriceNum > 0 && newPriceNum > 0;

  const discountPercent = hasDiscount
    ? Math.round(((oldPriceNum - newPriceNum) / oldPriceNum) * 100)
    : 0;

  const formatPrice = (price) =>
    `৳ ${price.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!user) {
      Swal.fire({
        icon: "error",
        title: "Please login to add items to cart",
      });
      navigate("/login");
      return;
    }

    try {
      const cartData = {
        name: user.displayName || "Anonymous",
        email: user.email,
        productId: product._id,
        quantity: 1,
      };

      const res = await axios.post("http://localhost:5000/cart", cartData);
      if (res.data.insertedId) {
        Swal.fire({
          icon: "success",
          title: "Added to cart successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Failed to add to cart",
      });
    }
  };

  const handleAddToWhisper = async (e) => {
    e.stopPropagation();
    if (!user) {
      Swal.fire({
        icon: "error",
        title: "Please login to save favourite",
      });
      navigate("/login");
      return;
    }

    try {
      const whisperData = {
        name: user.displayName || "Anonymous",
        email: user.email,
        productId: product._id,
        productName: product.name,
        productImage: product.images?.[0],
        brandName: brandName,
        price: product.newPrice,
      };

      const res = await axios.post(
        "http://localhost:5000/whisper",
        whisperData
      );
      if (res.data.insertedId) {
        setIsFavorite(true);
        Swal.fire({
          icon: "success",
          title: "Added to Favourite successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        window.dispatchEvent(new Event("whisperUpdated"));
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Failed to add to Favourite",
      });
    }
  };

   useEffect(() => {
    if (user) {
      axios
        .get(`http://localhost:5000/whisper?email=${user.email}`)
        .then((res) => {
          const favExists = res.data.some(
            (fav) => fav.productId === product._id
          );
          setIsFavorite(favExists);
        });
    }
  }, [user, product._id]);

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="border border-gray-700 dark:border-gray-300 rounded-xl p-2 shadow-lg cursor-pointer dark:hover:bg-cyan-600 hover:bg-cyan-100 hover:shadow-xl transition-all duration-300"
    >
      <div className="relative overflow-hidden rounded-md">
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          alt={product.name}
          src={product.images?.[0] || "https://via.placeholder.com/300"}
          className="w-full aspect-square object-cover rounded-md"
        />

        {hasDiscount && (
          <motion.div
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg z-10"
          >
            {discountPercent}% OFF
          </motion.div>
        )}

        <div
          onClick={(e) => e.stopPropagation()}
          className="p-2 rounded-full bg-gray-100 absolute top-2 right-2"
        >
          {isFavorite ? (
            <IoIosHeart
              onClick={handleAddToWhisper}
              className="text-[#0FABCA] text-[1.4rem] cursor-pointer"
            />
          ) : (
            <IoMdHeartEmpty
              onClick={handleAddToWhisper}
              className="text-black text-[1.4rem] cursor-pointer"
            />
          )}
        </div>
      </div>

      <div className="mt-2 p-1">
        <h3 className="text-[1.1rem] dark:text-white font-medium line-clamp-1">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mt-1">
          <p className="text-gray-400 text-[0.9rem]">
            Brand:{" "}
            <span className="text-black dark:text-gray-100">{brandName}</span>
          </p>

          <div className="flex items-center gap-[8px]">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, index) => {
                const starNumber = index + 1;
                return (
                  <FaStar
                    key={starNumber}
                    className={`${
                      starNumber <= Math.round(averageRating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    size={14}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between my-2">
          <div>
            <span className="text-gray-400 dark:text-slate-400 text-[0.9rem]">
              {!product.stock || Number(product.stock) === 0 ? (
                <span className="text-red-500 font-semibold">Out of stock</span>
              ) : (
                <span className="text-green-500 font-semibold">In Stock</span>
              )}
            </span>

            <div className="mt-1 min-h-[40px] flex items-center gap-2">
              {hasDiscount ? (
                <>
                  <span className="text-red-500 line-through">
                    {formatPrice(oldPriceNum)}
                  </span>
                  <span className="font-bold text-black dark:text-white">
                    {formatPrice(newPriceNum)}
                  </span>
                </>
              ) : (
                <span className="font-bold dark:text-white text-black">
                  {formatPrice(newPriceNum)}
                </span>
              )}
            </div>
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 md:gap-4"
          >
            <button
              onClick={handleAddToCart}
              className="p-2 border border-[#0FABCA] rounded-full hover:bg-[#0FABCA] transition-all duration-200"
            >
              <IoCartOutline className="text-[1.5rem] text-[#0FABCA] hover:text-white" />
            </button>

            <button
              onClick={() => navigate(`/product/${product._id}`)}
              className="p-2 border border-[#0FABCA] rounded-full hover:bg-[#0FABCA] transition-all duration-200"
            >
              <GrView className="text-[1.4rem] text-[#0FABCA] hover:text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
