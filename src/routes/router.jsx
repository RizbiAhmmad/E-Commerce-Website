
import MainLayout from "@/Layouts/MainLayout";
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
            element: <h1>Home Page</h1>
        },
        
      ]
    },
  ]);