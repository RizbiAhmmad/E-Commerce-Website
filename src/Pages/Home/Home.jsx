import React from 'react';
import Banner from './Banner';
import ProductCard from './ProductCard';
import PopularProduct from './PopularProduct';
import NewArrival from './NewArrival';
import TopRatedProduct from './TopRatedProduct';

const Home = () => {
    return (
        <div>
            <Banner />
            <ProductCard />
            <NewArrival />
            <PopularProduct />
            <TopRatedProduct />
        </div>
    );
};

export default Home;