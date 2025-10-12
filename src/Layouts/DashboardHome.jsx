import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUsers,
  FaBoxOpen,
  FaShippingFast,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { motion } from "framer-motion";
import useAuth from "@/Hooks/useAuth";
import useAxiosPublic from "@/Hooks/useAxiosPublic";
import Loading from "@/Shared/Loading";
import { TbTruckReturn } from "react-icons/tb";

const DashboardHome = () => {
  const { user } = useAuth();
  const axiosPublic = useAxiosPublic();
  const [userRole, setUserRole] = useState(null);
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    totalOrders: 0,
    ordersPending: 0,
    ordersProcessing: 0,
    ordersShipped: 0,
    ordersDelivered: 0,
    ordersCancelled: 0,
  });

  // Fetch user role
  useEffect(() => {
    if (user && user.email) {
      axiosPublic
        .get("/users/role", { params: { email: user.email } })
        .then((res) => setUserRole(res.data.role))
        .catch((err) => console.error(err));
    }
  }, [user, axiosPublic]);

  // Fetch stats only if admin
  useEffect(() => {
    if (userRole !== "admin") return;

    const fetchStats = async () => {
      try {
        const [usersRes, productsRes, ordersRes] = await Promise.all([
          axios.get("https://api.sports.bangladeshiit.com/users"),
          axios.get("https://api.sports.bangladeshiit.com/products"),
          axios.get("https://api.sports.bangladeshiit.com/orders"),
        ]);

        const orders = ordersRes.data;

        setStats({
          users: usersRes.data.length,
          products: productsRes.data.length,
          totalOrders: orders.length,
          ordersPending: orders.filter((o) => o.status === "pending").length,
          ordersProcessing: orders.filter((o) => o.status === "processing").length,
          ordersShipped: orders.filter((o) => o.status === "shipped").length,
          ordersDelivered: orders.filter((o) => o.status === "delivered").length,
          ordersCancelled: orders.filter((o) => o.status === "cancelled").length,
          ordersReturned: orders.filter((o) => o.status === "returned").length,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchStats();
  }, [userRole]);

  if (userRole === null) return <Loading />;
  if (userRole !== "admin") return null;

  const cards = [
    { title: "Total Users", value: stats.users, icon: FaUsers, bg: "bg-cyan-500" },
    { title: "Total Products", value: stats.products, icon: FaBoxOpen, bg: "bg-green-500" },
    { title: "Total Orders", value: stats.totalOrders, icon: FaBoxOpen, bg: "bg-purple-500" },
    { title: "Pending Orders", value: stats.ordersPending, icon: FaShippingFast, bg: "bg-yellow-500" },
    { title: "Processing Orders", value: stats.ordersProcessing, icon: FaShippingFast, bg: "bg-indigo-500" },
    { title: "Shipped Orders", value: stats.ordersShipped, icon: FaShippingFast, bg: "bg-blue-500" },
    { title: "Delivered Orders", value: stats.ordersDelivered, icon: FaCheckCircle, bg: "bg-green-600" },
    { title: "Cancelled Orders", value: stats.ordersCancelled, icon: FaTimesCircle, bg: "bg-red-500" },
    { title: "Returned Orders", value: stats.ordersReturned, icon: TbTruckReturn, bg: "bg-orange-500" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex items-center justify-between p-6 rounded-lg shadow-lg ${card.bg} hover:scale-105 transition-transform duration-300`}
          >
            <div>
              <h2 className="text-white text-lg font-semibold">{card.title}</h2>
              <p className="text-white text-2xl font-bold mt-2">{card.value}</p>
            </div>
            <Icon className="text-5xl text-white opacity-80" />
          </motion.div>
        );
      })}
    </div>
  );
};

export default DashboardHome;
