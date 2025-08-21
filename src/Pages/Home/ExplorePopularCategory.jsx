import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import Loading from "@/Shared/Loading";
import { useNavigate } from "react-router-dom";

const ExplorePopularCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/categories");
        // ✅ Only active categories
        setCategories(res.data.filter((cat) => cat.status === "active"));
      } catch (err) {
        console.error("❌ Error fetching categories:", err);
        Swal.fire("Error", "Could not load categories", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="mt-8 text-center">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        className="text-4xl font-extrabold text-transparent bg-clip-text bg-cyan-500 text-center my-8 select-none drop-shadow-lg"
      >
        Explore Popular Categories
      </motion.h1>

      <p className="text-gray-600 mb-4">
        Find your preferred item in the highlighted product selection.
      </p>

      <div className="flex flex-wrap justify-center gap-6">
        {categories.map((cat) => (
          <motion.div
            key={cat._id}
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(`/category/${cat._id}`)}
            className="text-center cursor-pointer"
          >
            <div className="w-28 h-28 mx-auto rounded-xl overflow-hidden border shadow">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="mt-2 font-semibold uppercase">{cat.name}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ExplorePopularCategory;
