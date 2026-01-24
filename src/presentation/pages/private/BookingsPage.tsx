import { useEffect, useState } from 'react';
import { PrivateLayout } from '../../layouts/PrivateLayout';
import { bookingService } from '../../../application/airport-api/booking.service';
import { flightService } from '../../../application/airport-api/flight.service';
import { passengerService } from '../../../application/airport-api/passenger.service';
import { Booking, BookingCreate, Flight, Passenger } from '../../../domain/airport-api/airport-api.types';
import { useRole } from '../../../application/auth/useRole';

export const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [formData, setFormData] = useState<BookingCreate>({
    flight: 0,
    passenger: 0,
    seat_number: '',
    total_price: 0,
    status: 'pending',
  });
  const { canCreate, canDelete, role } = useRole();

  useEffect(() => {
    loadBookings();
    loadFlights();
    loadPassengers();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await bookingService.getAllBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFlights = async () => {
    try {
      const data = await flightService.getAllFlights();
      setFlights(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading flights:', err);
    }
  };

  const loadPassengers = async () => {
    try {
      const data = await passengerService.getAllPassengers();
      setPassengers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading passengers:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await bookingService.createBooking(formData);
      alert('✅ Reserva creada exitosamente!');
      setShowModal(false);
      setFormData({
        flight: 0,
        passenger: 0,
        seat_number: '',
        total_price: 0,
        status: 'pending',
      });
      loadBookings();
    } catch (err: any) {
      console.error('Error creating booking:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Error desconocido';
      alert(`❌ Error al crear reserva: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de cancelar esta reserva?')) return;
    try {
      await bookingService.deleteBooking(id);
      alert('✅ Reserva cancelada');
      loadBookings();
    } catch (err) {
      console.error('Error deleting booking:', err);
      alert('❌ Error al cancelar reserva');
    }
  };

  return (
    <PrivateLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🎫 Reservas</h1>
            <p className="text-sm text-gray-500 mt-1">Tu rol: {role}</p>
          </div>
          {canCreate() && (
            <button 
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              + Nueva Reserva
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Passenger</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{booking.booking_reference}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{booking.passenger_name || booking.passenger}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(booking.booking_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">${booking.total_price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                      {canDelete() && (
                        <button 
                          onClick={() => handleDelete(booking.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Crear Reserva */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Nueva Reserva</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vuelo</label>
                    <select
                      required
                      value={formData.flight}
                      onChange={(e) => setFormData({...formData, flight: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={0}>Seleccione un vuelo</option>
                      {flights.map(flight => (
                        <option key={flight.id} value={flight.id}>
                          {flight.flight_number} - {flight.origin_airport_name || `Airport ${flight.origin_airport}`} → {flight.destination_airport_name || `Airport ${flight.destination_airport}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pasajero</label>
                    <select
                      required
                      value={formData.passenger}
                      onChange={(e) => setFormData({...formData, passenger: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={0}>Seleccione un pasajero</option>
                      {passengers.map(passenger => (
                        <option key={passenger.id} value={passenger.id}>
                          {passenger.first_name} {passenger.last_name} - {passenger.passport_number}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Número de Asiento</label>
                    <input
                      type="text"
                      value={formData.seat_number}
                      onChange={(e) => setFormData({...formData, seat_number: e.target.value.toUpperCase()})}
                      placeholder="12A"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio Total ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.total_price}
                      onChange={(e) => setFormData({...formData, total_price: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Guardar Reserva'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PrivateLayout>
  );
};
