import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    id: 1,
    image: "https://static.vecteezy.com/system/resources/thumbnails/049/855/785/small_2x/nature-background-high-resolution-wallpaper-for-a-serene-and-stunning-view-free-photo.jpg",
    title: "Empower Your Online Business",
    subtitle: "Professional E-commerce Solutions",
  },
  {
    id: 2,
    image: "https://png.pngtree.com/thumb_back/fh260/background/20241225/pngtree-download-the-above-beautiful-nature-norway-natural-landscape-background-image-and-image_16870161.jpg",
    title: "Grow Your Brand Digitally",
    subtitle: "With cutting-edge tools and support",
  },
  {
    id: 3,
    image: "https://img.freepik.com/free-photo/beautiful-winter-landscape_23-2151901463.jpg?semt=ais_hybrid&w=740",
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
    <div className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden">
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
