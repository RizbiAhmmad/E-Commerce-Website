import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "@/Hooks/useAxiosPublic";
import { motion } from "framer-motion";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Swal from "sweetalert2";
import Loading from "@/Shared/Loading";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const LandingPage = () => {
  const { id } = useParams();
  const axiosPublic = useAxiosPublic();
  const [footerInfo, setFooterInfo] = useState({});
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [shipping, setShipping] = useState(60);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [district, setDistrict] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [shippingRates, setShippingRates] = useState({
    insideDhaka: 0,
    outsideDhaka: 0,
  });
  useEffect(() => {
    const fetchShipping = async () => {
      try {
        const res = await axiosPublic.get("/shipping");
        setShippingRates(res.data);

        setShipping(res.data.insideDhaka);
      } catch (err) {
        console.error("Shipping fetch error", err);
      }
    };
    fetchShipping();
  }, []);

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

  useEffect(() => {
    let sessionId = localStorage.getItem("landingSessionId");
    if (!sessionId) {
      sessionId = "landing_" + Date.now();
      localStorage.setItem("landingSessionId", sessionId);
    }
  }, []);

  useEffect(() => {
    const sessionId = localStorage.getItem("landingSessionId");
    if (!sessionId) return;

    const timeout = setTimeout(() => {
      if (!name && !phone && !address && !district) return; // skip empty

      const incompleteOrder = {
        sessionId,
        fullName: name,
        phone,
        email,
        district,
        address,
        shipping: shipping === shippingRates.insideDhaka ? "inside" : "outside",
        payment: paymentMethod === "cod" ? "cash on delivery" : "online",
        cartItems: [
          {
            productId: product?._id,
            productName: product?.name,
            barcode: product?.barcode || 0,
            productImage: product?.images?.[0] || "",
            price: product?.newPrice,
            purchasePrice: product?.purchasePrice || 0,
            color: selectedColor || "-",
            size: selectedSize || "-",
            quantity,
            freeShipping: product?.freeShipping || false,
          },
        ],
        subtotal: product?.newPrice * quantity,
        shippingCost: product?.freeShipping ? 0 : Number(shipping),
        discount: 0,
        total:
          product?.newPrice * quantity +
          (product?.freeShipping ? 0 : Number(shipping)),
      };

      axiosPublic.post("/incomplete-orders", incompleteOrder);
    }, 2000); // delay 2s

    return () => clearTimeout(timeout);
  }, [
    name,
    phone,
    email,
    district,
    address,
    selectedSize,
    selectedColor,
    quantity,
    shipping,
  ]);

  const { data: page, isLoading } = useQuery({
    queryKey: ["landingPage", id],
    queryFn: async () => {
      const res = await axiosPublic.get(`/landing-pages/${id}`);
      return res.data;
    },
  });

  const { data: product } = useQuery({
    queryKey: ["landingProduct", page?.productId],
    enabled: !!page?.productId,
    queryFn: async () => {
      const res = await axiosPublic.get(`/products/${page.productId}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (product) {
      if (product.sizes?.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
      if (product.colors?.length > 0) {
        setSelectedColor(product.colors[0]);
      }
    }
  }, [product]);

  if (isLoading) return <Loading></Loading>;
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

  const handleOrderSubmit = async () => {
    if (!name || !phone || !address || !district) {
      return Swal.fire("Error!", "Please fill all required fields", "error");
    }

    if (!/^01\d{9}$/.test(phone)) {
      return Swal.fire(
        "Invalid Phone",
        "Please enter a valid 11-digit BD phone number starting with 01",
        "error"
      );
    }

    const productData = {
      productId: product?._id,
      productName: product?.name,
      barcode: product?.barcode || 0,
      productImage: product?.images?.[0] || "",
      price: product?.newPrice,
      purchasePrice: product?.purchasePrice || 0,
      color: selectedColor || "-",
      size: selectedSize || "-",
      quantity: quantity,
      freeShipping: product?.freeShipping || false,
    };

    const subtotal = product?.newPrice * quantity;
    const shippingCost = product?.freeShipping ? 0 : Number(shipping);
    const total = subtotal + shippingCost;

    const orderData = {
      fullName: name,
      phone,
      email: email || "N/A",
      district,
      address,
      shipping: shipping === shippingRates.insideDhaka ? "inside" : "outside",
      payment: paymentMethod === "cod" ? "cash on delivery" : "online",
      cartItems: [productData],
      subtotal,
      shippingCost,
      discount: 0,
      total,
      coupon: null,
      status: paymentMethod === "cod" ? "pending" : "initiated",
      tran_id: `order_${Date.now()}`,
      createdAt: new Date(),
      orderType: "Online",
    };

    try {
      const res = await axiosPublic.post("/orders", orderData);
      const orderId = res.data.insertedId; // Assuming your backend returns insertedId
      localStorage.setItem("pendingOrderId", orderId);

      const savedOrder = { ...orderData, _id: orderId };

      if (paymentMethod === "online") {
        const { data } = await axiosPublic.post("/sslcommerz/init", {
          tran_id: orderData.tran_id,
          orderId,
          totalAmount: total,
          fullName: name,
          email: email || "N/A",
          phone,
          address,
          cartItems: [productData],
        });

        if (data?.GatewayPageURL) {
          window.location.href = data.GatewayPageURL;
        } else {
          Swal.fire("Error", "Payment init failed", "error");
        }
        return;
      }

      Swal.fire("Success!", "Order placed successfully", "success").then(() => {
        navigate("/myorder", { state: { orderData: savedOrder } });
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error!", "Something went wrong", "error");
    }
  };

  const handleScroll = () => {
    const section = document.getElementById("checkout");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
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
            className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 rounded-full shadow-lg"
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
              <div className="md:w-1/2 text-center text-xl md:text-left">
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

      {/* Description */}
      {page.descriptionTitle && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto text-center py-10"
        >
          <h2 className="text-4xl font-extrabold text-gray-800 mb-6 relative inline-block">
            {page.descriptionTitle}
            <span className="block w-20 h-1 bg-cyan-500 mx-auto mt-2 rounded-full"></span>
          </h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white shadow-xl border border-gray-200 rounded-2xl p-6 md:p-10 leading-relaxed text-gray-700 text-lg md:text-xl"
          >
            <p className="whitespace-pre-line">{page.description}</p>
          </motion.div>
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
                {product?.oldPrice}/-
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
                  {product?.newPrice}/-
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
              onClick={handleScroll}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-2 inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold px-10 py-4 rounded-lg shadow-lg border-2 border-white"
            >
              {page.orderButtonText}
            </motion.button>
          </div>
        </section>
      )}

      {/* Reviews */}
      {page.reviewImages?.length > 0 && (
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <h2 className="text-3xl font-bold mb-6 text-center">
            {page.reviewHeading}
          </h2>

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

      {/* Order Form */}
      {page.orderFormHeading && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          id="checkout"
          className="mt-10 p-6 border rounded-xl bg-cyan-50 text-center shadow-md"
        >
          <h2 className="text-3xl font-bold">{page.orderFormHeading}</h2>

          {/* Product Summary Under Order Form Heading */}
          {product && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* LEFT SIDE — Product Info + Options + Summary */}
              <div className="bg-white p-6 rounded-xl shadow-lg border space-y-6">
                {/* PRODUCT HEADER */}
                <div className="flex items-start gap-4">
                  <img
                    src={product?.images?.[0]}
                    alt={product.name}
                    className="w-28 h-28 md:w-40 md:h-40 rounded-xl object-cover shadow"
                  />

                  <div className="space-y-1">
                    <h2 className="text-xl font-bold leading-6">
                      {product.name}
                    </h2>
                    <p className="text-gray-600 font-semibold">
                      Price: ৳{product.newPrice}
                    </p>
                  </div>
                </div>

                {/* OPTIONS ROW */}
                <div className="flex flex-col gap-6">
                  {/* SIZE SELECTOR */}
                  {product.sizes?.length > 0 && (
                    <div>
                      <span className="font-semibold block mb-2">
                        Select Size:
                      </span>

                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-2 min-w-[70px] text-center border rounded-lg transition 
                ${
                  selectedSize === size
                    ? "bg-cyan-500 text-white border-cyan-500"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* COLOR SELECTOR */}
                  {product.colors?.length > 0 && (
                    <div>
                      <span className="font-semibold block mb-2">
                        Select Color:
                      </span>

                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`px-4 py-2 min-w-[70px] text-center border rounded-lg transition
                ${
                  selectedColor === color
                    ? "bg-cyan-500 text-white border-cyan-500"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* QUANTITY SELECTOR */}
                  <div>
                    <span className="font-semibold block mb-2">Quantity:</span>

                    <div className="flex items-center w-fit border rounded-lg overflow-hidden">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 font-semibold"
                      >
                        -
                      </button>

                      <input
                        type="text"
                        value={quantity}
                        readOnly
                        className="w-14 text-center border-l border-r py-2"
                      />

                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 font-semibold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* ORDER SUMMARY */}
                <div className="bg-white p-5 rounded-xl shadow-lg border mt-2">
                  <h3 className="font-bold text-lg mb-4">Order Summary</h3>

                  <div className="flex justify-between mb-2">
                    <span>Product Price</span>
                    <span>৳{product?.newPrice * quantity}</span>
                  </div>

                  <div className="flex justify-between mb-2">
                    <span>Shipping</span>
                    <span>
                      ৳{product?.freeShipping === true ? 0 : shipping}
                    </span>
                  </div>
                  <hr className="my-3" />

                  <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span>
                      ৳
                      {product?.newPrice * quantity +
                        (product?.freeShipping === true ? 0 : shipping)}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE — Customer + Payment */}
              <div className="bg-white p-6 rounded-xl shadow-lg border space-y-5">
                {/* Title */}
                <h2 className="text-xl font-bold mb-4">Customer Information</h2>

                {/* Full Name */}
                <input
                  type="text"
                  placeholder="Full Name *"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-cyan-300"
                  onChange={(e) => setName(e.target.value)}
                />

                {/* Phone Number */}
                <input
                  type="number"
                  placeholder="Phone Number *"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-cyan-300"
                  onChange={(e) => setPhone(e.target.value)}
                />
                {/* Email */}
                <input
                  type="text"
                  placeholder="Email Address"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-cyan-300"
                  onChange={(e) => setEmail(e.target.value)}
                />

                {/* Address */}
                <input
                  type="text"
                  placeholder="Full Address *"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-cyan-300"
                  onChange={(e) => setAddress(e.target.value)}
                />

                {/* District */}
                <select
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-cyan-300"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  <option value="">Select District *</option>
                  <option value="Bagerhat">Bagerhat</option>
                  <option value="Bandarban">Bandarban</option>
                  <option value="Barguna">Barguna</option>
                  <option value="Barishal">Barishal</option>
                  <option value="Bhola">Bhola</option>
                  <option value="Bogura">Bogura</option>
                  <option value="Brahmanbaria">Brahmanbaria</option>
                  <option value="Chandpur">Chandpur</option>
                  <option value="Chapainawabganj">Chapainawabganj</option>
                  <option value="Chattogram">Chattogram</option>
                  <option value="Chuadanga">Chuadanga</option>
                  <option value="Cox's Bazar">Cox's Bazar</option>
                  <option value="Cumilla">Cumilla</option>
                  <option value="Dhaka">Dhaka</option>
                  <option value="Dinajpur">Dinajpur</option>
                  <option value="Faridpur">Faridpur</option>
                  <option value="Feni">Feni</option>
                  <option value="Gaibandha">Gaibandha</option>
                  <option value="Gazipur">Gazipur</option>
                  <option value="Gopalganj">Gopalganj</option>
                  <option value="Habiganj">Habiganj</option>
                  <option value="Jamalpur">Jamalpur</option>
                  <option value="Jashore">Jashore</option>
                  <option value="Jhalokati">Jhalokati</option>
                  <option value="Jhenaidah">Jhenaidah</option>
                  <option value="Joypurhat">Joypurhat</option>
                  <option value="Khagrachhari">Khagrachhari</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Kishoreganj">Kishoreganj</option>
                  <option value="Kurigram">Kurigram</option>
                  <option value="Kushtia">Kushtia</option>
                  <option value="Lakshmipur">Lakshmipur</option>
                  <option value="Lalmonirhat">Lalmonirhat</option>
                  <option value="Madaripur">Madaripur</option>
                  <option value="Magura">Magura</option>
                  <option value="Manikganj">Manikganj</option>
                  <option value="Meherpur">Meherpur</option>
                  <option value="Moulvibazar">Moulvibazar</option>
                  <option value="Munshiganj">Munshiganj</option>
                  <option value="Mymensingh">Mymensingh</option>
                  <option value="Naogaon">Naogaon</option>
                  <option value="Narail">Narail</option>
                  <option value="Narayanganj">Narayanganj</option>
                  <option value="Narsingdi">Narsingdi</option>
                  <option value="Natore">Natore</option>
                  <option value="Netrokona">Netrokona</option>
                  <option value="Nilphamari">Nilphamari</option>
                  <option value="Noakhali">Noakhali</option>
                  <option value="Pabna">Pabna</option>
                  <option value="Panchagarh">Panchagarh</option>
                  <option value="Patuakhali">Patuakhali</option>
                  <option value="Pirojpur">Pirojpur</option>
                  <option value="Rajbari">Rajbari</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Rangamati">Rangamati</option>
                  <option value="Rangpur">Rangpur</option>
                  <option value="Satkhira">Satkhira</option>
                  <option value="Shariatpur">Shariatpur</option>
                  <option value="Sherpur">Sherpur</option>
                  <option value="Sirajganj">Sirajganj</option>
                  <option value="Sunamganj">Sunamganj</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Tangail">Tangail</option>
                  <option value="Thakurgaon">Thakurgaon</option>
                </select>

                {/* SHIPPING METHOD */}
                <div className="p-4 border rounded-xl bg-white shadow-sm">
                  <h3 className="font-semibold mb-3">Shipping Method</h3>

                  {/* Inside Dhaka */}
                  <label
                    className={`flex justify-between mb-2 items-center p-3 rounded-lg cursor-pointer border transition 
${
  shipping === shippingRates.insideDhaka
    ? "bg-cyan-50 border-cyan-400"
    : "hover:bg-gray-50"
}`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      checked={shipping === shippingRates.insideDhaka}
                      onChange={() => setShipping(shippingRates.insideDhaka)}
                    />
                    <span>Inside Dhaka</span>
                    <span>৳{shippingRates.insideDhaka}</span>
                  </label>

                  {/* Outside Dhaka */}
                  <label
                    className={`flex justify-between items-center p-3 rounded-lg cursor-pointer border transition 
${
  shipping === shippingRates.outsideDhaka
    ? "bg-cyan-50 border-cyan-400"
    : "hover:bg-gray-50"
}`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      checked={shipping === shippingRates.outsideDhaka}
                      onChange={() => setShipping(shippingRates.outsideDhaka)}
                    />
                    <span>Outside Dhaka</span>
                    <span>৳{shippingRates.outsideDhaka}</span>
                  </label>
                </div>

                {/* PAYMENT METHOD */}
                <div className="p-4 border rounded-xl bg-white shadow-sm">
                  <h3 className="font-semibold mb-3">Payment Method</h3>

                  {/* COD */}
                  <label
                    className={`flex justify-between mb-2 items-center p-3 rounded-lg cursor-pointer border transition 
        ${
          paymentMethod === "cod"
            ? "bg-cyan-50 border-cyan-400"
            : "hover:bg-gray-50"
        }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="h-5 w-5"
                    />
                    <span className="font-medium">Cash on Delivery (COD)</span>
                  </label>

                  {/* Online Payment */}
                  <label
                    className={`flex justify-between items-center p-3 rounded-lg cursor-pointer border transition 
        ${
          paymentMethod === "online"
            ? "bg-cyan-50 border-cyan-400"
            : "hover:bg-gray-50"
        }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                      className="h-5 w-5"
                      disabled
                    />
                    <span className="font-medium">Online Payment</span>
                  </label>
                </div>

                {/* ORDER BUTTON */}
                <button
                  onClick={handleOrderSubmit}
                  className="w-full bg-cyan-500 text-white py-3 rounded-lg font-bold hover:bg-cyan-600 transition"
                >
                  {page.orderButtonText}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default LandingPage;
