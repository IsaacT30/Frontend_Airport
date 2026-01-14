import { airportApiClient } from '../../infrastructure/http/httpClients';
import { Passenger } from '../../domain/airport-api/airport-api.types';

export const passengerService = {
  async getAllPassengers(): Promise<Passenger[]> {
    const response = await airportApiClient.get<Passenger[]>('/api/passengers/');
    return response.data;
  },

  async getPassengerById(id: number): Promise<Passenger> {
    const response = await airportApiClient.get<Passenger>(`/api/passengers/${id}/`);
    return response.data;
  },

  async createPassenger(passenger: Omit<Passenger, 'id'>): Promise<Passenger> {
    const response = await airportApiClient.post<Passenger>('/api/passengers/', passenger);
    return response.data;
  },

  async updatePassenger(id: number, passenger: Partial<Passenger>): Promise<Passenger> {
    const response = await airportApiClient.put<Passenger>(`/api/passengers/${id}/`, passenger);
    return response.data;
  },

  async deletePassenger(id: number): Promise<void> {
    await airportApiClient.delete(`/api/passengers/${id}/`);
  },
};
