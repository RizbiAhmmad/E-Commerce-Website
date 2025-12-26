import GTMPageView from "@/Pages/Dashboard/Admin/GTMPageView";
import FloatingChatMenu from "@/Shared/FloatingChatMenu";
import Footer from "@/Shared/Footer";
import Navbar from "@/Shared/Navbar";
import ScrollToTop from "@/Shared/ScrollToTop";
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
const MainLayout = () => {
  const location = useLocation();
  const noHeaderFooter =
    // location.pathname.includes("login") || location.pathname.includes("signup") || location.pathname.includes("landing-page");
 location.pathname.includes("landing-page");
  return (
    <div>
      <ScrollToTop />
      {!noHeaderFooter && <Navbar />}
      {/* <Navbar /> */}
      <GTMPageView></GTMPageView>
      <Outlet />
      {!noHeaderFooter && <Footer />}
      {/* <Footer /> */}
      <FloatingChatMenu />
    </div>
  );
};

export default MainLayout;
