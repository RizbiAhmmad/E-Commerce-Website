import Footer from "@/Shared/Footer";
import Navbar from "@/Shared/Navbar";
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
const MainLayout = () => {
  const location = useLocation();
  const noHeaderFooter =
    location.pathname.includes("login") || location.pathname.includes("signup");
  return (
    <div>
      {!noHeaderFooter && <Navbar />}
      <Outlet />
      {!noHeaderFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
