import FloatingChatMenu from "@/Shared/FloatingChatMenu";
import Footer from "@/Shared/Footer";
import Navbar from "@/Shared/Navbar";
import ScrollToTop from "@/Shared/ScrollToTop";
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
const MainLayout = () => {
  const location = useLocation();
  const noHeaderFooter =
    location.pathname.includes("login") || location.pathname.includes("signup");
  return (
    <div>
      <ScrollToTop />
      {!noHeaderFooter && <Navbar />}
      <Outlet />
      {!noHeaderFooter && <Footer />}
      <FloatingChatMenu />
    </div>
  );
};

export default MainLayout;
