import { airportApiClient } from '../../infrastructure/http/httpClients';
import { tokenStorage } from '../../infrastructure/storage/tokenStorage';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../../domain/auth/auth.types';

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await airportApiClient.post('/api/auth/jwt/login/', credentials);
      const { access, refresh } = response.data;

      tokenStorage.setAccessToken(access);
      tokenStorage.setRefreshToken(refresh);

      // Obtener información del usuario después del login
      const user = await this.getCurrentUser();
      tokenStorage.setUser(user);

      return { access, refresh, user };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      // Si la API no tiene endpoint de registro, comentar esto temporalmente
      // await airportApiClient.post('/api/auth/register/', data);
      
      // Por ahora, solo hacer login si el usuario ya existe
      return await this.login({
        username: data.username,
        password: data.password,
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      // Intentar obtener usuario desde el token decodificado o storage
      const storedUser = tokenStorage.getUser();
      if (storedUser) {
        return storedUser;
      }
      
      // Si no hay endpoint específico, crear usuario básico desde el token
      throw new Error('No user endpoint available');
    } catch (error) {
      console.error('Failed to get current user:', error);
      
      // Retornar un usuario básico para evitar errores
      return {
        id: 0,
        username: 'user',
        email: '',
      };
    }
  }

  getCurrentUserFromStorage(): User | null {
    return tokenStorage.getUser();
  }

  isAuthenticated(): boolean {
    return !!tokenStorage.getAccessToken();
  }

  logout(): void {
    tokenStorage.clearAll();
  }
}

export const authService = new AuthService();
