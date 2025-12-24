import { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShoppingCart,
  FaSearch,
  FaUser,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaHome,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import ThemeChange from "@/components/ThemeChange";
import { AuthContext } from "@/provider/AuthProvider";
import { IoMdHeartEmpty } from "react-icons/io";
import useAxiosPublic from "@/Hooks/useAxiosPublic";
import Swal from "sweetalert2";
import { FaBell } from "react-icons/fa";
import { MdLocalShipping } from "react-icons/md";

const Navbar = () => {
  const { user, logOut } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [whisperCount, setWhisperCount] = useState(0);
  const [menuData, setMenuData] = useState([]);
  const [openCategory, setOpenCategory] = useState(null);
  const [footerInfo, setFooterInfo] = useState(null);
  const axiosPublic = useAxiosPublic();
  const [orders, setOrders] = useState([]);
  const [orderCount, setOrderCount] = useState(0);

  const [trackId, setTrackId] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [showTrackBox, setShowTrackBox] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);

  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  useEffect(() => {
    if (user?.email) {
      axiosPublic
        .get("/users")
        .then((res) => {
          const currentUser = res.data.find((u) => u.email === user.email);
          setRole(currentUser?.role || "user");
        })
        .catch(() => setRole("user"));
    }
  }, [user]);

  // Fetch whisper count
  const fetchWhisperCount = () => {
    if (!user?.email) {
      setWhisperCount(0);
      return;
    }
    axiosPublic
      .get(`/whisper?email=${user.email}`)
      .then((res) => setWhisperCount(res.data.length))
      .catch(() => setWhisperCount(0));
  };

  // Fetch cart count
  const fetchCartCount = () => {
    if (!user?.email) {
      setCartCount(0);
      return;
    }
    axiosPublic
      .get(`/cart?email=${user.email}`)
      .then((res) => {
        const totalCount = res.data.reduce(
          (acc, item) => acc + (item.quantity || 1),
          0
        );
        setCartCount(totalCount);
      })
      .catch(() => setCartCount(0));
  };

  useEffect(() => {
    fetchCartCount();
    fetchWhisperCount();

    const onCartUpdated = () => fetchCartCount();
    const onWhisperUpdated = () => fetchWhisperCount();

    window.addEventListener("cartUpdated", onCartUpdated);
    window.addEventListener("whisperUpdated", onWhisperUpdated);

    return () => {
      window.removeEventListener("cartUpdated", onCartUpdated);
      window.removeEventListener("whisperUpdated", onWhisperUpdated);
    };
  }, [user]);

  // Live search
  useEffect(() => {
    if (searchText.trim()) {
      axiosPublic
        .get("/products")
        .then((res) => {
          const filtered = res.data.filter(
            (p) =>
              p.status === "active" &&
              (p.name.toLowerCase().includes(searchText.toLowerCase()) ||
                p.barcode?.toLowerCase().includes(searchText.toLowerCase()))
          );
          setSearchResults(filtered);
        })
        .catch(() => setSearchResults([]));
    } else {
      setSearchResults([]);
    }
  }, [searchText]);

  // Login / Logout
  const handleLogin = () => {
    navigate("/login");
    setIsOpen(false);
  };
  const handleLogOut = () => {
    logOut().catch((error) => console.log(error));
  };

  // Menu data
  useEffect(() => {
    axiosPublic
      .get("/categories-with-subcategories")
      .then((res) => setMenuData(res.data))
      .catch(() => setMenuData([]));
  }, []);

  // Footer info (logo, name)
  useEffect(() => {
    axiosPublic
      .get("/footer")
      .then((res) => {
        if (res.data.length > 0) setFooterInfo(res.data[0]);
      })
      .catch(() => setFooterInfo(null));
  }, []);

  const lastOrderCountRef = useRef(0);

  useEffect(() => {
    if (role !== "admin") return;

    const fetchOrders = async () => {
      try {
        const res = await axiosPublic.get("/orders");
        setOrders(res.data);
        setOrderCount(res.data.length);

        if (
          lastOrderCountRef.current !== 0 &&
          res.data.length > lastOrderCountRef.current
        ) {
          Swal.fire({
            icon: "info",
            title: "🎉 New Order Received!",
            text: "A new customer order has been placed.",
            showConfirmButton: false,
            timer: 3000,
          });
        }

        lastOrderCountRef.current = res.data.length;
      } catch (error) {
        console.error(error);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 2000);
    return () => clearInterval(interval);
  }, [role]);

  // const handleTrack = async () => {
  //   if (!trackId.trim()) {
  //     return Swal.fire("Error", "Enter Order ID", "warning");
  //   }

  //   try {
  //     const res = await axiosPublic.get(`/orders/${trackId}`);
  //     setTrackingData(res.data);
  //     setShowTrackBox(true);
  //   } catch (error) {
  //     Swal.fire("Not Found", "Invalid Order ID", "error");
  //   }
  // };
  const handleTrack = async () => {
    if (!trackId.trim()) {
      return Swal.fire("Error", "Enter Order ID", "warning");
    }

    try {
      const res = await axiosPublic.get(`/orders/${trackId}`);
      const orderData = res.data;

      // Close mobile menu & search
      setIsOpen(false);
      setSearchOpen(false);

      // Navigate
      navigate("/myorder", { state: { orderData } });
    } catch (error) {
      Swal.fire("Not Found", "Invalid Order ID", "error");
    }
  };

  return (
    <nav className="bg-white dark:bg-black text-black dark:text-white border-b dark:border-gray-700 fixed w-full z-50 px-4 md:px-8 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-1">
        {/* Logo */}
        {/* <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="leading-tight text-lg md:text-xl items-center flex gap-1 md:gap-2 font-bold text-black dark:text-white"
        >
          {footerInfo?.logo && (
            <img
              src={footerInfo.logo}
              alt="Logo"
              className="w-12 h-12 rounded-full"
            />
          )}

          <Link to="/">{footerInfo?.name}</Link>
        </motion.div> */}

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center"
        >
          {footerInfo?.logo && (
            <Link to="/" className="cursor-pointer">
              <div className="bg-white p-1 rounded-full flex items-center">
                <img
                  src={footerInfo.logo}
                  alt="Logo"
                  className="h-15 md:h-18 w-auto object-contain"
                />
              </div>
            </Link>
          )}
        </motion.div>

        {/* Desktop Search + Categories */}
        <div className="hidden md:flex items-center  relative gap-4">
          {/* Categories */}
          <div className="relative group">
            <button
              onMouseEnter={() => setOpenCategory(true)}
              className="flex items-center text-xl gap-1 text-black dark:text-gray-200 hover:text-cyan-500"
            >
              Category <FaChevronDown className="text-sm mt-0.5" />
            </button>

            {openCategory && (
              <div
                onMouseLeave={() => setOpenCategory(false)}
                className="absolute left-0 top-full mt-2 bg-white dark:bg-gray-900 border shadow-xl w-[700px] rounded-md z-50 p-6"
              >
                <div className="grid grid-cols-4 gap-6">
                  {menuData.map((cat) => (
                    <div key={cat._id}>
                      {/* Category (Bold) */}
                      <h3
                        className="font-bold text-black dark:text-white mb-3 cursor-pointer hover:text-cyan-500"
                        onClick={() => {
                          navigate(`/category/${cat._id}`);
                          setOpenCategory(false);
                        }}
                      >
                        {cat.name}
                      </h3>

                      {/* Subcategories */}
                      <ul className="space-y-1">
                        {cat.subcategories.map((sub) => (
                          <li
                            key={sub._id}
                            className="text-gray-600 dark:text-gray-400 hover:text-cyan-500 cursor-pointer"
                            onClick={() => {
                              navigate(`/subcategory/${sub._id}`);
                              setOpenCategory(false);
                            }}
                          >
                            {sub.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="flex items-center w-2/3 relative">
            <FaSearch className="absolute left-3 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search products by name or barcode..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-md bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-12 left-0 w-full bg-white dark:bg-gray-800 border rounded-md shadow-md max-h-60 overflow-y-auto z-50">
                {searchResults.map((product) => (
                  <Link
                    key={product._id}
                    to={`/product/${product._id}`}
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setSearchText("")}
                  >
                    {product.name} (Code: {product.barcode})
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-4 text-xl relative">
          <ThemeChange className="hidden md:block" />

          {/* Mobile Search */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden hover:text-cyan-500"
          >
            <FaSearch />
          </button>

          {/* Mobile Track Icon */}
          <button
            onClick={() => {
              setTrackOpen(!trackOpen);
              setSearchOpen(false);
            }}
            className="md:hidden hover:text-cyan-500"
          >
            <MdLocalShipping />
          </button>

          {/* Cart */}
          <Link
            to="/cart"
            className="hover:text-cyan-500 hidden md:flex relative"
          >
            <FaShoppingCart />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Favourites */}
          <Link
            to="/favourites"
            className="hover:text-cyan-500 hidden md:flex relative"
          >
            <IoMdHeartEmpty />
            {whisperCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">
                {whisperCount}
              </span>
            )}
          </Link>

          {/* ORDER TRACKER */}
          <div className="hidden md:flex items-center border rounded-xl overflow-hidden">
            <input
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              placeholder="Order ID"
              className="px-3 py-2 text-sm outline-none dark:bg-gray-800"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleTrack();
                }
              }}
            />
            <button
              onClick={handleTrack}
              className="bg-cyan-500 text-white px-3 py-2 text-sm hover:bg-cyan-600"
            >
              Track
            </button>
          </div>

          {user && role === "admin" ? (
            <div className="relative group">
              <FaBell
                className="text-xl cursor-pointer hover:text-cyan-500 transition-colors"
                onClick={() => navigate("/dashboard/allorders")}
              />
              {orderCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">
                  {orderCount}
                </span>
              )}

              <div className="absolute right-0 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 hidden group-hover:block z-50">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Recent Orders
                </h3>
                {orders?.slice(0, 5).map((order) => (
                  <div
                    key={order._id}
                    className="border-b border-gray-200 dark:border-gray-700 py-1 text-sm text-gray-600 dark:text-gray-300"
                  >
                    #{order._id.slice(-5)} - {order.status}
                  </div>
                ))}
                <Link
                  to="/dashboard/allorders"
                  className="text-cyan-600 text-sm font-semibold mt-2 inline-block hover:underline"
                >
                  View All Orders →
                </Link>
              </div>
            </div>
          ) : null}

          {/* Dashboard (Desktop only) */}
          {user && (
            <Link
              to="/dashboard"
              className="hidden md:block text-black dark:text-gray-200 hover:text-cyan-500 text-xl "
            >
              Dashboard
            </Link>
          )}

          {/* Auth buttons (Desktop only) */}
          {user ? (
            <button
              onClick={handleLogOut}
              className="hidden md:flex text-sm border border-gray-300 bg-red-500 px-3 py-2 rounded-md text-white hover:bg-red-600 items-center"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="hidden md:flex text-sm border border-gray-300 bg-cyan-500 px-3 py-2 rounded-md text-white hover:bg-cyan-600 items-center"
            >
              <FaUser className="mr-1" /> Login
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-2xl"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Search Expand */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t px-4 py-2"
          >
            <div className="flex flex-col relative w-full">
              <div className="flex items-center relative">
                <FaSearch className="absolute left-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-md bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2 bg-white dark:bg-gray-800 border rounded-md shadow-md max-h-60 overflow-y-auto">
                  {searchResults.map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setSearchText("");
                        setSearchOpen(false);
                      }}
                    >
                      {product.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {trackOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t px-4 py-3"
          >
            <div className="flex gap-2">
              <input
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder="Enter Order ID"
                className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-black dark:text-white outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleTrack();
                    setTrackOpen(false);
                  }
                }}
              />

              <button
                onClick={() => {
                  handleTrack();
                  setTrackOpen(false);
                }}
                className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"
              >
                Track
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden md:hidden bg-gray-100 dark:bg-gray-900 text-black dark:text-white border-t border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-col px-4 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="hover:text-cyan-500"
              >
                Home
              </Link>
              <Link
                to="/about"
                onClick={() => setIsOpen(false)}
                className="hover:text-cyan-500"
              >
                About
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsOpen(false)}
                className="hover:text-cyan-500"
              >
                Contact
              </Link>

              {/* Dashboard link (only when logged in) */}
              {user && (
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="hover:text-cyan-500"
                >
                  Dashboard
                </Link>
              )}

              {/* Categories */}
              {menuData.length > 0 && (
                <div className="flex flex-col space-y-1 mt-2">
                  <div className="font-semibold text-gray-700 dark:text-gray-200">
                    Categories
                  </div>
                  {menuData.map((cat) => (
                    <div key={cat._id} className="flex flex-col">
                      <button
                        onClick={() =>
                          setOpenCategory(
                            openCategory === cat._id ? null : cat._id
                          )
                        }
                        className="flex justify-between items-center px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        {cat.name}
                        {cat.subcategories.length > 0 && (
                          <FaChevronDown className="text-xs" />
                        )}
                      </button>

                      {/* Subcategories */}
                      {openCategory === cat._id &&
                        cat.subcategories.length > 0 && (
                          <div className="flex flex-col ml-4 mt-1 space-y-1">
                            {cat.subcategories.map((sub) => (
                              <button
                                key={sub._id}
                                onClick={() => {
                                  navigate(`/subcategory/${sub._id}`);
                                  setIsOpen(false);
                                  setOpenCategory(null);
                                }}
                                className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-200 text-left"
                              >
                                {sub.name}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}

              {/* Auth Buttons */}
              {user ? (
                <button
                  onClick={() => {
                    handleLogOut();
                    setIsOpen(false);
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md mt-3"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-md flex items-center justify-center mt-3"
                >
                  <FaUser className="mr-2" /> Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-inner flex justify-around items-center py-2 z-50">
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center text-xs mt-1 ${
            location.pathname === "/"
              ? "text-cyan-500"
              : "text-gray-600 dark:text-gray-300 hover:text-cyan-500"
          }`}
        >
          <FaHome className="text-xl" />
          <span>Home</span>
        </Link>

        {/* Cart */}
        <Link
          to="/cart"
          className={`relative flex flex-col items-center text-xs mt-1 ${
            location.pathname === "/cart"
              ? "text-cyan-500"
              : "text-gray-600 dark:text-gray-300 hover:text-cyan-500"
          }`}
        >
          <FaShoppingCart className="text-xl" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
          <span>Cart</span>
        </Link>

        {/* Wishlist */}
        <Link
          to="/favourites"
          className={`relative flex flex-col items-center text-xs mt-1 ${
            location.pathname === "/favourites"
              ? "text-cyan-500"
              : "text-gray-600 dark:text-gray-300 hover:text-cyan-500"
          }`}
        >
          <IoMdHeartEmpty className="text-xl" />
          {whisperCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">
              {whisperCount}
            </span>
          )}
          <span>Wishlist</span>
        </Link>

        {/* Profile/Login */}
        {user ? (
          <Link
            to="/dashboard"
            className={`flex flex-col items-center text-xs mt-1 ${
              location.pathname === "/dashboard"
                ? "text-cyan-500"
                : "text-gray-600 dark:text-gray-300 hover:text-cyan-500"
            }`}
          >
            <FaUser className="text-xl" />
            <span>Profile</span>
          </Link>
        ) : (
          <button
            onClick={handleLogin}
            className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-cyan-500 text-xs mt-1"
          >
            <FaUser className="text-xl" />
            <span>Login</span>
          </button>
        )}
      </div>
      {showTrackBox && trackingData && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-[320px] relative">
            <button
              onClick={() => setShowTrackBox(false)}
              className="absolute right-3 top-2 text-gray-400 hover:text-red-500"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold mb-2">📦 Order Tracking</h3>

            <p>
              <strong>ID:</strong> {trackingData._id}
            </p>
            <p>
              <strong>Name:</strong> {trackingData.fullName}
            </p>
            <p>
              <strong>Phone:</strong> {trackingData.phone}
            </p>
            <p>
              <strong>Payment:</strong> {trackingData.payment}
            </p>
            <p>
              <strong>Status:</strong>
              <span className="ml-1 text-cyan-600 font-semibold capitalize">
                {trackingData.status}
              </span>
            </p>
            <p>
              <strong>Total:</strong> ৳{trackingData.total}
            </p>

            <button
              onClick={() => setShowTrackBox(false)}
              className="mt-4 w-full bg-cyan-600 text-white py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
