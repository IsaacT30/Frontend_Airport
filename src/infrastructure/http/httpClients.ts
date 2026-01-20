import axios, { AxiosInstance, AxiosError } from 'axios';
import { tokenStorage } from '../storage/tokenStorage';

// Environment variables for API URLs
const AIRPORT_API_URL = import.meta.env.VITE_AIRPORT_API_URL || 'http://localhost:8000';
const BILLING_API_URL = import.meta.env.VITE_BILLING_API_URL || 'http://localhost:8001';

// Create axios instance for Airport API
export const airportApiClient: AxiosInstance = axios.create({
  baseURL: AIRPORT_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Create axios instance for Flights/Billing API
export const flightsApiClient: AxiosInstance = axios.create({
  baseURL: BILLING_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
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
const responseErrorInterceptor = async (error: AxiosError) => {
  const originalRequest: any = error.config;

  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        // Try to refresh the token using the billing API
        const response = await axios.post(`${BILLING_API_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        tokenStorage.setAccessToken(access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axios(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
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

// Add interceptors to Airport API client
airportApiClient.interceptors.request.use(requestInterceptor);
airportApiClient.interceptors.response.use(
  (response) => response,
  responseErrorInterceptor
);

// Add interceptors to Flights/Billing API client
flightsApiClient.interceptors.request.use(requestInterceptor);
flightsApiClient.interceptors.response.use(
  (response) => response,
  responseErrorInterceptor
);

export default { airportApiClient, flightsApiClient };
