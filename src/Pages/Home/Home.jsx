import React from 'react';
import Banner from './Banner';
import ProductCard from './ProductCard';
import PopularProduct from './PopularProduct';
import NewArrival from './NewArrival';
import TopRatedProduct from './TopRatedProduct';
import FlashSale from './FlashSale';
import ExplorePopularCategory from './ExplorePopularCategory';

const Home = () => {
    return (
        <div>
            <Banner />
            <ExplorePopularCategory />
            <ProductCard />
            <NewArrival />
            <FlashSale />
            <PopularProduct />
            <TopRatedProduct />
        </div>
    );
};

export default Home;