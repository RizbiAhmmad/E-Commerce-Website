import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    id: 1,
    image: "https://mir-s3-cdn-cf.behance.net/project_modules/fs/3a5b4b130201639.617ac5e8008d9.jpg",
    title: "Empower Your Online Business",
    subtitle: "Professional E-commerce Solutions",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
    title: "Grow Your Brand Digitally",
    subtitle: "With cutting-edge tools and support",
  },
  {
    id: 3,
    image: "https://cdn.dribbble.com/userupload/43263235/file/original-7300dd46c40ef30d1e3a5d4ad2f49bf9.jpg?resize=752x&vertical=center",
    title: "Join the Digital Revolution",
    subtitle: "We make your idea a reality",
  },
];

export default function Banner() {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  const goToSlide = (index) => setCurrent(index);

  useEffect(() => {
    const interval = setInterval(nextSlide, 7000); // Auto-change every 7s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[70vh] md:h-[90vh] overflow-hidden">
      <AnimatePresence>
        <motion.div
          key={slides[current].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${slides[current].image})`,
          }}
        >
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white px-4">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              {slides[current].title}
            </h2>
            <p className="text-lg md:text-2xl mb-6">
              {slides[current].subtitle}
            </p>
            <button className="bg-white text-black font-semibold px-6 py-2 rounded-full hover:bg-gray-200 transition">
              Get Started
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 rounded-full"
      >
        ◀
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 rounded-full"
      >
        ▶
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
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
  );
}
