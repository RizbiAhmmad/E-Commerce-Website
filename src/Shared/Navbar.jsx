import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShoppingCart,
  FaSearch,
  FaUser,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import ThemeChange from "@/components/ThemeChange";
import logo from "../assets/SostayKini.jpg";
import { AuthContext } from "@/provider/AuthProvider";
import axios from "axios";

const Navbar = () => {
  const { user, logOut } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  // Function to fetch cart count from backend
  const fetchCartCount = () => {
    if (!user?.email) {
      setCartCount(0);
      return;
    }
    axios
      .get(`http://localhost:5000/cart?email=${user.email}`)
      .then((res) => {
        const totalCount = res.data.reduce(
          (acc, item) => acc + (item.quantity || 1),
          0
        );
        setCartCount(totalCount);
      })
      .catch(() => {
        setCartCount(0);
      });
  };

  useEffect(() => {
    fetchCartCount();

    // Listen for cart update event
    const onCartUpdated = () => {
      fetchCartCount();
    };

    window.addEventListener("cartUpdated", onCartUpdated);

    return () => {
      window.removeEventListener("cartUpdated", onCartUpdated);
    };
  }, [user]);

  const handleSearch = () => {
    if (searchText.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchText.trim())}`);
      setIsOpen(false);
    }
  };

  const handleLogin = () => {
    navigate("/login");
    setIsOpen(false);
  };

  const handleLogOut = () => {
    logOut().catch((error) => console.log(error));
  };

  return (
    <nav className="bg-white dark:bg-black text-black dark:text-white border-b dark:border-gray-700 fixed w-full z-50 px-4 md:px-8 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-3">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl flex gap-2 font-bold text-cyan-500 dark:text-cyan-300"
        >
          <img src={logo} alt="Logo" className="w-10 h-10 mr-2 rounded-full" />
          <Link to="/">Sostay Kini</Link>
        </motion.div>

        {/* Desktop Search */}
        <div className="hidden md:flex items-center w-1/2">
          <input
            type="text"
            placeholder="Search products..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="rounded-l-md px-4 py-2 w-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="rounded-r-md px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            <FaSearch />
          </button>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-4 text-xl relative">
          <ThemeChange />
          <Link to="/cart" className="hover:text-cyan-500 relative">
            <FaShoppingCart />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          {user && (
            <Link to="/dashboard" className="hidden md:block hover:text-cyan-500">
              Dashboard
            </Link>
          )}

          {user ? (
            <button
              onClick={handleLogOut}
              className="text-sm border border-gray-300 bg-red-500 dark:border-gray-600 px-3 py-2 rounded-md text-white hover:bg-red-600 dark:hover:bg-red-600 flex items-center"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="text-sm border border-gray-300 bg-cyan-500 dark:border-gray-600 px-3 py-2 rounded-md text-white hover:bg-cyan-600 dark:hover:bg-cyan-600 flex items-center"
            >
              <FaUser className="mr-1" /> Login
            </button>
          )}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-2xl">
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden md:hidden bg-gray-100 dark:bg-gray-900 text-black dark:text-white border-t border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-col px-4 py-4 space-y-3">
              <Link to="/" onClick={() => setIsOpen(false)} className="hover:text-cyan-500">
                Home
              </Link>
              <Link to="/shop" onClick={() => setIsOpen(false)} className="hover:text-cyan-500">
                Shop
              </Link>
              <Link to="/about" onClick={() => setIsOpen(false)} className="hover:text-cyan-500">
                About
              </Link>
              <Link to="/contact" onClick={() => setIsOpen(false)} className="hover:text-cyan-500">
                Contact
              </Link>
              {user && (
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="hover:text-cyan-500">
                  Dashboard
                </Link>
              )}

              {/* Mobile Search */}
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="rounded-l-md px-4 py-2 w-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 focus:outline-none"
                />
                <button
                  onClick={handleSearch}
                  className="rounded-r-md px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  <FaSearch />
                </button>
              </div>

              {/* Mobile Login Button */}
              <button
                onClick={handleLogin}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-md flex items-center justify-center"
              >
                <FaUser className="mr-2" /> Login
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
