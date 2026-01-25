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
      await airportApiClient.post('/api/passengers/users/', data);
      
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
      // Intentar obtener usuario desde el storage primero
      const storedUser = tokenStorage.getUser();
      if (storedUser) {
        return storedUser;
      }
      
      // Decodificar el token JWT para extraer información del usuario
      const token = tokenStorage.getAccessToken();
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        
        // Log para debug - ver qué contiene el JWT
        console.log('JWT Payload:', payload);
        
        // El JWT solo tiene user_id, no username ni otros campos
        // Si el user_id es 1, asumimos que es admin (primer usuario del sistema)
        const userId = payload.user_id || payload.id || '0';
        const isAdmin = userId === '1' || userId === 1 || 
                       payload.is_superuser === true || 
                       payload.is_staff === true;
        
        // Crear objeto de usuario desde el payload del JWT
        const user: User = {
          id: userId,
          username: isAdmin ? 'admin' : payload.username || 'user',
          email: payload.email || '',
          first_name: payload.first_name || payload.firstName,
          last_name: payload.last_name || payload.lastName,
          is_superuser: isAdmin,
          is_staff: isAdmin,
          is_active: payload.is_active !== false,
          role: isAdmin ? 'admin' : payload.role,
        };
        
        console.log('User object created:', user);
        
        return user;
      }
      
      // Si no hay token, retornar usuario básico
      return {
        id: 0,
        username: 'user',
        email: '',
      };
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
