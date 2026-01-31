import { airportApiClient } from '../../infrastructure/http/httpClients';
import { Booking, BookingCreate } from '../../domain/airport-api/airport-api.types';

export const bookingService = {
  async getAllBookings(params?: { status?: string; passenger?: number; flight?: number }): Promise<Booking[]> {
    try {
      const response = await airportApiClient.get<any>('/api/bookings/', { params });
      console.log('Bookings response:', response.data);
      console.log('Bookings response type:', typeof response.data);
      console.log('Is array?', Array.isArray(response.data));
      console.log('Has results?', response.data?.results);
      
      // Manejar diferentes formatos de respuesta
      if (Array.isArray(response.data)) {
        console.log('Returning direct array, length:', response.data.length);
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        // Paginación DRF
        console.log('Returning results array (DRF pagination), length:', response.data.results.length);
        console.log('Results:', response.data.results);
        return response.data.results;
      } else if (response.data && response.data.data) {
        console.log('Returning data array');
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      
      console.log('No valid format found, returning empty array');
      return [];
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      console.error('Error details:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
    }
  },

  async getBookingById(id: number): Promise<Booking> {
    try {
      const response = await airportApiClient.get<Booking>(`/api/bookings/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching booking:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch booking');
    }
  },

  async getBookingByReference(reference: string): Promise<Booking> {
    try {
      const response = await airportApiClient.get<Booking>(`/api/bookings/reference/${reference}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching booking by reference:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch booking');
    }
  },

  async createBooking(booking: BookingCreate): Promise<Booking> {
    try {
      const response = await airportApiClient.post<Booking>('/api/bookings/', booking);
      return response.data;
    } catch (error: any) {
      console.error('Error creating booking:', error);
      throw new Error(error.response?.data?.message || 'Failed to create booking');
    }
  },

  async updateBooking(id: number, booking: Partial<BookingCreate>): Promise<Booking> {
    try {
      const response = await airportApiClient.put<Booking>(`/api/bookings/${id}/`, booking);
      return response.data;
    } catch (error: any) {
      console.error('Error updating booking:', error);
      throw new Error(error.response?.data?.message || 'Failed to update booking');
    }
  },

  async patchBooking(id: number, booking: Partial<BookingCreate>): Promise<Booking> {
    try {
      console.log('PATCH booking request:', { id, data: booking });
      const response = await airportApiClient.patch<Booking>(`/api/bookings/${id}/`, booking);
      console.log('PATCH booking response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error patching booking:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      
      // Extraer mensaje de error detallado
      let errorMessage = 'Failed to patch booking';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          // Errores de validación de campos
          const errors = Object.entries(error.response.data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('; ');
          if (errors) errorMessage = errors;
        }
      }
      
      throw new Error(errorMessage);
    }
  },

  async cancelBooking(id: number): Promise<Booking> {
    try {
      const response = await airportApiClient.post<Booking>(`/api/bookings/${id}/cancel/`, {});
      return response.data;
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel booking');
    }
  },

  async confirmBooking(id: number): Promise<Booking> {
    try {
      const response = await airportApiClient.post<Booking>(`/api/bookings/${id}/confirm/`, {});
      return response.data;
    } catch (error: any) {
      console.error('Error confirming booking:', error);
      throw new Error(error.response?.data?.message || 'Failed to confirm booking');
    }
  },

  async deleteBooking(id: number): Promise<void> {
    try {
      await airportApiClient.delete(`/api/bookings/${id}/`);
    } catch (error: any) {
      console.error('Error deleting booking:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete booking');
    }
  },
};

export default bookingService;
