import axios from "axios";
import { API_BASE_URL } from "../constants/backend";

// One shared axios instance. No custom CORS headers are sent: those are
// *response* headers, and adding them to a request only forces a preflight.
const api = axios.create({ baseURL: API_BASE_URL });

export default api;
