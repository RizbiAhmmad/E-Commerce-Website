import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import Loading from "@/Shared/Loading";
import { useNavigate } from "react-router-dom";
import { Typewriter } from "react-simple-typewriter";

// Swiper import
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const ExplorePopularCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("https://e-commerce-server-api.onrender.com/categories");
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
    <div className="py-8 max-w-7xl mx-auto text-center dark:bg-black dark:text-white">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        className="text-3xl font-extrabold text-transparent bg-clip-text bg-cyan-500 text-center my-6 select-none drop-shadow-lg"
      >
        <Typewriter
          words={["Explore Categories"]}
          loop={0}
          cursor
          cursorStyle="|"
          typeSpeed={70}
          deleteSpeed={50}
          delaySpeed={2000}
        />
      </motion.h1>

      <p className="text-gray-500 dark:text-gray-100 mb-6">
        Find your preferred item in the highlighted product selection.
      </p>

      {/* Swiper Carousel */}
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={2}
        slidesPerView={6}
        navigation
        autoplay={{ delay: 2500, disableOnInteraction: false }}
        breakpoints={{
          320: { slidesPerView: 2 },
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 6 },
        }}
      >
        {categories.map((cat) => (
          <SwiperSlide key={cat._id}>
            <motion.div
              
              onClick={() => navigate(`/category/${cat._id}`)}
              className="text-center cursor-pointer"
            >
              <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border shadow-xl">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="mt-2 font-medium leading-tight line-clamp-2 uppercase">{cat.name}</p>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ExplorePopularCategory;
