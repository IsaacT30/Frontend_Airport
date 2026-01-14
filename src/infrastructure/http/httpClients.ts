import axios, { AxiosInstance } from 'axios';
import { tokenStorage } from '../storage/tokenStorage';

const FLIGHTS_API_URL = import.meta.env.VITE_FLIGHTS_API_URL || 'http://localhost:8000';
const AIRPORT_API_URL = import.meta.env.VITE_AIRPORT_API_URL || 'http://localhost:8001';

// Create axios instance for Flights API
export const flightsApiClient: AxiosInstance = axios.create({
  baseURL: FLIGHTS_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for Airport API
export const airportApiClient: AxiosInstance = axios.create({
  baseURL: AIRPORT_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
const requestInterceptor = (config: any) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Response interceptor to handle auth errors
const responseErrorInterceptor = async (error: any) => {
  const originalRequest = error.config;

  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        const response = await axios.post(`${FLIGHTS_API_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        tokenStorage.setAccessToken(access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axios(originalRequest);
      } catch (refreshError) {
        tokenStorage.clearAll();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    } else {
      tokenStorage.clearAll();
      window.location.href = '/login';
    }
  }
  
  return Promise.reject(error);
};

// Add interceptors to both clients
flightsApiClient.interceptors.request.use(requestInterceptor);
flightsApiClient.interceptors.response.use(
  (response) => response,
  responseErrorInterceptor
);

airportApiClient.interceptors.request.use(requestInterceptor);
airportApiClient.interceptors.response.use(
  (response) => response,
  responseErrorInterceptor
);
