import React, { useEffect, useState } from "react";
import {
  FaHome,
  FaListAlt,
  FaPalette,
  FaReceipt,
  FaRulerCombined,
  FaStar,
  FaThList,
  FaTrademark,
  FaUsers,
  
} from "react-icons/fa";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdInventory, MdOutlineDashboardCustomize } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { NavLink, Outlet } from "react-router-dom";
import useAxiosPublic from "@/Hooks/useAxiosPublic";
import useAuth from "@/Hooks/useAuth";
import Loading from "@/Shared/Loading";

const Dashboard = () => {
  const { user } = useAuth();
  const axiosPublic = useAxiosPublic();
  const [userRole, setUserRole] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (user && user.email) {
      axiosPublic
        .get("/users/role", { params: { email: user.email } })
        .then((response) => {
          setUserRole(response.data.role);
        })
        .catch((error) => console.error("Error fetching user role:", error));
    }
  }, [axiosPublic, user]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!userRole) {
    return <Loading />;
  }

  return (
    <div>
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={toggleSidebar}
          className="w-full text-4xl text-black focus:outline-none"
        >
          {!isSidebarOpen ? (
            <MdOutlineDashboardCustomize />
          ) : (
            <LuLayoutDashboard />
          )}
        </button>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div
          className={`${
            isSidebarOpen ? "w-64" : "w-0 md:w-64"
          } bg-gray-100 text-black transition-all duration-300 flex flex-col justify-between`}
        >
          <ul onClick={toggleSidebar} className="p-8">
            {/* Admin Menu */}
            {userRole === "admin" && (
              <>
                <li>
                  <NavLink to="/" className="flex items-center py-2 space-x-3">
                    <FaHome /> <span>Home</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/users"
                    className="flex items-center py-2 space-x-3"
                  >
                    <FaUsers /> <span>Users</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/allProducts"
                    className="flex items-center py-2 space-x-3"
                  >
                    <MdInventory /> <span>Products</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/allCategories"
                    className="flex items-center py-2 space-x-3"
                  >
                    <FaListAlt /> <span>Categories</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/allSubCategories"
                    className="flex items-center py-2 space-x-3"
                  >
                    <FaThList /> <span>SubCategories</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/allBrands"
                    className="flex items-center py-2 space-x-3"
                  >
                    <FaTrademark /> <span>Brands</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/allSizes"
                    className="flex items-center py-2 space-x-3"
                  >
                    <FaRulerCombined /> <span>Sizes</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/allColors"
                    className="flex items-center py-2 space-x-3"
                  >
                    <FaPalette /> <span>Colors</span>
                  </NavLink>
                </li>
                
                <li>
                  <NavLink
                    to="/dashboard/allReviews"
                    className="flex items-center py-2 space-x-3"
                  >
                    <FaStar /> <span>Reviews</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/allOrders"
                    className="flex items-center py-2 space-x-3"
                  >
                    <FaReceipt /> <span>Orders</span>
                  </NavLink>
                </li>
                
                
                <li>
                  <NavLink
                    to="/dashboard/profile"
                    className="flex items-center py-2 space-x-3"
                  >
                    <CgProfile /> <span>Profile</span>
                  </NavLink>
                </li>
                
              </>
            )}
            {/* User Menu */}
            {userRole === "user" && (
              <>
                <li>
                  <NavLink to="/" className="flex items-center py-2 space-x-3">
                    <FaHome /> <span>Home</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/myOrders"
                    className="flex items-center py-2 space-x-3"
                  >
                    <FaReceipt /> <span>My Orders</span>
                  </NavLink>
                </li>
               
                <li>
                  <NavLink
                    to="/dashboard/profile"
                    className="flex items-center py-2 space-x-3"
                  >
                    <CgProfile /> <span>Profile</span>
                  </NavLink>
                </li>
                
              </>
            )}
          </ul>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-4">
          {user && (
            <div className="p-4 mb-4 text-center text-blue-800 bg-gray-100 rounded-lg shadow">
              <h1 className="text-xl font-semibold">
                Hey, {user.displayName || "User"}! Welcome to your Dashboard.
              </h1>
            </div>
          )}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;