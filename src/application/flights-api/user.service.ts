import { flightsApiClient } from '../../infrastructure/http/httpClients';
import { UserProfile } from '../../domain/flights-api/flights-api.types';

export const userService = {
  async getAllUsers(): Promise<UserProfile[]> {
    const response = await flightsApiClient.get<UserProfile[]>('/api/users/');
    return response.data;
  },

  async getUserById(id: number): Promise<UserProfile> {
    const response = await flightsApiClient.get<UserProfile>(`/api/users/${id}/`);
    return response.data;
  },

  async updateUser(id: number, user: Partial<UserProfile>): Promise<UserProfile> {
    const response = await flightsApiClient.put<UserProfile>(`/api/users/${id}/`, user);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await flightsApiClient.delete(`/api/users/${id}/`);
  },
};
