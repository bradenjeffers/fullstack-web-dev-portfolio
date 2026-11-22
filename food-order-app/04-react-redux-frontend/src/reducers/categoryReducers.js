import createListReducer from "./createListReducer";
import {
  CATEGORY_LIST_REQUEST,
  CATEGORY_LIST_SUCCESS,
  CATEGORY_LIST_FAIL,
} from "../constants/categoryActionConstants";

export const categoryListReducer = createListReducer("categories", {
  REQUEST: CATEGORY_LIST_REQUEST,
  SUCCESS: CATEGORY_LIST_SUCCESS,
  FAIL: CATEGORY_LIST_FAIL,
});
