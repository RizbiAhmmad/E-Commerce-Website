import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";

const OfferPage = () => {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await axios.get("https://api.sports.bangladeshiit.com/offers");
        setOffers(res.data.filter((o) => o.status === "active").slice(0, 2)); // only 2
      } catch (err) {
        console.error(err);
      }
    };
    fetchOffers();
  }, []);

  if (offers.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        className="text-3xl font-extrabold text-transparent bg-clip-text bg-cyan-500 text-center my-8 select-none drop-shadow-lg"
      >
        <Typewriter
          words={["Special Offers Just for You!"]}
          loop={0}
          cursor
          cursorStyle="|"
          typeSpeed={70}
          deleteSpeed={50}
          delaySpeed={2000}
        />
      </motion.h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offers.map((offer) => (
          <div key={offer._id} className="rounded-xl overflow-hidden shadow-lg">
            <img
              src={offer.image}
              alt="Offer"
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OfferPage;
