import { airportApiClient } from '../../infrastructure/http/httpClients';
import { Passenger, PassengerCreate } from '../../domain/airport-api/airport-api.types';

export const passengerService = {
  async getAllPassengers(params?: { search?: string }): Promise<Passenger[]> {
    try {
      const response = await airportApiClient.get<any>('/api/passengers/', { params });
      console.log('Passengers response:', response.data);
      
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      } else if (response.data && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      
      return [];
    } catch (error: any) {
      console.error('Error fetching passengers:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch passengers');
    }
  },

  async getPassengerById(id: number): Promise<Passenger> {
    try {
      const response = await airportApiClient.get<Passenger>(`/api/passengers/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching passenger:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch passenger');
    }
  },

  async searchPassengers(query: string): Promise<Passenger[]> {
    try {
      const response = await airportApiClient.get<Passenger[]>('/api/passengers/', {
        params: { search: query },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error searching passengers:', error);
      throw new Error(error.response?.data?.message || 'Failed to search passengers');
    }
  },

  async createPassenger(passenger: PassengerCreate): Promise<Passenger> {
    try {
      const response = await airportApiClient.post<Passenger>('/api/passengers/', passenger);
      return response.data;
    } catch (error: any) {
      console.error('Error creating passenger:', error);
      throw new Error(error.response?.data?.message || 'Failed to create passenger');
    }
  },

  async updatePassenger(id: number, passenger: Partial<PassengerCreate>): Promise<Passenger> {
    try {
      const response = await airportApiClient.put<Passenger>(`/api/passengers/${id}/`, passenger);
      return response.data;
    } catch (error: any) {
      console.error('Error updating passenger:', error);
      throw new Error(error.response?.data?.message || 'Failed to update passenger');
    }
  },

  async patchPassenger(id: number, passenger: Partial<PassengerCreate>): Promise<Passenger> {
    try {
      const response = await airportApiClient.patch<Passenger>(`/api/passengers/${id}/`, passenger);
      return response.data;
    } catch (error: any) {
      console.error('Error patching passenger:', error);
      throw new Error(error.response?.data?.message || 'Failed to patch passenger');
    }
  },

  async deletePassenger(id: number): Promise<void> {
    try {
      await airportApiClient.delete(`/api/passengers/${id}/`);
    } catch (error: any) {
      console.error('Error deleting passenger:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete passenger');
    }
  },
};

export default passengerService;
