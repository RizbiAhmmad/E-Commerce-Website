import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "@/Hooks/useAxiosPublic";
import { motion } from "framer-motion";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const LandingPage = () => {
  const { id } = useParams();
  const axiosPublic = useAxiosPublic();
  const [footerInfo, setFooterInfo] = useState({});

  useEffect(() => {
    const fetchFooterInfo = async () => {
      try {
        const res = await axiosPublic.get("/footer");
        setFooterInfo(res.data?.[0] || {});
      } catch (err) {
        console.error("❌ Footer Info Fetch Error:", err.message);
      }
    };
    fetchFooterInfo();
  }, []);

  const { data: page, isLoading } = useQuery({
    queryKey: ["landingPage", id],
    queryFn: async () => {
      const res = await axiosPublic.get(`/landing-pages/${id}`);
      return res.data;
    },
  });

  if (isLoading) return <p className="text-center py-10">Loading...</p>;
  if (!page) return <p className="text-center py-10">Page not found</p>;

  const getEmbedUrl = (url) => {
    if (!url) return "";

    if (url.includes("youtube") || url.includes("youtu.be")) {
      if (url.includes("youtu.be")) {
        const id = url.split("youtu.be/")[1].split("?")[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      return url.replace("watch?v=", "embed/");
    }

    if (url.includes("facebook.com")) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        url
      )}&show_text=0&width=560&height=315`;
    }

    return url;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-16">
      {/* Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="text-center"
      >
        {footerInfo.logo && (
          <img
            src={footerInfo.logo}
            alt="Company Logo"
            className="w-24 h-24 mx-auto mb-4 rounded-full shadow-lg"
          />
        )}

        <h1 className="text-3xl font-extrabold">{page.campaignTitle}</h1>

        {page.campaignShortDescription && (
          <p className="text-gray-600 mt-3 text-lg max-w-xl mx-auto">
            {page.campaignShortDescription}
          </p>
        )}
      </motion.div>

      {/* Banner */}
      {page.bannerImage && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="overflow-hidden rounded-xl shadow-xl"
        >
          <motion.img
            src={page.bannerImage}
            alt={page.campaignTitle}
            className="w-full object-cover rounded-xl"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2 }}
          />
        </motion.div>
      )}

      {/* Gallery */}
      {page.galleryImages?.length > 0 && (
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold">{page.galleryHeading}</h2>
            <p className="text-gray-600 mt-2">{page.galleryDescription}</p>
          </div>

          <Slider
            dots={true}
            infinite={true}
            speed={1000}
            autoplay={true}
            autoplaySpeed={2000} // 2 seconds
            slidesToShow={3}
            slidesToScroll={1}
            responsive={[
              {
                breakpoint: 1024,
                settings: { slidesToShow: 2 },
              },
              {
                breakpoint: 768,
                settings: { slidesToShow: 1 },
              },
            ]}
          >
            {page.galleryImages.map((img, i) => (
              <div key={i} className="px-2">
                <motion.img
                  src={img}
                  alt={`gallery-${i}`}
                  whileHover={{ scale: 1.05 }}
                  className="w-full aspect-ratio object-cover rounded-lg shadow-md"
                />
              </div>
            ))}
          </Slider>
        </motion.div>
      )}

      {/* About + Video Side by Side with Centered Heading */}
      {(page.aboutHeading || page.videoUrl) && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="max-w-6xl mx-auto flex flex-col items-center gap-8"
        >
          {/* Heading */}
          {page.aboutHeading && (
            <h2 className="text-3xl font-bold text-center mb-6">
              {page.aboutHeading}
            </h2>
          )}

          {/* Content: Description + Video Side by Side */}
          <div className="flex flex-col md:flex-row items-center gap-8 w-full">
            {/* About / Description */}
            {page.aboutDescription && (
              <div className="md:w-1/2 text-center md:text-left">
                <p className="text-gray-700 leading-relaxed">
                  {page.aboutDescription}
                </p>
              </div>
            )}

            {/* Video */}
            {page.videoUrl && (
              <div className="md:w-1/2 w-full">
                <motion.div
                  className="w-full aspect-video rounded-xl overflow-hidden shadow-xl"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7 }}
                >
                  <iframe
                    src={getEmbedUrl(page.videoUrl)}
                    className="w-full h-full"
                    allowFullScreen
                  ></iframe>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Reviews */}
      {page.reviewImages?.length > 0 && (
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <h2 className="text-3xl font-bold mb-6 text-center">Reviews</h2>

          <Slider
            dots={true}
            infinite={true}
            speed={1000}
            autoplay={true}
            autoplaySpeed={2000} // 2 seconds
            slidesToShow={3}
            slidesToScroll={1}
            responsive={[
              {
                breakpoint: 1024,
                settings: { slidesToShow: 2 },
              },
              {
                breakpoint: 768,
                settings: { slidesToShow: 1 },
              },
            ]}
          >
            {page.reviewImages.map((img, i) => (
              <div key={i} className="px-2">
                {" "}
                {/* spacing */}
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="rounded-lg overflow-hidden shadow-lg"
                >
                  <img
                    src={img}
                    alt="review"
                    className="w-full aspect-ratio object-cover rounded-lg"
                  />
                </motion.div>
              </div>
            ))}
          </Slider>
        </motion.div>
      )}

      {page.regularPrice && page.offerPrice && (
        <section className="bg-white py-12 px-4">
          <div className="max-w-3xl mx-auto text-center relative">
            {/* Old Price with Animated Cross */}
            <motion.p
              className="text-lg md:text-3xl text-gray-700 relative inline-block"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              পূর্বের মূল্য{" "}
              <span className="relative inline-block text-red-600 font-bold">
                {page.regularPrice}/-
                {/* Moving Cross Animation */}
                <motion.svg
                  viewBox="0 0 120 40"
                  className="absolute -top-1 left-0 w-full h-full text-red-600"
                >
                  <motion.line
                    x1="0"
                    y1="0"
                    x2="120"
                    y2="40"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 1,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  />

                  <motion.line
                    x1="0"
                    y1="40"
                    x2="120"
                    y2="0"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 1,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  />
                </motion.svg>
              </span>{" "}
              টাকা,
            </motion.p>

            {/* New Price Animated */}
            <motion.h2
              className="text-3xl md:text-4xl font-extrabold text-red-500 mt-6 relative inline-block"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              আজকের অফার মূল্য{" "}
              <span className="relative inline-block">
                {/* Pulsing Offer Price */}
                <motion.span
                  className="text-green-600 text-4xl md:text-5xl font-extrabold relative z-10"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  {page.offerPrice}/-
                </motion.span>

                {/* Red Circle Highlight */}
                <motion.svg
                  viewBox="0 0 200 100"
                  className="absolute -top-8 -left-8 w-32 md:w-40 h-28 text-red-500"
                >
                  <motion.ellipse
                    cx="100"
                    cy="50"
                    rx="90"
                    ry="40"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 1.5,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  />
                </motion.svg>
              </span>{" "}
              টাকা
            </motion.h2>

            {/* Sub Text */}
            <motion.p
              className="text-xl my-6 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <span className="text-red-500 font-bold">অফারটি নিতে</span>{" "}
              <span className="text-green-600 font-bold">
                “{page.orderButtonText || "অর্ডার করতে চাই"}”
              </span>{" "}
              বাটনে ক্লিক করুন
            </motion.p>

            {/* Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-2 inline-flex items-center gap-2 bg-[#E00000] hover:bg-[#CB3300] text-white font-extrabold px-10 py-4 rounded-lg shadow-lg border-4 border-[#BD8B44]"
            >
              {page.orderButtonText}
            </motion.button>
          </div>
        </section>
      )}

      {/* Video */}
      {page.videoUrl && (
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <h2 className="text-3xl font-bold text-center mb-4">Video</h2>

          <motion.div
            className="w-full aspect-video rounded-xl overflow-hidden shadow-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          >
            <iframe
              src={getEmbedUrl(page.videoUrl)}
              className="w-full h-full"
              allowFullScreen
            ></iframe>
          </motion.div>
        </motion.div>
      )}

      {/* Description */}
      {page.descriptionTitle && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold">{page.descriptionTitle}</h2>
          <p className="text-gray-700 mt-3">{page.description}</p>
        </motion.div>
      )}

      {/* Order Form */}
      {page.orderFormHeading && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-10 p-6 border rounded-xl bg-cyan-50 text-center shadow-md"
        >
          <h2 className="text-3xl font-bold">{page.orderFormHeading}</h2>

          {page.orderButtonText && (
            <button className="mt-4 px-8 py-3 bg-cyan-500 text-white text-lg rounded-lg hover:bg-cyan-600 transition">
              {page.orderButtonText}
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default LandingPage;
