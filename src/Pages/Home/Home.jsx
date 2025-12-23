import React from "react";
import Banner from "./Banner";
import ProductCard from "./ProductCard";
import PopularProduct from "./PopularProduct";
import NewArrival from "./NewArrival";
import TopRatedProduct from "./TopRatedProduct";
import FlashSale from "./FlashSale";
import ExplorePopularCategory from "./ExplorePopularCategory";
import OfferPage from "./OfferPage";

const Home = () => {
  return (
    <div className="dark:bg-black dark:text-white">
      <Banner />
      <ExplorePopularCategory />
      <NewArrival />
      <OfferPage />
      <FlashSale />
      <ProductCard />
      <PopularProduct />
      <TopRatedProduct />
    </div>
  );
};

export default Home;
