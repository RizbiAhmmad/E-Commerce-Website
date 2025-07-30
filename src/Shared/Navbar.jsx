import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaShoppingCart, FaSearch, FaUser, FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import ThemeChange from "@/components/ThemeChange";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

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

  return (
    <nav className="bg-background  text-foreground border-b border-border fixed w-full z-50 px-4 md:px-8 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-primary"
        >
          <Link to="/">EasyShop</Link>
        </motion.div>

        {/* Desktop Search */}
        <div className="hidden md:flex items-center w-1/2">
          <input
            type="text"
            placeholder="Search products..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="rounded-l-md px-4 py-2 w-full bg-muted text-foreground placeholder-muted-foreground border border-border focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="rounded-r-md px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <FaSearch />
          </button>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-4 text-xl">
            <ThemeChange />
          <Link to="/cart" className="text-foreground hover:text-primary">
            <FaShoppingCart />
          </Link>
          <Button
            onClick={handleLogin}
            className="text-sm border border-border px-3 py-1 rounded-md text-primary hover:bg-accent flex items-center"
          >
            <FaUser className="mr-1" /> Login
          </Button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-2xl text-foreground"
          >
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
            className="overflow-hidden md:hidden bg-muted text-muted-foreground border-t border-border"
          >
            <div className="flex flex-col px-4 py-4 space-y-3">
              <Link to="/" onClick={() => setIsOpen(false)} className="hover:text-primary">Home</Link>
              <Link to="/shop" onClick={() => setIsOpen(false)} className="hover:text-primary">Shop</Link>
              <Link to="/about" onClick={() => setIsOpen(false)} className="hover:text-primary">About</Link>
              <Link to="/contact" onClick={() => setIsOpen(false)} className="hover:text-primary">Contact</Link>

              {/* Mobile Search */}
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="rounded-l-md px-4 py-2 w-full bg-muted text-foreground placeholder-muted-foreground border border-border focus:outline-none"
                />
                <button
                  onClick={handleSearch}
                  className="rounded-r-md px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <FaSearch />
                </button>
              </div>

              {/* Mobile Login Button */}
              <button
                onClick={handleLogin}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-md flex items-center justify-center"
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
