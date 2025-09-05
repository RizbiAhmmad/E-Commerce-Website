import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function Footer() {
  const [footerInfo, setFooterInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchFooterInfo = async () => {
    try {
      const res = await fetch("http://localhost:5000/footer");
      const data = await res.json();
      if (data.length > 0) {
        setFooterInfo(data[0]);
      }
    } catch (err) {
      console.error("Error fetching footer info:", err);
    } finally {
      setLoading(false);
    }
  };
  fetchFooterInfo();
}, []);


  if (loading) return <p className="text-center text-gray-400">Loading footer...</p>;
  if (!footerInfo || Object.keys(footerInfo).length === 0)
    return <p className="text-center text-gray-400">No footer data found.</p>;

  return (
    <footer className="bg-gradient-to-r from-cyan-700 via-blue-900 to-purple-800 text-white py-16 px-6 md:px-12 relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500 opacity-20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 opacity-20 rounded-full translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
        {/* Logo & About */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3">
            <img src={footerInfo.logo} alt={footerInfo.name || "Logo"} className="h-12 w-auto rounded-lg shadow-lg" />
            <h1 className="text-3xl font-bold">{footerInfo.name}</h1>
          </div>
          <p className="text-gray-200">{footerInfo.description}</p>
          <div className="flex gap-4 mt-2">
            {footerInfo.facebook && (
              <a
                href={footerInfo.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
              >
                <FaFacebookF />
              </a>
            )}
            {footerInfo.linkedin && (
              <a
                href={footerInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
              >
                <FaLinkedinIn />
              </a>
            )}
            {footerInfo.email && (
              <a href={`mailto:${footerInfo.email}`} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                <FaEnvelope />
              </a>
            )}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-xl font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-orange-400 transition">Home</Link></li>
            <li><Link to="/" className="hover:text-orange-400 transition">About Us</Link></li>
            <li><Link to="/" className="hover:text-orange-400 transition">Blogs</Link></li>
            <li><Link to="/" className="hover:text-orange-400 transition">Contact</Link></li>
          </ul>
        </motion.div>

        {/* Contact */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h3 className="text-xl font-semibold mb-2">Contact</h3>
          <ul className="space-y-3">
            {footerInfo.phone && (
              <li className="flex items-center gap-2 hover:text-orange-400 transition">
                <FaPhone /> {footerInfo.phone}
              </li>
            )}
            {footerInfo.email && (
              <li className="flex items-center gap-2 hover:text-orange-400 transition">
                <FaEnvelope /> {footerInfo.email}
              </li>
            )}
            {footerInfo.address && (
              <li className="flex items-center gap-2 hover:text-orange-400 transition">
                <FaMapMarkerAlt /> {footerInfo.address}
              </li>
            )}
          </ul>
        </motion.div>
      </div>

      <div className="border-t border-white/30 mt-12 pt-6 text-center text-sm text-gray-300 relative z-10">
        © {new Date().getFullYear()} {footerInfo.name}. All rights reserved.
      </div>
    </footer>
  );
}
