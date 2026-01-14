import { flightsApiClient } from '../../infrastructure/http/httpClients';
import { tokenStorage } from '../../infrastructure/storage/tokenStorage';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../../domain/auth/auth.types';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await flightsApiClient.post<AuthResponse>('/api/token/', credentials);
    
    const { access, refresh, user } = response.data;
    
    tokenStorage.setAccessToken(access);
    tokenStorage.setRefreshToken(refresh);
    tokenStorage.setUser(user);
    
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await flightsApiClient.post<AuthResponse>('/api/users/register/', data);
    
    const { access, refresh, user } = response.data;
    
    tokenStorage.setAccessToken(access);
    tokenStorage.setRefreshToken(refresh);
    tokenStorage.setUser(user);
    
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await flightsApiClient.get<User>('/api/users/me/');
    return response.data;
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
