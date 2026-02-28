import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { FaRegSmile } from "react-icons/fa";

const NoticePopup = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const alreadyShown = localStorage.getItem("noticeShown");

    if (!alreadyShown) {
      setTimeout(() => {
        setShow(true);
        localStorage.setItem("noticeShown", "true");
      }, 5000);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      
      {/* Card */}
      <div className="relative w-[92%] md:w-[420px] rounded-2xl overflow-hidden shadow-2xl">

        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0FABCA] via-cyan-400 to-blue-500 animate-pulse opacity-90"></div>

        {/* Glass Content */}
        <div className="relative bg-white/10 backdrop-blur-xl p-8 text-white rounded-2xl border border-white/20">

          {/* Close Button */}
          <button
            onClick={() => setShow(false)}
            className="absolute top-4 right-4 text-white hover:text-red-300 transition"
          >
            <FiX size={22} />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-4 rounded-full shadow-lg">
              <FaRegSmile size={30} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-3">
            🎉 Special Offer!
          </h2>

          {/* Description */}
          <p className="text-center text-sm md:text-base mb-6 text-white/90">
            Welcome to our store! Enjoy <span className="font-semibold">10% OFF</span> 
            on your first order. Limited time only!
          </p>

          {/* Button */}
          <button
            onClick={() => setShow(false)}
            className="w-full bg-white text-[#0FABCA] font-semibold py-3 rounded-xl hover:scale-105 transition-transform duration-300 shadow-lg"
          >
            Shop Now
          </button>

        </div>
      </div>
    </div>
  );
};

export default NoticePopup;