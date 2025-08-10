import React from 'react';
import Banner from './Banner';
import ProductCard from './ProductCard';
import PopularProduct from './PopularProduct';

const Home = () => {
    return (
        <div>
            <Banner />
            <ProductCard />
            <PopularProduct />
        </div>
    );
};

export default Home;