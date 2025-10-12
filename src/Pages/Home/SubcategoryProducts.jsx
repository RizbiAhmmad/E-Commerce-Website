import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Loading from "@/Shared/Loading";
import { motion } from "framer-motion";
import { AuthContext } from "@/provider/AuthProvider";
import Swal from "sweetalert2";
import { IoIosHeart, IoMdHeartEmpty } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5";
import { GrView } from "react-icons/gr";

const SubcategoryProducts = () => {
  const { subId } = useParams(); // subcategory ID
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("");
  const [priceRange, setPriceRange] = useState([0, 10000]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        `https://api.sports.bangladeshiit.com/products?subcategoryId=${subId}`
      );
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
    (p) => p.newPrice >= priceRange[0] && p.newPrice <= priceRange[1]
  );

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Single product card (same as CategoryProducts)
  const SingleProduct = ({ product }) => {
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
        const res = await axios.post("https://api.sports.bangladeshiit.com/cart", cartData);
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
        Swal.fire({ icon: "error", title: "Failed to add to cart" });
      }
    };

    return (
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
              className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg z-10"
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
        <div className="mt-2 p-1">
          {/* <h3 className="text-[1.1rem] dark:text-white font-medium line-clamp-1">
            {product.name}
          </h3> */}
          <div className="min-h-[2.5rem] max-h-[5rem] overflow-auto">
          <h3 className="text-[1rem] md:text-[1.1rem] leading-tight line-clamp-2 dark:text-white font-medium">
            {product.name}
          </h3>
        </div>

          <div className="flex items-end justify-between my-2 flex-wrap gap-2">
                    <div>
                      <span className="text-gray-400 dark:text-slate-400 text-[0.9rem]">
                        {!product.stock || Number(product.stock) === 0 ? (
                          <span className="text-red-500 font-semibold">Out of stock</span>
                        ) : (
                          <span className="text-green-500 font-semibold">In Stock</span>
                        )}
                      </span>
          
                      <div className="mt-1 min-h-[40px] flex items-center gap-2 flex-wrap">
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
