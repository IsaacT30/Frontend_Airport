import { airportApiClient } from '../../infrastructure/http/httpClients';
import { Booking } from '../../domain/airport-api/airport-api.types';

export const bookingService = {
  async getAllBookings(): Promise<Booking[]> {
    const response = await airportApiClient.get<Booking[]>('/api/bookings/');
    return response.data;
  },

  async getBookingById(id: number): Promise<Booking> {
    const response = await airportApiClient.get<Booking>(`/api/bookings/${id}/`);
    return response.data;
  },

  async createBooking(booking: Omit<Booking, 'id' | 'booking_reference'>): Promise<Booking> {
    const response = await airportApiClient.post<Booking>('/api/bookings/', booking);
    return response.data;
  },

  async updateBooking(id: number, booking: Partial<Booking>): Promise<Booking> {
    const response = await airportApiClient.put<Booking>(`/api/bookings/${id}/`, booking);
    return response.data;
  },

  async cancelBooking(id: number): Promise<Booking> {
    const response = await airportApiClient.patch<Booking>(`/api/bookings/${id}/cancel/`);
    return response.data;
  },

  async deleteBooking(id: number): Promise<void> {
    await airportApiClient.delete(`/api/bookings/${id}/`);
  },
};
