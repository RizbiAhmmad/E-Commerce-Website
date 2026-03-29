import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "@/Shared/Loading";
import { motion } from "framer-motion";
import { AuthContext } from "@/provider/AuthProvider";
import Swal from "sweetalert2";
import { IoIosHeart, IoMdHeartEmpty } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5";
import { GrView } from "react-icons/gr";
import useAxiosPublic from "@/Hooks/useAxiosPublic";
import { MdFlashOn } from "react-icons/md";
import { HiMiniShoppingBag } from "react-icons/hi2";

const pushGTM = (data) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
};

const SubcategoryProducts = () => {
  const { subId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const axiosPublic = useAxiosPublic();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosPublic.get(`/products?subcategoryId=${subId}`);
        const activeProducts = res.data.filter((p) => p.status === "active");
        setProducts(activeProducts);

        const prices = activeProducts.map((p) => p.newPrice);
        const maxPrice = Math.max(...prices, 10000);
        setPriceRange([0, maxPrice]);
      } catch (err) {
        console.error("❌ Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [subId]);

  if (loading) return <Loading />;

  // Sorting
  const sortedProducts = [...products].sort((a, b) => {
    if (sort === "lowToHigh") return a.newPrice - b.newPrice;
    if (sort === "highToLow") return b.newPrice - a.newPrice;
    if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

  // Price filter
  const filteredProducts = sortedProducts.filter(
    (p) => p.newPrice >= priceRange[0] && p.newPrice <= priceRange[1],
  );

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct,
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Single product card (same as CategoryProducts)
  const SingleProduct = ({ product }) => {
    const [isFavorite, setIsFavorite] = useState(false);

    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [quantity, setQuantity] = useState(1);

    const [showModal, setShowModal] = useState(false);
    const [actionType, setActionType] = useState("");

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

    const handleAddToCartAction = async (e) => {
      if (!user) {
        Swal.fire({
          icon: "error",
          title: "Please login to add items to cart",
        });
        navigate("/login");
        return;
      }

      if (!selectedSize) {
        Swal.fire({
          icon: "warning",
          title: "Please select a size",
        });
        return;
      }

      if (!selectedColor) {
        Swal.fire({
          icon: "warning",
          title: "Please select a color",
        });
        return;
      }

      if (quantity < 1) {
        Swal.fire({
          icon: "warning",
          title: "Invalid quantity",
        });
        return;
      }

      try {
        const cartData = {
          name: user.displayName || "Anonymous",
          email: user.email,
          productId: product._id,
          quantity,
          selectedSize,
          selectedColor,
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
                  quantity: quantity,
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

    const handleBuyNowAction = () => {
      if (!selectedSize) {
        Swal.fire({ icon: "warning", title: "Please select a size" });
        return;
      }

      if (!selectedColor) {
        Swal.fire({ icon: "warning", title: "Please select a color" });
        return;
      }

      pushGTM({
        event: "begin_checkout",
        ecommerce: {
          currency: "BDT",
          value: Number(product.newPrice) * quantity,
          items: [
            {
              item_id: product._id,
              item_name: product.name,
              price: Number(product.newPrice),
              quantity: quantity,
              item_variant: `${selectedSize}-${selectedColor}`,
            },
          ],
        },
      });

      console.log("begin_checkout Fired");

      const buyItem = {
        productId: product._id,
        quantity,
        selectedColor,
        selectedSize,
      };

      setShowModal(false);

      navigate("/checkout", {
        state: {
          cartItems: [buyItem],
          productsMap: {
            [product._id]: product,
          },
        },
      });
    };

    const handleConfirm = async () => {
      if (!selectedSize) {
        Swal.fire({ icon: "warning", title: "Select size" });
        return;
      }

      if (!selectedColor) {
        Swal.fire({ icon: "warning", title: "Select color" });
        return;
      }

      if (quantity < 1) {
        Swal.fire({ icon: "warning", title: "Invalid quantity" });
        return;
      }

      setShowModal(false);

      if (actionType === "cart") {
        await handleAddToCartAction();
      }

      if (actionType === "buy") {
        handleBuyNowAction();
      }
    };
    return (
      <>
        <div
          onClick={() => navigate(`/product/${product._id}`)}
          className="border border-gray-700 dark:border-gray-300 rounded-xl p-2 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300"
        >
          {/* Image */}
          <div className="relative overflow-hidden rounded-md">
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              alt={product.name}
              src={product.images?.[0] || "https://via.placeholder.com/300"}
              className="w-full aspect-square object-cover rounded-md"
            />

            {/* Discount Badge */}
            {hasDiscount && (
              <motion.div
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute top-0 left-0 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg z-10"
              >
                {discountPercent}% OFF
              </motion.div>
            )}

            {/* Favorite */}
            {/* <div
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-full bg-gray-100 absolute top-2 right-2"
              >
                {isFavorite ? (
                  <IoIosHeart
                    onClick={() => setIsFavorite(false)}
                    className="text-[#0FABCA] text-[1.4rem] cursor-pointer"
                  />
                ) : (
                  <IoMdHeartEmpty
                    onClick={() => setIsFavorite(true)}
                    className="text-black text-[1.4rem] cursor-pointer"
                  />
                )}
              </div> */}
          </div>

          {/* Info */}
          <div className="mt-1 p-1">
            {/* <h3 className="text-[1.1rem] dark:text-white font-medium line-clamp-1">
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

            <div className="flex items-end justify-between my-1 flex-wrap gap-2">
              <div>
                <span className="text-gray-400 dark:text-slate-400 text-[0.9rem]">
                  {!product.stock || Number(product.stock) === 0 ? (
                    <span className="text-red-500 font-semibold">
                      Out of stock
                    </span>
                  ) : (
                    <span className="text-green-500 font-semibold">
                      In Stock
                    </span>
                  )}
                </span>

                <div className="mt-1 min-h-[30px] flex items-center gap-2 flex-wrap">
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setActionType("cart");
                    setShowModal(true);
                  }}
                  className="p-2 border-2 border-[#0FABCA] rounded-full hover:bg-[#0FABCA] transition-all duration-200"
                >
                  <IoCartOutline className="text-[1.5rem] text-[#0FABCA] hover:text-white" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActionType("buy");
                    setShowModal(true);
                  }}
                  className="p-2 border-2 border-[#0FABCA] rounded-full hover:bg-[#0FABCA] transition-all duration-200"
                >
                  <HiMiniShoppingBag className="text-[1.6rem] text-[#0FABCA] hover:text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {showModal && (
          <div
            onClick={() => setShowModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-2"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 160, damping: 18 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-[90%] max-w-[280px] sm:max-w-sm
                     rounded-2xl
                     bg-white/95 dark:bg-gray-900/95
                     backdrop-blur-xl
                     shadow-2xl
                     p-3 sm:p-4"
            >
              <h2
                className="text-base sm:text-lg font-bold text-center mb-3
                       bg-gradient-to-r from-cyan-500 to-blue-600
                       bg-clip-text text-transparent"
              >
                Choose Your Item
              </h2>

              {/* SIZE */}
              {product.sizes?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold mb-1">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1 rounded-full text-xs border transition
                      ${
                        selectedSize === size
                          ? "bg-cyan-500 text-white border-cyan-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* COLOR */}
              {product.colors?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold mb-1">Color</p>
                  <div className="flex gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 transition
                      ${
                        selectedColor === color
                          ? "border-black scale-110"
                          : "border-gray-300"
                      }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* QUANTITY */}
              <div className="mb-4">
                <p className="text-xs font-semibold mb-1">Qty</p>

                <div
                  className="flex items-center justify-between 
                      bg-gray-100 dark:bg-gray-800 
                      rounded-full px-2 py-1"
                >
                  {/* Minus Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
                    }
                    className="w-9 h-9 flex items-center justify-center 
                     text-lg font-bold text-cyan-600 
                     active:scale-90 transition"
                  >
                    −
                  </button>

                  {/* Input Field */}
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 1) {
                        setQuantity(value);
                      } else if (e.target.value === "") {
                        setQuantity("");
                      }
                    }}
                    onBlur={() => {
                      if (!quantity || quantity < 1) {
                        setQuantity(1);
                      }
                    }}
                    className="w-16 text-center bg-transparent 
                     text-sm font-bold 
                     focus:outline-none"
                  />

                  {/* Plus Button */}
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="w-9 h-9 flex items-center justify-center 
                     text-lg font-bold text-cyan-600 
                     active:scale-90 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* ACTION */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-1.5 text-sm rounded-full border"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirm}
                  className="flex-1 py-1.5 text-sm rounded-full
                         bg-gradient-to-r from-cyan-500 to-blue-600
                         text-white font-semibold"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="dark:bg-black dark:text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Sort By</h3>
            <div className="space-y-2">
              <label className="block">
                <input
                  type="radio"
                  name="sort"
                  onChange={() => setSort("newest")}
                />{" "}
                Newest
              </label>
              <label className="block">
                <input
                  type="radio"
                  name="sort"
                  onChange={() => setSort("lowToHigh")}
                />{" "}
                Price Low To High
              </label>
              <label className="block">
                <input
                  type="radio"
                  name="sort"
                  onChange={() => setSort("highToLow")}
                />{" "}
                Price High To Low
              </label>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Price</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={priceRange[0]}
                onChange={(e) =>
                  setPriceRange([+e.target.value, priceRange[1]])
                }
                className="w-20 border rounded px-2"
              />
              <span>-</span>
              <input
                type="number"
                min={0}
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], +e.target.value])
                }
                className="w-20 border rounded px-2"
              />
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="lg:col-span-3">
          <h2 className="text-2xl font-bold mb-6">
            Explore Products{" "}
            <span className="text-gray-500 text-lg">
              ({filteredProducts.length} Products Found)
            </span>
          </h2>

          {filteredProducts.length === 0 ? (
            <p className="text-center text-gray-600">No products found.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {currentProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SingleProduct product={product} />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8 flex justify-center items-center gap-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-semibold text-white ${
                    currentPage === 1
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-cyan-500 hover:bg-cyan-600"
                  }`}
                >
                  Previous
                </button>
                <span className="px-4 py-2 rounded-lg dark:text-black bg-gray-100">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-semibold text-white ${
                    currentPage === totalPages
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-cyan-500 hover:bg-cyan-600"
                  }`}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default SubcategoryProducts;
