import { airportApiClient } from '../../infrastructure/http/httpClients';
import { tokenStorage } from '../../infrastructure/storage/tokenStorage';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../../domain/auth/auth.types';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('Attempting login with username:', credentials.username);
    
    try {
      const response = await airportApiClient.post<any>('/api/auth/jwt/login/', credentials);
      console.log('Login response:', response.data);
      
      const { access, refresh, user } = response.data;
      
      if (!access || !refresh) {
        throw new Error('Invalid response from server: missing tokens');
      }
      
      tokenStorage.setAccessToken(access);
      tokenStorage.setRefreshToken(refresh);
      
      // Si el usuario viene en la respuesta, guardarlo
      let currentUser: User;
      if (user) {
        currentUser = user;
        tokenStorage.setUser(user);
      } else {
        // Si no viene, crear un usuario básico desde el token
        currentUser = {
          id: 0,
          username: credentials.username,
          email: '',
        };
        tokenStorage.setUser(currentUser);
      }
      
      console.log('Login successful, tokens stored');
      return { access, refresh, user: currentUser };
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await airportApiClient.post<AuthResponse>('/api/auth/register/', data);
    
    const { access, refresh, user } = response.data;
    
    tokenStorage.setAccessToken(access);
    tokenStorage.setRefreshToken(refresh);
    
    if (user) {
      tokenStorage.setUser(user);
    }
    
    return response.data;
  },

  async getCurrentUser(): Promise<User | null> {
    // Como no existe el endpoint /api/users/me/, retornar el usuario del storage
    return tokenStorage.getUser();
  },

  logout(): void {
    tokenStorage.clearAll();
  },

  isAuthenticated(): boolean {
    return !!tokenStorage.getAccessToken();
  },

  getCurrentUserFromStorage(): User | null {
    return tokenStorage.getUser();
  }
};
