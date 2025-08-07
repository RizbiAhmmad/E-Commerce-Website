
import Login from "@/Authentication/Login";
import SignUp from "@/Authentication/SignUp";
import Dashboard from "@/Layouts/Dashboard";
import MainLayout from "@/Layouts/MainLayout";
import AddBrand from "@/Pages/Dashboard/Admin/AddBrand";
import AddCategory from "@/Pages/Dashboard/Admin/AddCategory";
import AddColor from "@/Pages/Dashboard/Admin/AddColor";
import AddSize from "@/Pages/Dashboard/Admin/AddSize";
import AddSubcategory from "@/Pages/Dashboard/Admin/AddSubcategory";
import AllBrands from "@/Pages/Dashboard/Admin/AllBrands";
import AllCategories from "@/Pages/Dashboard/Admin/AllCategories";
import AllSizes from "@/Pages/Dashboard/Admin/AllSizes";
import AllSubcategories from "@/Pages/Dashboard/Admin/AllSubcategories";
import AllUsers from "@/Pages/Dashboard/Admin/AllUsers";
import Profile from "@/Pages/Dashboard/Admin/Profile";
import Home from "@/Pages/Home/Home";
import {
    createBrowserRouter,
  } from "react-router-dom";

  export const router = createBrowserRouter([
    {
      path: "/",
      element: <MainLayout></MainLayout>,
      children:[
        {
            path: "/",
            element: <Home />,
        },
        {
        path: "login",
        element: <Login></Login>,
      },
      {
        path: "signup",
        element: <SignUp></SignUp>,
      },
        
      ]
    },
    {
       path: "dashboard",
      element: <Dashboard></Dashboard>,
      children:[
         {
        path: "users",
        element: <AllUsers></AllUsers>,
      },
       {
        path: "profile",
        element: <Profile></Profile>,
      },
       {
        path: "addCategory",
        element: <AddCategory></AddCategory>,
      },
       {
        path: "allCategories",
        element: <AllCategories></AllCategories>,
      },
       {
        path: "addSubCategories",
        element: <AddSubcategory></AddSubcategory>,
      },
      {
        path: "allSubCategories",
        element: <AllSubcategories></AllSubcategories>,
      },
      {
        path: "addBrand",
        element: <AddBrand></AddBrand>,
      },
      {
        path: "allBrands",
        element: <AllBrands></AllBrands>,
      },     
      {
        path: "addSize",
        element: <AddSize></AddSize>,
      },
      {
        path: "allSizes",
        element: <AllSizes></AllSizes>,
      },
      {
        path: "addColor",
        element: <AddColor></AddColor>,
      },
      // {
      //   path: "allColors",
      //   element: <AllColors></AllColors>,
      // },
      ]
    }
  ]);