import { flightsApiClient } from '../../infrastructure/http/httpClients';
import { UserProfile, UserProfileUpdate } from '../../domain/flights-api/flights-api.types';

export const userService = {
  async getAllUsers(params?: { is_active?: boolean; search?: string }): Promise<UserProfile[]> {
    try {
      const response = await flightsApiClient.get<UserProfile[]>('/api/users/', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  async getUserById(id: number): Promise<UserProfile> {
    try {
      const response = await flightsApiClient.get<UserProfile>(`/api/users/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  },

  async getCurrentUser(): Promise<UserProfile> {
    try {
      const response = await flightsApiClient.get<UserProfile>('/api/users/me/');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching current user:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch current user');
    }
  },

  async updateUser(id: number, user: UserProfileUpdate): Promise<UserProfile> {
    try {
      const response = await flightsApiClient.put<UserProfile>(`/api/users/${id}/`, user);
      return response.data;
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  },

  async patchUser(id: number, user: Partial<UserProfileUpdate>): Promise<UserProfile> {
    try {
      const response = await flightsApiClient.patch<UserProfile>(`/api/users/${id}/`, user);
      return response.data;
    } catch (error: any) {
      console.error('Error patching user:', error);
      throw new Error(error.response?.data?.message || 'Failed to patch user');
    }
  },

  async updateCurrentUser(user: UserProfileUpdate): Promise<UserProfile> {
    try {
      const response = await flightsApiClient.patch<UserProfile>('/api/users/me/', user);
      return response.data;
    } catch (error: any) {
      console.error('Error updating current user:', error);
      throw new Error(error.response?.data?.message || 'Failed to update user profile');
    }
  },

  async deactivateUser(id: number): Promise<UserProfile> {
    try {
      const response = await flightsApiClient.post<UserProfile>(`/api/users/${id}/deactivate/`, {});
      return response.data;
    } catch (error: any) {
      console.error('Error deactivating user:', error);
      throw new Error(error.response?.data?.message || 'Failed to deactivate user');
    }
  },

  async activateUser(id: number): Promise<UserProfile> {
    try {
      const response = await flightsApiClient.post<UserProfile>(`/api/users/${id}/activate/`, {});
      return response.data;
    } catch (error: any) {
      console.error('Error activating user:', error);
      throw new Error(error.response?.data?.message || 'Failed to activate user');
    }
  },

  async deleteUser(id: number): Promise<void> {
    try {
      await flightsApiClient.delete(`/api/users/${id}/`);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  },
};

export default userService;
