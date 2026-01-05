import { useEffect, useState, useContext } from "react";
import Swal from "sweetalert2";
import { AuthContext } from "@/provider/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";
import { GrView } from "react-icons/gr";
import { motion } from "framer-motion";
import Loading from "@/Shared/Loading";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const Favourite = () => {
  const { user } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchFavourites = () => {
    if (!user?.email) {
      return;
    }

    setLoading(true);
    axiosPublic
      .get(`/whisper?email=${user.email}`)
      .then(async (res) => {
        const items = res.data;

        const productResults = await Promise.allSettled(
          items.map((item) =>
            axiosPublic.get(`/products/${item.productId}`)
          )
        );

        const validProductIds = new Set();

        productResults.forEach((result) => {
          if (result.status === "fulfilled") {
            validProductIds.add(result.value.data._id);
          }
        });

        const validFavourites = items.filter((item) =>
          validProductIds.has(item.productId)
        );

        setFavourites(validFavourites);
      })
      .catch(() => {
        setFavourites([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (user?.email) {
      fetchFavourites();
    }
  }, [user?.email]);

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
        axiosPublic
          .delete(`/whisper/${id}`)
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

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-white dark:bg-black px-4 py-22">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
        ❤️ My Favourites
      </h2>

      {favourites.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-300 text-lg">
          No favourites yet.{" "}
          <Link to="/" className="text-cyan-500 font-semibold hover:underline">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {favourites.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.1, delay: index * 0.03 }}
              whileHover={{
                scale: 1.03,
                y: -5,
                boxShadow: "0px 12px 24px rgba(0,0,0,0.15)",
              }}
              className="border border-gray-300 dark:border-gray-700 rounded-xl p-2 shadow-md bg-white dark:bg-black cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col"
            >
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

              <div className="mt-3 flex flex-col flex-1">
                <h3 className="text-lg font-semibold line-clamp-1 text-gray-800 dark:text-white">
                  {item.productName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {item.brandName || "Unknown Brand"}
                </p>
                <p className="text-cyan-600 font-bold mt-2 text-base">
                  ৳ {item.price || "N/A"}
                </p>

                <div className="mt-auto p-2 flex justify-between items-center gap-2 flex-wrap">
                  <button
                    onClick={() => navigate(`/product/${item.productId}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-cyan-500 text-cyan-500 text-sm rounded-md hover:bg-cyan-500 hover:text-white transition"
                  >
                    <GrView /> View
                  </button>

                  <button
                    onClick={() => handleDelete(item._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition"
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
