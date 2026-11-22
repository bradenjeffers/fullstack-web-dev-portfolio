import { userLoginReducer } from "./userReducers";
import { restaurantListReducer } from "./restaurantReducers";
import { categoryListReducer } from "./categoryReducers";
import { cuisineListReducer } from "./cuisineReducers";
import { localCatalogReducer } from "./localCatalogReducer";

// Plain (non-persisted) reducers. store.js wraps `login` and `localCatalog`
// with redux-persist; tests combine these directly.
export const appReducers = {
  login: userLoginReducer,
  restaurantList: restaurantListReducer,
  categoryList: categoryListReducer,
  cuisineList: cuisineListReducer,
  localCatalog: localCatalogReducer,
};
