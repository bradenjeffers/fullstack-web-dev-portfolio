import createListAction from "./createListAction";
import { ENDPOINTS } from "../constants/backend";
import {
  CATEGORY_LIST_REQUEST,
  CATEGORY_LIST_SUCCESS,
  CATEGORY_LIST_FAIL,
} from "../constants/categoryActionConstants";

export const listCategories = createListAction(ENDPOINTS.categories, {
  REQUEST: CATEGORY_LIST_REQUEST,
  SUCCESS: CATEGORY_LIST_SUCCESS,
  FAIL: CATEGORY_LIST_FAIL,
});
