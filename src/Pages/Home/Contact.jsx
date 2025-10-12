import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaLinkedin, FaYoutube, FaTiktok, FaInstagram } from "react-icons/fa";
import axios from "axios";

const Contact = () => {
  const [footerInfo, setFooterInfo] = useState(null);

  useEffect(() => {
    const fetchFooterInfo = async () => {
      try {
        const res = await axios.get("https://api.sports.bangladeshiit.com/footer");
        setFooterInfo(res.data[0]);
      } catch (err) {
        console.error("❌ Footer Info Fetch Error:", err.message);
      }
    };
    fetchFooterInfo();
  }, []);

  if (!footerInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold">Loading Contact Info...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-10 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-cyan-500 to-green-500 text-white py-20 px-6 text-center">
        <motion.img
          src={footerInfo.logo}
          alt="Company Logo"
          className="w-24 h-24 mx-auto mb-4 rounded-full shadow-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        />
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold mb-4"
        >
          {footerInfo.name}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-lg md:text-xl"
        >
          {footerInfo.description}
        </motion.p>
      </section>

      {/* Contact Info */}
      <section className="py-16 px-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
        <motion.div whileHover={{ scale: 1.05 }} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg flex flex-col items-center">
          <FaPhoneAlt className="text-3xl text-cyan-500" />
          <h3 className="text-xl font-bold mt-4">Phone</h3>
          <p className="mt-2">{footerInfo.phone}</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg flex flex-col items-center">
          <FaEnvelope className="text-3xl text-green-500" />
          <h3 className="text-xl font-bold mt-4">Email</h3>
          <p className="mt-2">{footerInfo.email}</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg flex flex-col items-center">
          <FaMapMarkerAlt className="text-3xl text-yellow-500" />
          <h3 className="text-xl font-bold mt-4">Address</h3>
          <p className="mt-2">{footerInfo.address}</p>
        </motion.div>
      </section>

      {/* Google Map */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-3xl font-bold text-center mb-8">
          Find Us Here
        </motion.h2>
        <div className="overflow-hidden rounded-2xl shadow-lg">
          <iframe
            title="Company Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.8430431062523!2d90.37425557450427!3d23.750885988671!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755bf57a540c4a1%3A0xabd58adf33a9d8c1!2sDhaka!5e0!3m2!1sen!2sbd!4v1693669144491!5m2!1sen!2sbd"
            width="100%"
            height="400"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </section>

      {/* Social Links */}
      <section className="py-10 text-center">
        <p className="text-lg font-semibold mb-4">Follow Us</p>
        <div className="flex justify-center gap-6 text-2xl">
          {footerInfo.facebook && (
            <a href={footerInfo.facebook} target="_blank" rel="noreferrer" className="hover:text-cyan-500">
              <FaFacebook />
            </a>
          )}
          {footerInfo.youtube && (
            <a href={footerInfo.youtube} target="_blank" rel="noreferrer" className="hover:text-cyan-500">
              <FaYoutube />
            </a>
          )}
          {footerInfo.instagram && (
            <a href={footerInfo.instagram} target="_blank" rel="noreferrer" className="hover:text-cyan-500">
              <FaInstagram />
            </a>
          )}
          {footerInfo.tiktok && (
            <a href={footerInfo.tiktok} target="_blank" rel="noreferrer" className="hover:text-cyan-500">
              <FaTiktok />
            </a>
          )}
          {footerInfo.linkedin && (
            <a href={footerInfo.linkedin} target="_blank" rel="noreferrer" className="hover:text-cyan-500">
              <FaLinkedin />
            </a>
          )}
        </div>
      </section>
    </div>
  );
};

export default Contact;
