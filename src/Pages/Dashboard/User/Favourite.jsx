import { useEffect, useState, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { AuthContext } from "@/provider/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import { FaTrashAlt, FaStar } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { GrView } from "react-icons/gr";
import { motion } from "framer-motion";
import Loading from "@/Shared/Loading";

const Favourite = () => {
  const { user } = useContext(AuthContext);
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch favourites
  const fetchFavourites = () => {
    if (!user?.email) {
      setFavourites([]);
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:5000/whisper?email=${user.email}`)
      .then((res) => {
        setFavourites(res.data);
        setLoading(false);
      })
      .catch(() => {
        setFavourites([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFavourites();
  }, [user]);

  // Delete favourite
  const handleDelete = (id) => {
    Swal.fire({
      title: "Remove from Favourites?",
      text: "This product will be removed from your favourites list.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0FABCA",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Remove it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:5000/whisper/${id}`)
          .then((res) => {
            if (res.data.deletedCount > 0) {
              Swal.fire("Removed!", "Item removed successfully.", "success");
              fetchFavourites();
              window.dispatchEvent(new Event("whisperUpdated"));
            }
          })
          .catch(() => {
            Swal.fire("Error!", "Failed to remove favourite.", "error");
          });
      }
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
        ❤️ My Favourites
      </h2>

      {favourites.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">
          No favourites yet.{" "}
          <Link to="/" className="text-cyan-500 font-semibold hover:underline">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favourites.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{
                scale: 1.03,
                y: -5,
                boxShadow: "0px 8px 20px rgba(0,0,0,0.15)",
              }}
              className="border border-gray-300 dark:border-gray-700 rounded-xl p-2 shadow-lg bg-white dark:bg-gray-900 cursor-pointer hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div
                className="relative overflow-hidden rounded-md"
                onClick={() => navigate(`/product/${item.productId}`)}
              >
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  alt={item.productName}
                  src={item.productImage || "https://via.placeholder.com/400"}
                  className="w-full aspect-square object-cover rounded-md"
                />
              </div>

              {/* Content */}
              <div className="mt-2 p-1 flex flex-col">
                <h3 className="text-lg font-medium line-clamp-1">
                  {item.productName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.brandName || "Unknown Brand"}
                </p>
                <p className="text-cyan-600 font-bold mt-1">
                  ৳ {item.price || "N/A"}
                </p>

                {/* Buttons */}
                <div className="flex justify-between items-center mt-3">
                     <button
                    onClick={() => navigate(`/product/${item.productId}`)}
                    className="flex items-center gap-1 px-3 py-1 border border-cyan-500 text-cyan-500 text-sm rounded-md hover:bg-cyan-500 hover:text-white transition"
                  >
                    <GrView /> View
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition"
                  >
                    <FaTrashAlt /> Remove
                  </button>

                 
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favourite;
