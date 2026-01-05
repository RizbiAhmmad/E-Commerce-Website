import React, { useState, useContext, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { IoIosHeart, IoMdHeartEmpty } from "react-icons/io";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Loading from "@/Shared/Loading";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Typewriter } from "react-simple-typewriter";
import { AuthContext } from "@/provider/AuthProvider";
import useAxiosPublic from "@/Hooks/useAxiosPublic";
import { HiMiniShoppingBag } from "react-icons/hi2";

const pushGTM = (data) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
};

const NewArrival = () => {
  const axiosPublic = useAxiosPublic();
  const fetchProducts = async () => {
    const { data } = await axiosPublic.get("/products");
    return data;
  };

  const fetchBrands = async () => {
    const { data } = await axiosPublic.get("/brands");
    return data;
  };

  const fetchReviews = async () => {
    const { data } = await axiosPublic.get("/reviews");
    return data;
  };

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

  const [visibleCount, setVisibleCount] = useState(20);

  const getBrandName = (brandId) => {
    return brands?.find((b) => b._id === brandId)?.name || "Unknown";
  };

  const activeProducts =
    products
      ?.filter(
        (product) => product.variant === "new" && product.status === "active"
      )
      .reverse() || [];

  useEffect(() => {
    if (!activeProducts.length) return;

    pushGTM({
      event: "view_item_list",
      ecommerce: {
        currency: "BDT",
        items: activeProducts.slice(0, visibleCount).map((p) => ({
          item_id: p._id,
          item_name: p.name,
          price: Number(p.newPrice),
          item_brand: getBrandName(p.brandId),
          discount: p.oldPrice ? Number(p.oldPrice) - Number(p.newPrice) : 0,
        })),
      },
    });

    // console.log("GTM Fired: view_item_list");
  }, [visibleCount, activeProducts]);

  if (isLoading) return <Loading />;
  if (isError)
    return <p className="text-center text-red-500">{error.message}</p>;

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
          words={["New Arrival Products"]}
          loop={0}
          cursor
          cursorStyle="|"
          typeSpeed={70}
          deleteSpeed={50}
          delaySpeed={2000}
        />
      </motion.h1>

      <div className="grid p-4 gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {activeProducts.slice(0, visibleCount).map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
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
          <motion.button
            onClick={() => setVisibleCount((prev) => prev + 20)}
            whileHover={{
              scale: 1.1,
              boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="px-8 py-3 bg-gradient-to-b from-cyan-500 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
          >
            Load More
          </motion.button>
        </div>
      )}
    </div>
  );
};

const SingleProduct = ({ product, brandName, averageRating }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();

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
        selected: true,
      };

      const res = await axiosPublic.post("/cart", cartData);
      if (res.data.insertedId) {
        pushGTM({
          event: "add_to_cart",
          ecommerce: {
            items: [
              {
                item_id: product._id,
                item_name: product.name,
                price: Number(product.newPrice),
                item_brand: brandName,
                quantity: 1,
              },
            ],
          },
        });
        // console.log("GTM Fired: add to cart");

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

  const handleBuyNow = (e) => {
    e.stopPropagation();

    pushGTM({
      event: "begin_checkout",
      ecommerce: {
        items: [
          {
            item_id: product._id,
            item_name: product.name,
            price: Number(product.newPrice),
            item_brand: brandName,
            quantity: 1,
          },
        ],
      },
    });

    const buyItem = {
      productId: product._id,
      quantity: 1,
      selectedColor: "",
      selectedSize: "",
    };

    navigate("/checkout", {
      state: {
        cartItems: [buyItem],
        productsMap: {
          [product._id]: product,
        },
      },
    });
  };

  const handleAddToWhisper = async (e) => {
    e.stopPropagation();
    pushGTM({
      event: "add_to_wishlist",
      ecommerce: {
        items: [
          {
            item_id: product._id,
            item_name: product.name,
            price: Number(product.newPrice),
            item_brand: brandName,
          },
        ],
      },
    });

    // console.log("GTM Fired: Add to wishlist");

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

      const res = await axiosPublic.post("/whisper", whisperData);
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
      axiosPublic.get(`/whisper?email=${user.email}`).then((res) => {
        const favExists = res.data.some((fav) => fav.productId === product._id);
        setIsFavorite(favExists);
      });
    }
  }, [user, product._id]);

  return (
    <div
      onClick={() => {
        pushGTM({
          event: "select_item",
          ecommerce: {
            items: [
              {
                item_id: product._id,
                item_name: product.name,
                price: Number(product.newPrice),
                item_brand: brandName,
              },
            ],
          },
        });

        navigate(`/product/${product._id}`);
      }}
      className="border border-gray-700 dark:border-gray-300 rounded-xl p-2 shadow-lg cursor-pointer dark:hover:bg-gray-900 hover:bg-cyan-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div className="relative overflow-hidden rounded-md">
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.1, ease: "linear" }}
          alt={product.name}
          src={product.images?.[0] || "https://via.placeholder.com/300"}
          className="w-full aspect-square object-cover rounded-md"
        />

        <div className="absolute top-0 left-0 md:top-2 md:left-2 z-10 flex flex-col gap-1">
          {/* Discount Badge */}
          {hasDiscount && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg"
            >
              {discountPercent}% OFF
            </motion.div>
          )}

          {/* Free Shipping Badge */}
          {product.freeShipping && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-red-500 text-white text-[10px] font-semibold 
                 px-2 py-[2px] rounded-md shadow-md flex items-center gap-1"
            >
              🚚 Free Shipping
            </motion.div>
          )}
        </div>

        <div
          onClick={(e) => e.stopPropagation()}
          className="p-2 rounded-full bg-gray-100 absolute top-1 right-1 md:top-2 md:right-2"
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

      <div className="mt-1 p-1 min-w-0">
        {/* <h3 className="text-[1.1rem] dark:text-white font-medium">
          {product.name}
        </h3> */}
        <div className="mt-1 mb-1">
          <h3
            className="text-[1rem] md:text-[1.05rem] font-medium dark:text-white 
                 leading-tight whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {product.name}
          </h3>
        </div>

        {/* Brand & Review responsive */}
        <div className="mt-1 hidden md:flex md:items-center md:justify-between">
          <p className="text-gray-400 text-[0.9rem] truncate">
            Brand:{" "}
            <span className="text-black dark:text-gray-100">{brandName}</span>
          </p>

          <div className="flex items-center gap-1 mt-1 md:mt-0">
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

        <div className="flex items-end justify-between flex-wrap gap-2">
          <div>
            <span className="text-gray-400 dark:text-slate-400 text-[0.9rem]">
              {!product.stock || Number(product.stock) === 0 ? (
                <span className="text-red-500 font-semibold">Out of stock</span>
              ) : (
                <span className="text-green-500 font-semibold">In Stock</span>
              )}
            </span>

            <div className="min-h-[30px] flex items-center gap-2 flex-wrap">
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
            className="flex items-center gap-6 flex-shrink-0"
          >
            <button
              onClick={handleAddToCart}
              className="p-2 border-2 border-[#0FABCA] rounded-full hover:bg-[#0FABCA] transition-all duration-200"
            >
              <IoCartOutline className="text-[1.5rem] text-[#0FABCA] hover:text-white" />
            </button>

            <button
              onClick={handleBuyNow}
              className="p-2 border-2 border-[#0FABCA] rounded-full hover:bg-[#0FABCA] transition-all duration-200"
            >
              <HiMiniShoppingBag className="text-[1.6rem] text-[#0FABCA] hover:text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewArrival;
