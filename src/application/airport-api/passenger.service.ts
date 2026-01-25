import { airportApiClient } from '../../infrastructure/http/httpClients';
import { Passenger, PassengerCreate } from '../../domain/airport-api/airport-api.types';

export const passengerService = {
  async getAllPassengers(params?: { search?: string }): Promise<Passenger[]> {
    try {
      const response = await airportApiClient.get<any>('/api/passengers/passengers/', { params });
      console.log('Passengers API response:', response);
      console.log('Passengers response.data:', response.data);
      console.log('Type of response.data:', typeof response.data);
      console.log('Keys in response.data:', Object.keys(response.data || {}));
      
      // Intentar diferentes formatos de respuesta
      let passengers: Passenger[] = [];
      
      if (Array.isArray(response.data)) {
        console.log('Response is direct array, length:', response.data.length);
        passengers = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        console.log('Response has results array (DRF pagination), length:', response.data.results.length);
        passengers = response.data.results;
      } else if (response.data && Array.isArray(response.data.data)) {
        console.log('Response has data array, length:', response.data.data.length);
        passengers = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        console.log('Response is object, trying to find array in values...');
        // Buscar un array en cualquier propiedad del objeto
        const values = Object.values(response.data);
        const arrayValue = values.find(v => Array.isArray(v));
        if (arrayValue && Array.isArray(arrayValue)) {
          console.log('Found array in object values, length:', arrayValue.length);
          passengers = arrayValue;
        }
      }
      
      console.log('Final passengers array, length:', passengers.length);
      console.log('Passengers:', passengers);
      return passengers;
    } catch (error: any) {
      console.error('Error fetching passengers:', error);
      console.error('Error details:', error.response);
      throw error;
    }
  },

  async getPassengerById(id: number): Promise<Passenger> {
    try {
      const response = await airportApiClient.get<Passenger>(`/api/passengers/passengers/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching passenger:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch passenger');
    }
  },

  async searchPassengers(query: string): Promise<Passenger[]> {
    try {
      const response = await airportApiClient.get<Passenger[]>('/api/passengers/passengers/', {
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
      console.log('Creating passenger request:', passenger);
      console.log('Request URL:', airportApiClient.defaults.baseURL + '/api/passengers/passengers/');
      const response = await airportApiClient.post<Passenger>('/api/passengers/passengers/', passenger);
      console.log('Create passenger response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating passenger:', error);
      console.error('Error response:', error.response);
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Data:', error.response?.data);
      console.error('Headers:', error.response?.headers);
      throw error;
    }
  },

  async updatePassenger(id: number, passenger: Partial<PassengerCreate>): Promise<Passenger> {
    try {
      console.log('Updating passenger:', id, passenger);
      const response = await airportApiClient.put<Passenger>(`/api/passengers/passengers/${id}/`, passenger);
      console.log('Update passenger response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating passenger:', error);
      console.error('Error response:', error.response);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      throw error;
    }
  },

  async patchPassenger(id: number, passenger: Partial<PassengerCreate>): Promise<Passenger> {
    try {
      const response = await airportApiClient.patch<Passenger>(`/api/passengers/passengers/${id}/`, passenger);
      return response.data;
    } catch (error: any) {
      console.error('Error patching passenger:', error);
      throw new Error(error.response?.data?.message || 'Failed to patch passenger');
    }
  },

  async deletePassenger(id: number): Promise<void> {
    try {
      await airportApiClient.delete(`/api/passengers/passengers/${id}/`);
    } catch (error: any) {
      console.error('Error deleting passenger:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete passenger');
    }
  },
};

export default passengerService;
