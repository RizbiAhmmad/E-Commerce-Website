import Navbar from '@/Shared/Navbar';
import React from 'react';
import { Outlet } from 'react-router-dom';
const MainLayout = () => {
    return (
        <div>
            <Navbar></Navbar>
           <Outlet></Outlet>
        </div>
    );
};

export default MainLayout;