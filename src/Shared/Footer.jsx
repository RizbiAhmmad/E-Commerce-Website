import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import logo from "../assets/SostayKini.png";

export default function Footer() {

  return (
    <footer className="bg-gray-900 text-white pt-24 pb-8 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo and Brand Info */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="BangladeshiIT Logo" className="h-10 w-auto" />
            <h1 className="text-2xl font-bold flex items-center">
              SostayKini
            </h1>
          </div>
          <p className="text-gray-400">
            Your one-stop solution for all e-commerce needs. We provide top-notch services to help your business thrive online.
          </p>
          <div className="flex gap-4 mt-4">
            <a href="" aria-label="Facebook">
              <FaFacebookF className="hover:text-orange-500" />
            </a>
            <a href="" aria-label="LinkedIn">
              <FaLinkedinIn className="hover:text-orange-500" />
            </a>
            <a href="" aria-label="Email">
              <FaEnvelope className="hover:text-orange-500" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
          <ul className="space-y-2 text-gray-400">
            <li><Link to="/" className="hover:text-orange-500">Home</Link></li>
            <li><Link to="/" className="hover:text-orange-500">About Us</Link></li>
            <li><Link to="/" className="hover:text-orange-500">Blogs</Link></li>
            <li><Link to="/" className="hover:text-orange-500">Contact</Link></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Our Services</h3>
          <ul className="space-y-2 text-gray-400">
            <li><Link to="/services/ecommerce" className="hover:text-orange-500">E-Commerce Solutions</Link></li>
           
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Contact</h3>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li className="flex items-center gap-2">
              <FaPhone /> +8801621741799
            </li>
            <li className="flex items-center gap-2">
              <FaEnvelope /> info@bangladeshiit.com
            </li>
            <li className="flex items-center gap-2">
              <FaMapMarkerAlt />
              House#35, Road#15, Sector#14, Uttara, Dhaka-1230, Bangladesh
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-12 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} SostayKini. All rights reserved.
      </div>
    </footer>
  );
}
