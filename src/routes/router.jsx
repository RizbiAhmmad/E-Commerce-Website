
import Login from "@/Authentication/Login";
import SignUp from "@/Authentication/SignUp";
import Dashboard from "@/Layouts/Dashboard";
import MainLayout from "@/Layouts/MainLayout";
import AddCategory from "@/Pages/Dashboard/Admin/AddCategory";
import AllCategories from "@/Pages/Dashboard/Admin/AllCategories";
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
      ]
    }
  ]);