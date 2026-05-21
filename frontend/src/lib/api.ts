import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const apiClient = axios.create({
  baseURL: BACKEND_URL ? `${BACKEND_URL}/api` : "/api",
  timeout: 15000,
});
