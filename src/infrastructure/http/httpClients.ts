import axios, { AxiosInstance, AxiosError } from 'axios';
import { tokenStorage } from '../storage/tokenStorage';

// Variables de entorno para URLs de API
const AIRPORT_API_URL = import.meta.env.VITE_AIRPORT_API_URL || 'http://localhost:8000';
const BILLING_API_URL = import.meta.env.VITE_BILLING_API_URL || 'http://localhost:8001';

// Crear instancia de axios para API de Aeropuerto
export const airportApiClient: AxiosInstance = axios.create({
  baseURL: AIRPORT_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Crear instancia de axios para API de Vuelos/Facturación
export const flightsApiClient: AxiosInstance = axios.create({
  baseURL: BILLING_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Interceptor de solicitud para agregar token de autenticación
const requestInterceptor = (config: any) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Interceptor de respuesta para manejar errores de autenticación
const responseErrorInterceptor = async (error: AxiosError) => {
  const originalRequest: any = error.config;

  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        // Intentar refrescar el token usando la API de facturación
        const response = await axios.post(`${BILLING_API_URL}/api/auth/jwt/refresh/`, {
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

// Agregar interceptores al cliente de API de Aeropuerto
airportApiClient.interceptors.request.use(requestInterceptor);
airportApiClient.interceptors.response.use(
  (response) => response,
  responseErrorInterceptor
);

// Agregar interceptores al cliente de API de Vuelos/Facturación
flightsApiClient.interceptors.request.use(requestInterceptor);
flightsApiClient.interceptors.response.use(
  (response) => response,
  responseErrorInterceptor
);

export default { airportApiClient, flightsApiClient };
