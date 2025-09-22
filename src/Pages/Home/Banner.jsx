import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

export default function Banner() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);

  // Fetch active sliders from backend
  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const res = await axios.get("https://e-commerce-server-api.onrender.com/slider");
        const activeSlides = res.data.filter((s) => s.status === "active");
        setSlides(activeSlides);
      } catch (err) {
        console.error("Failed to fetch sliders:", err);
      }
    };
    fetchSliders();
  }, []);

  // Auto-slide
  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [slides]);

  useEffect(() => {
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });
  }, [slides]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  const goToSlide = (index) => setCurrent(index);

  if (slides.length === 0) return null;

  return (
    <div className="relative dark:bg-black w-full overflow-hidden pt-[100px]">
      <div className="max-w-7xl mx-auto overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.img
            key={slides[current]._id}
            src={slides[current].image}
            alt="Slider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="w-full h-auto object-contain rounded-xl"
          />
        </AnimatePresence>

        {/* Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 md:left-6 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 rounded-full z-20"
        >
          ◀
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 md:right-6 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 rounded-full z-20"
        >
          ▶
        </button>

        {/* Dots */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full ${
                index === current ? "bg-white" : "bg-white/50"
              }`}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
}
