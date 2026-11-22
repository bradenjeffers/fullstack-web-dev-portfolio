import api from "../api/client";
import { ENDPOINTS } from "../constants/backend";
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
} from "../constants/userActionConstants";
import { errorMessage, unwrap } from "../utils/apiHelpers";

// Turn whatever the backend returned into the user object kept in Redux.
// The plain-Node API echoes the stored user record, password included, so the
// password is dropped here and never reaches the store or browser storage.
export const normaliseUser = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Unexpected login response from the server");
  }
  const { password, ...user } = payload.user ? { ...payload.user, token: payload.token } : payload;
  return user;
};

export const login = (username, password) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });
  try {
    const response = await api.post(ENDPOINTS.login, { username, password });
    dispatch({ type: LOGIN_SUCCESS, payload: normaliseUser(unwrap(response)) });
  } catch (error) {
    const status = error.response && error.response.status;
    const message =
      status === 401 || status === 403
        ? "Invalid username or password"
        : errorMessage(error, "Unable to log in");
    dispatch({ type: LOGIN_FAILURE, payload: message });
  }
};

// Sessions live only in the client (no server-side logout call), so logging
// out is a plain action: the persisted login state is cleared and the route
// guards send the user back to /login without a page reload.
export const logout = () => ({ type: LOGOUT });
