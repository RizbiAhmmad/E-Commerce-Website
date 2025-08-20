import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Loading from "@/Shared/Loading";
import { motion } from "framer-motion";
import { AuthContext } from "@/provider/AuthProvider";
import Swal from "sweetalert2";
import { IoIosHeart, IoMdHeartEmpty } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5";


const CategoryProducts = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("");
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/products?categoryId=${id}`
        );
        setProducts(res.data);
        const prices = res.data.map((p) => p.newPrice);
        const maxPrice = Math.max(...prices, 10000);
        setPriceRange([0, maxPrice]);
      } catch (err) {
        console.error("❌ Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [id]);

  if (loading) return <Loading />;

  const sortedProducts = [...products].sort((a, b) => {
    if (sort === "lowToHigh") return a.newPrice - b.newPrice;
    if (sort === "highToLow") return b.newPrice - a.newPrice;
    if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

  const filteredProducts = sortedProducts.filter(
    (p) => p.newPrice >= priceRange[0] && p.newPrice <= priceRange[1]
  );

  // SingleProduct component from your ProductCard design
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

    const handleAddToCart = async () => {
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

    return (
      <div className="border border-gray-300 dark:border-slate-700 rounded-xl p-2">
        <div className="relative overflow-hidden rounded-md">
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            alt={product.name}
            src={product.images?.[0] || "https://via.placeholder.com/300"}
            className="w-full h-48 object-cover rounded-md"
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
          <div className="flex items-end justify-between mt-5">
            <div>
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
            <div className="flex items-center gap-[8px]">
              <button
                onClick={handleAddToCart}
                className="py-2 px-4 border border-[#0FABCA] text-white rounded-md flex items-center gap-[0.5rem] hover:bg-[#0FABCA] transition-all duration-200"
              >
                <IoCartOutline className="text-[1.3rem] text-[#0FABCA] group-hover:text-white" />
              </button>
              <button
                onClick={() => navigate(`/product/${product._id}`)}
                className="py-2 px-2 border border-[#0FABCA] text-[#0FABCA] rounded-md hover:text-white hover:bg-[#0FABCA] transition-all duration-200"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
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
        <div>
          <h3 className="text-lg font-semibold mb-2">Price</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={priceRange[0]}
              onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
              className="w-20 border rounded px-2"
            />
            <span>-</span>
            <input
              type="number"
              min={0}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
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
        )}
      </main>
    </div>
  );
};

export default CategoryProducts;
