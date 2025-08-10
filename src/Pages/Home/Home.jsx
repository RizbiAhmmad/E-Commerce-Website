import React from 'react';
import Banner from './Banner';
import ProductCard from './ProductCard';
import PopularProduct from './PopularProduct';
import NewArrival from './NewArrival';

const Home = () => {
    return (
        <div>
            <Banner />
            <ProductCard />
            <PopularProduct />
            <NewArrival/>
        </div>
    );
};

export default Home;