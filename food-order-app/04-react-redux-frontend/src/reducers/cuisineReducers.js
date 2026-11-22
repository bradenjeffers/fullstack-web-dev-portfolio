import createListReducer from "./createListReducer";
import {
  CUISINE_LIST_REQUEST,
  CUISINE_LIST_SUCCESS,
  CUISINE_LIST_FAIL,
} from "../constants/cuisineActionConstants";

export const cuisineListReducer = createListReducer("cuisines", {
  REQUEST: CUISINE_LIST_REQUEST,
  SUCCESS: CUISINE_LIST_SUCCESS,
  FAIL: CUISINE_LIST_FAIL,
});
