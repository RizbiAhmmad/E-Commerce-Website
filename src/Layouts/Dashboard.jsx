import React, { useEffect, useState } from "react";
import { GiCash } from "react-icons/gi";
import { TbCashRegister, TbTruckReturn } from "react-icons/tb";
import { RiFileDamageFill } from "react-icons/ri";
import {
  FaBalanceScale,
  FaChartBar,
  FaChartLine,
  FaGift,
  FaHome,
  FaInfoCircle,
  FaListAlt,
  FaMoneyBillWave,
  FaPalette,
  FaReceipt,
  FaRulerCombined,
  FaStar,
  FaThList,
  FaUsers,
} from "react-icons/fa";
import { LuLayoutDashboard } from "react-icons/lu";
import {
  MdIncompleteCircle,
  MdInventory,
  MdLocalShipping,
  MdOutlineAdsClick,
  MdOutlineDashboardCustomize,
  MdOutlineLocalShipping,
  MdPrivacyTip,
} from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { NavLink, Outlet } from "react-router-dom";
import useAxiosPublic from "@/Hooks/useAxiosPublic";
import useAuth from "@/Hooks/useAuth";
import Loading from "@/Shared/Loading";
import { BiSolidCoupon } from "react-icons/bi";
import { BsCashCoin } from "react-icons/bs";
import { IoIosCash } from "react-icons/io";
import { FaSliders, FaUsersViewfinder } from "react-icons/fa6";
import { SiBrandfolder } from "react-icons/si";

<style>
  {`
    .scrollWhite::-webkit-scrollbar {
      width: 6px;
    }
    .scrollWhite::-webkit-scrollbar-thumb {
      background: white;
      border-radius: 10px;
    }
    .scrollWhite::-webkit-scrollbar-track {
      background: transparent;
    }
  `}
</style>


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
        {/* <div
          className={`${
            isSidebarOpen ? "w-64" : "w-0 md:w-64"
          } bg-gray-100 text-black transition-all duration-300 flex flex-col justify-between`}
        > */}

        <div
          className={`${
            isSidebarOpen ? "w-64" : "w-0 md:w-64"
          } bg-black text-white md:bg-gray-100 md:text-black transition-all duration-300 flex flex-col justify-between`}
        >
          <ul
            onClick={toggleSidebar}
            className="scrollWhite p-6 space-y-2 text-md h-[calc(100vh-4rem)] overflow-y-auto scroll-smooth"
          >
            {/* Admin Menu */}
            {userRole === "admin" && (
              <>
                <li>
                  <NavLink to="/" className="flex items-center py-2 space-x-3">
                    <FaHome /> <span>Home</span>
                  </NavLink>
                </li>

                {/* Users */}
                {/* <li className=" pt-4 pb-1 text-xs font-semibold md:text-gray-500 uppercase">
                  USERS
                </li>
                <li>
                  <NavLink
                    to="/dashboard/users"
                    className="px-2 flex items-center py-2 space-x-3"
                  >
                    <FaUsers /> <span>Users</span>
                  </NavLink>
                </li> */}

                {/* Product & Stock */}
                <li className=" pt-4 pb-1 text-xs font-semibold md:text-gray-500 uppercase">
                  PRODUCT & STOCK
                </li>
                <li>
                  <NavLink
                    to="/dashboard/allProducts"
                    className="px-2 flex items-center py-2 space-x-3"
                  >
                    <MdInventory /> <span>Products</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/allCategories"
                    className="flex px-2 items-center py-2 space-x-3"
                  >
                    <FaListAlt /> <span>Categories</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/allSubCategories"
                    className="flex px-2 items-center py-2 space-x-3"
                  >
                    <FaThList /> <span>SubCategories</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/allBrands"
                    className="flex items-center px-2 py-2 space-x-3"
                  >
                    <SiBrandfolder /> <span>Brands</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/allSizes"
                    className="flex items-center px-2 py-2 space-x-3"
                  >
                    <FaRulerCombined /> <span>Sizes</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/allColors"
                    className="flex items-center px-2 py-2 space-x-3"
                  >
                    <FaPalette /> <span>Colors</span>
                  </NavLink>
                </li>
                

                {/* POS & Orders */}
                <li className=" pt-4 pb-1 text-xs font-semibold md:text-gray-500 uppercase">
                  POS & ORDERS
                </li>
                <li>
                  <NavLink
                    to="/dashboard/pos"
                    className="flex px-2 items-center py-2 space-x-3"
                  >
                    <BsCashCoin /> <span>POS</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/posOrders"
                    className="flex px-2 items-center py-2 space-x-3"
                  >
                    <IoIosCash /> <span>POS Orders</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/allOrders"
                    className="flex items-center px-2 py-2 space-x-3"
                  >
                    <FaReceipt /> <span>Online Orders</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/incompleteOrders"
                    className="flex items-center px-2 py-2 space-x-3"
                  >
                    <MdIncompleteCircle /> <span>Incomplete Orders</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/allDamageProducts"
                    className="flex items-center px-2 py-2 space-x-3"
                  >
                    <RiFileDamageFill /> <span>Damage Products</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/allReturnProducts"
                    className="flex items-center px-2 py-2 space-x-3"
                  >
                    <TbTruckReturn /> <span>Return Orders</span>
                  </NavLink>
                </li>

                {/* Reports */}
                <li className="pt-4 pb-1 text-xs font-semibold md:text-gray-500 uppercase">
                  REPORTS
                </li>
                <li>
                  <NavLink
                    to="/dashboard/sales"
                    className="flex items-center px-2 py-2 space-x-3"
                  >
                    <FaChartBar /> <span>Sales Report</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/stock"
                    className="flex items-center px-2 py-2 space-x-3"
                  >
                    <FaChartLine /> <span>Stock Report</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/ExpenseReport"
                    className="flex items-center px-2 py-2 space-x-3"
                  >
                    <TbCashRegister /> <span>Expense Report</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/ProfitLossReport"
                    className="flex items-center px-2 py-2 space-x-3"
                  >
                    <FaBalanceScale /> <span>Profit/Loss Report</span>
                  </NavLink>
                </li>
                {/* Expense */}
                <li className="pt-4 pb-1 text-xs font-semibold md:text-gray-500 uppercase">
                  EXPENSE
                </li>
                <li>
                  <NavLink
                    to="/dashboard/allExpense"
                    className="flex items-center px-2 py-2 space-x-3"
                  >
                    <FaMoneyBillWave /> <span>Expense</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/allExpenseCategories"
                    className="flex items-center px-2 py-2 space-x-3"
                  >
                    <GiCash /> <span>Expense Categories</span>
                  </NavLink>
                </li>

                {/* Customers */}
                <li className="pt-4 pb-1 text-xs font-semibold md:text-gray-500 uppercase">
                  CUSTOMERS
                </li>
                <li>
                  <NavLink
                    to="/dashboard/CustomerSegment"
                    className="flex items-center px-2 py-2 space-x-3"
                  >
                    <FaUsersViewfinder /> <span>Customer Segment</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/allReviews"
                    className="flex items-center px-2 py-2 space-x-3"
                  >
                    <FaStar /> <span>Reviews</span>
                  </NavLink>
                </li>
                {/* Promo */}
                <li className="pt-4 pb-1 text-xs font-semibold md:text-gray-500 uppercase">
                  PROMO
                </li>
                <li>
                  <NavLink
                    to="/dashboard/allCoupons"
                    className="flex items-center px-2 py-2 space-x-3"
                  >
                    <BiSolidCoupon /> <span>Coupons</span>
                  </NavLink>
                </li>

                {/* Others */}
                <li className="pt-4 pb-1 text-xs font-semibold md:text-gray-500 uppercase">
                  OTHERS
                </li>
                <li>
                  <NavLink
                    to="/dashboard/allSliders"
                    className="flex items-center px-2 py-2 space-x-3"
                  >
                    <FaSliders /> <span>Sliders</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/allOffers"
                    className="flex items-center px-2 py-2 space-x-3"
                  >
                    <FaGift /> <span>Offers</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/allLandingPages"
                    className="flex items-center px-2 py-2 space-x-3"
                  >
                    <MdOutlineAdsClick /> <span>Landing Pages</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/CourierSettings"
                    className="flex items-center px-2 py-2 space-x-3"
                  >
                    <MdLocalShipping /> <span>Courier Settings</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/shippingSettings"
                    className="flex items-center px-2 py-2 space-x-3"
                  >
                    <MdOutlineLocalShipping /> <span>Shipping Settings</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/FooterInfo"
                    className="flex items-center px-2 py-2 space-x-3"
                  >
                    <FaInfoCircle /> <span>Logo & Info</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/allPolicies"
                    className="flex items-center px-2 py-2 space-x-3"
                  >
                    <MdPrivacyTip /> <span>Policies</span>
                  </NavLink>
                </li>

                {/* Profile */}
                <li className="pt-4 pb-1 text-xs font-semibold md:text-gray-500 uppercase">
                  ACCOUNT
                </li>
                <li>
                  <NavLink
                    to="/dashboard/profile"
                    className="flex items-center px-2 py-2 space-x-3"
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
