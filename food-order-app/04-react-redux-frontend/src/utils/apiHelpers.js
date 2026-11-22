// The three backends in this repo answer in slightly different shapes:
//   05 (plain Node):      the payload itself            -> [...] / {...}
//   06 (Express/Mongo):   { message, data: <payload> }  -> res.data.data
// These helpers hide that difference from the action creators.

export const unwrap = (response) => {
  const body = response && response.data;
  if (body && typeof body === "object" && !Array.isArray(body) && "data" in body) {
    return body.data;
  }
  return body;
};

export const unwrapList = (response) => {
  const payload = unwrap(response);
  if (!Array.isArray(payload)) {
    throw new Error("Unexpected response from the server");
  }
  return payload;
};

export const errorMessage = (error, fallback = "Something went wrong") => {
  const body = error && error.response && error.response.data;
  return (body && (body.message || body.error)) || (error && error.message) || fallback;
};

// Backends differ on the identifier: `id` (05) or `_id` (MongoDB).
export const itemId = (item) => (item.id !== undefined ? item.id : item._id);

// Attach the session token (if the backend issued one) to a request.
export const authConfig = (getState) => {
  const userInfo = getState().login.userInfo;
  const token = userInfo && (userInfo.sessionToken || userInfo.token);
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const isAdmin = (userInfo) => Boolean(userInfo && userInfo.isAdmin);
