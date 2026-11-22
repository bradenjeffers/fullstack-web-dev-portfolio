import createListReducer from "./createListReducer";
import {
  RESTAURANT_LIST_REQUEST,
  RESTAURANT_LIST_SUCCESS,
  RESTAURANT_LIST_FAIL,
} from "../constants/restaurantActionConstants";

export const restaurantListReducer = createListReducer("restaurants", {
  REQUEST: RESTAURANT_LIST_REQUEST,
  SUCCESS: RESTAURANT_LIST_SUCCESS,
  FAIL: RESTAURANT_LIST_FAIL,
});
