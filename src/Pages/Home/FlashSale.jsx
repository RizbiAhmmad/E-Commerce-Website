import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { IoIosHeart, IoMdHeartEmpty } from "react-icons/io";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import Loading from "@/Shared/Loading";

const fetchProducts = async () => {
  const { data } = await axios.get("http://localhost:5000/products");
  return data;
};

const fetchBrands = async () => {
  const { data } = await axios.get("http://localhost:5000/brands");
  return data;
};

const FlashSale = () => {
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

  const [visibleCount, setVisibleCount] = useState(2);

  if (isLoading) return <Loading></Loading>;
  if (isError)
    return <p className="text-center text-red-500">{error.message}</p>;

  const getBrandName = (brandId) => {
    return brands?.find((b) => b._id === brandId)?.name || "Unknown";
  };

  const activeProducts =
    products?.filter((product) => product.variant === "flash" && product.status === "active") || [];

  return (
    <div className="max-w-6xl mx-auto">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        className="text-4xl font-extrabold text-transparent bg-clip-text bg-purple-600 text-center my-8 select-none drop-shadow-lg"
      >
        Flash Sale Products
      </motion.h1>

      <div className="grid p-4 gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {activeProducts.slice(0, visibleCount).map((product) => (
          <SingleProduct
            key={product._id}
            product={product}
            brandName={getBrandName(product.brandId)}
          />
        ))}
      </div>

      {/* Load More Button */}
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

const SingleProduct = ({ product, brandName }) => {
  const [rating, setRating] = useState(5);
  const [isFavorite, setIsFavorite] = useState(false);

  const oldPriceNum = Number(product.oldPrice);
  const newPriceNum = Number(product.newPrice);

  const hasDiscount =
    oldPriceNum > newPriceNum && oldPriceNum > 0 && newPriceNum > 0;

  const discountPercent = hasDiscount
    ? Math.round(((oldPriceNum - newPriceNum) / oldPriceNum) * 100)
    : 0;

  const formatPrice = (price) =>
    `৳ ${price.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

  return (
    <div className="border border-gray-300 dark:border-slate-700 rounded-xl p-2">
      <div className="relative">
        <img
          alt={product.name}
          src={product.images?.[0] || "https://via.placeholder.com/300"}
          className="w-full h-48 object-cover rounded-md"
        />

        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg z-10">
            {discountPercent}% OFF
          </div>
        )}

        <div className="p-2 rounded-full bg-gray-600 absolute top-2 right-2">
          {isFavorite ? (
            <IoIosHeart
              onClick={() => setIsFavorite(false)}
              className="text-[#0FABCA] text-[1.2rem] cursor-pointer"
            />
          ) : (
            <IoMdHeartEmpty
              onClick={() => setIsFavorite(true)}
              className="text-white text-[1.2rem] cursor-pointer"
            />
          )}
        </div>
      </div>

      <div className="mt-2 p-1">
        <h3 className="text-[1.1rem] dark:text-[#abc2d3] font-medium line-clamp-1">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mt-1">
          <p className="text-gray-400 text-[0.9rem]">
            Brand:{" "}
            <span className="text-black dark:text-[#abc2d3]">{brandName}</span>
          </p>

          <div className="flex items-center gap-[10px]">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, index) => {
                const starRating = index + 1;
                return (
                  <FaStar
                    key={starRating}
                    className={`cursor-pointer ${
                      starRating <= rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                    size={15}
                    onClick={() => setRating(starRating)}
                  />
                );
              })}
            </div>
            <span className="text-[0.8rem] dark:text-slate-400 text-gray-500">
              (4.8)
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-gray-400 dark:text-slate-400 text-[0.9rem]">
              {!product.stock || Number(product.stock) === 0 ? (
                <span className="text-red-500 font-semibold">Out of stock</span>
              ) : (
                `${product.stock} in stock`
              )}
            </span>

            <div className="mt-1">
              {hasDiscount ? (
                <>
                  <span className="text-red-500 line-through mr-2">
                    {formatPrice(oldPriceNum)}
                  </span>
                  <span className="font-bold text-black">
                    {formatPrice(newPriceNum)}
                  </span>
                </>
              ) : (
                <span className="font-bold text-black">
                  {formatPrice(newPriceNum)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-[10px]">
            <button className="py-2 px-4 border border-[#0FABCA] text-white rounded-md flex items-center group gap-[0.5rem] text-[0.9rem] hover:bg-[#0FABCA] transition-all duration-200">
              <IoCartOutline className="text-[1.3rem] group-hover:text-white text-[#0FABCA]" />
            </button>

            <button className="py-2 px-4 border border-[#0FABCA] text-[#0FABCA] hover:text-white rounded-md flex items-center gap-[0.5rem] text-[0.9rem] hover:bg-[#0FABCA] transition-all duration-200">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashSale;
