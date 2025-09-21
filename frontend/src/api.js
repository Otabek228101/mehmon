import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export const createReceipt = (data) => api.post("/api/receipts", data);
export const getReceipts = () => api.get("/api/receipts");
export const searchReceipts = (query) => api.get(`/api/receipts/search?q=${query}`);
export const getReceipt = (id) => api.get(`/api/receipts/${id}`);
export const updateReceipt = (id, data) => api.put(`/api/receipts/${id}`, data);
export const deleteReceipt = (id) => api.delete(`/api/receipts/${id}`);
export const getHotels = () => api.get("/api/hotels");
export const getCarRentals = () => api.get("/api/car-rentals");

export default api;