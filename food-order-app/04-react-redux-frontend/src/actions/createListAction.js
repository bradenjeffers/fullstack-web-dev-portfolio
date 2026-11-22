import api from "../api/client";
import { authConfig, errorMessage, unwrapList } from "../utils/apiHelpers";

// Builds a thunk that GETs a collection and dispatches request/success/fail.
// The category, cuisine and restaurant lists all follow this exact pattern.
const createListAction = (endpoint, types) => () => async (dispatch, getState) => {
  dispatch({ type: types.REQUEST });
  try {
    const response = await api.get(endpoint, authConfig(getState));
    dispatch({ type: types.SUCCESS, payload: unwrapList(response) });
  } catch (error) {
    dispatch({ type: types.FAIL, payload: errorMessage(error, "Unable to load data") });
  }
};

export default createListAction;
