import React from "react";
import { motion } from "framer-motion";
import { FaLeaf, FaUsers, FaRocket } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-gray-50 py-20 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-cyan-500 to-green-500 text-white py-10 px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold mb-4"
        >
          About <span className="text-yellow-300">Our Company</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-lg md:text-xl"
        >
          We are passionate about innovation, teamwork, and building solutions
          that create real impact in the digital world.
        </motion.p>
      </section>

      {/* Our Story */}
      <section className="py-16 px-6 max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-6"
        >
          Our Story
        </motion.h2>
        <p className="text-lg leading-relaxed max-w-3xl mx-auto">
          Founded with a vision to empower businesses and individuals, our
          journey started with a small group of dreamers. Today, we are a
          growing community dedicated to delivering high-quality services,
          meaningful experiences, and impactful solutions.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gray-100 dark:bg-gray-700 p-6 rounded-2xl shadow-lg text-center"
          >
            <FaLeaf className="text-4xl text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Sustainability</h3>
            <p>
              We believe in building eco-friendly, long-lasting digital
              solutions that serve people and the planet.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gray-100 dark:bg-gray-700 p-6 rounded-2xl shadow-lg text-center"
          >
            <FaUsers className="text-4xl text-cyan-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Teamwork</h3>
            <p>
              Collaboration is at the heart of everything we do. We grow
              stronger together as a team and with our clients.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gray-100 dark:bg-gray-700 p-6 rounded-2xl shadow-lg text-center"
          >
            <FaRocket className="text-4xl text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Innovation</h3>
            <p>
              Our mission is to constantly innovate and deliver creative
              solutions that inspire growth and progress.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-green-500 to-cyan-500 text-white text-center">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-3xl md:text-4xl font-bold mb-4"
        >
          Want to Work With Us?
        </motion.h2>
        <p className="max-w-2xl mx-auto mb-6 text-lg">
          Join hands with us to create powerful digital experiences and bring
          your vision to life.
        </p>
        <a
          onClick={() => navigate("/contact")}
          className="bg-white text-cyan-600 font-bold px-6 py-3 rounded-full shadow-md hover:bg-gray-100 transition"
        >
          Contact Us
        </a>
      </section>
    </div>
  );
};

export default About;
