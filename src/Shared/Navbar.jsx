import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShoppingCart,
  FaSearch,
  FaUser,
  FaBars,
  FaTimes,
  FaChevronDown,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import ThemeChange from "@/components/ThemeChange";
import { AuthContext } from "@/provider/AuthProvider";
import axios from "axios";
import { IoIosArrowForward, IoMdHeartEmpty } from "react-icons/io";

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

  const navigate = useNavigate();

  // Fetch whisper count
  const fetchWhisperCount = () => {
    if (!user?.email) {
      setWhisperCount(0);
      return;
    }
    axios
      .get(
        `https://e-commerce-server-api.onrender.com/whisper?email=${user.email}`
      )
      .then((res) => setWhisperCount(res.data.length))
      .catch(() => setWhisperCount(0));
  };

  // Fetch cart count
  const fetchCartCount = () => {
    if (!user?.email) {
      setCartCount(0);
      return;
    }
    axios
      .get(
        `https://e-commerce-server-api.onrender.com/cart?email=${user.email}`
      )
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
      axios
        .get("https://e-commerce-server-api.onrender.com/products")
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
    axios
      .get(
        "https://e-commerce-server-api.onrender.com/categories-with-subcategories"
      )
      .then((res) => setMenuData(res.data))
      .catch(() => setMenuData([]));
  }, []);

  // Footer info (logo, name)
  useEffect(() => {
    axios
      .get("https://e-commerce-server-api.onrender.com/footer")
      .then((res) => {
        if (res.data.length > 0) setFooterInfo(res.data[0]);
      })
      .catch(() => setFooterInfo(null));
  }, []);

  return (
    <nav className="bg-white dark:bg-black text-black dark:text-white border-b dark:border-gray-700 fixed w-full z-50 px-4 md:px-8 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-3">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="leading-tight text-lg md:text-2xl items-center flex gap-2 font-bold text-cyan-500 dark:text-cyan-300"
        >
          {footerInfo?.logo && (
            <img
              src={footerInfo.logo}
              alt="Logo"
              className="w-12 h-12 rounded-full"
            />
          )}

          <Link to="/">{footerInfo?.name}</Link>
        </motion.div>

        {/* Desktop Search + Categories */}
        <div className="hidden md:flex items-center w-1/2 relative gap-4">
          {/* <div className="flex items-center gap-4 ">
            <Link
              to="/"
              className="text-black dark:text-gray-200 hover:text-cyan-500 text-xl "
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-black dark:text-gray-200 hover:text-cyan-500 text-xl "
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-black dark:text-gray-200 hover:text-cyan-500 text-xl "
            >
              Contact
            </Link>
          </div> */}

          {/* Categories */}
          <div className="relative">
            <button
              onClick={() => setOpenCategory(openCategory ? null : "show")}
              className="flex items-center text-xl gap-1 text-black dark:text-gray-200 hover:text-cyan-500"
            >
              Categories <FaChevronDown className="text-sm mt-0.5" />
            </button>

            {openCategory && (
              <div
                className="absolute left-0 top-full mt-2 bg-white dark:bg-gray-900 border rounded-md shadow-md w-56 z-50"
                onMouseLeave={() => setOpenCategory(null)}
              >
                {menuData.map((cat) => (
                  <div key={cat._id} className="relative">
                    <div
                      onMouseEnter={() => setOpenCategory(cat._id)}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center"
                    >
                      {cat.name} <IoIosArrowForward className="text-xs" />
                    </div>
                    {openCategory === cat._id &&
                      cat.subcategories.length > 0 && (
                        <div className="absolute top-0 left-full bg-white dark:bg-gray-900 shadow-lg border rounded-md mt-0 p-4 grid grid-cols-1 gap-2 z-50 w-48">
                          {cat.subcategories.map((sub) => (
                            <div
                              key={sub._id}
                              className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded"
                              onClick={() => {
                                navigate(`/subcategory/${sub._id}`);
                                setOpenCategory(null);
                              }}
                            >
                              {sub.name}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="flex items-center w-full relative">
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

          {/* Cart */}
          <Link to="/cart" className="hover:text-cyan-500 relative">
            <FaShoppingCart />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Favourites */}
          <Link to="/favourites" className="hover:text-cyan-500 relative">
            <IoMdHeartEmpty />
            {whisperCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">
                {whisperCount}
              </span>
            )}
          </Link>

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

              {/* Theme Toggle */}
              {/* <div className="mt-3">
          <ThemeChange />
        </div> */}

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
    </nav>
  );
};

export default Navbar;
