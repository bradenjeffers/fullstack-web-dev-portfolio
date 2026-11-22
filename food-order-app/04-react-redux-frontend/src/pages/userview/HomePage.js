import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import CatalogSection from "../../components/CatalogSection";
import { listCuisines } from "../../actions/cuisineActions";
import { listCategories } from "../../actions/categoryActions";
import { listRestaurants } from "../../actions/restaurantActions";
import useCatalog from "../../hooks/useCatalog";

const HomePage = () => {
  const dispatch = useDispatch();
  const cuisines = useCatalog("cuisines");
  const categories = useCatalog("categories");
  const restaurants = useCatalog("restaurants");

  useEffect(() => {
    dispatch(listCuisines());
    dispatch(listCategories());
    dispatch(listRestaurants());
  }, [dispatch]);

  return (
    <div className="pt-4">
      <CatalogSection title="Try New Cuisines" itemName="cuisine" {...cuisines} />
      <CatalogSection title="Explore Categories" itemName="category" {...categories} />
      <CatalogSection title="Order from Top Restaurants" itemName="restaurant" {...restaurants} />
    </div>
  );
};

export default HomePage;
