import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PrivateLayout } from '../../layouts/PrivateLayout';
import { bookingService } from '../../../application/airport-api/booking.service';
import { flightService } from '../../../application/airport-api/flight.service';
import { passengerService } from '../../../application/airport-api/passenger.service';
import { Booking, BookingCreate, Flight, Passenger } from '../../../domain/airport-api/airport-api.types';
import { useRole } from '../../../application/auth/useRole';
import { useAuth } from '../../../application/auth/useAuth';

export const BookingsPage = () => {
  const location = useLocation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [saving, setSaving] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [currentPassenger, setCurrentPassenger] = useState<Passenger | null>(null);
  const [formData, setFormData] = useState<BookingCreate>({
    flight: 0,
    passenger: 0,
    seat_number: '',
    total_price: 0,
    status: 'pending',
  });
  const { canCreate, canDelete, role } = useRole();
  const { user } = useAuth();

  useEffect(() => {
    const init = async () => {
      await loadPassengers();
      await loadFlights();
    };
    init();
  }, []);

  useEffect(() => {
    if (passengers.length > 0 && user) {
      identifyCurrentPassenger();
    }
  }, [passengers, user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Para ADMIN/EDITOR/OPERADOR: cargar inmediatamente
    // Para CLIENTE: esperar a que se identifique el pasajero
    if (role !== 'CLIENTE') {
      loadBookings();
    } else if (currentPassenger) {
      loadBookings();
    }
  }, [currentPassenger, role, location]); // eslint-disable-line react-hooks/exhaustive-deps

  const identifyCurrentPassenger = () => {
    if (!user) return;
    const found = passengers.find(p => p.user === Number(user.id) || p.email === user.email);
    if (found) {
      setCurrentPassenger(found);
      console.log('Current passenger identified:', found);
    }
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: Record<string, any> = {};
      
      // Si es cliente, filtrar por su ID de pasajero
      if (role === 'CLIENTE') {
        if (!currentPassenger) {
          // Si no se encuentra el pasajero, no cargar nada aún
          setLoading(false);
          setBookings([]);
          return;
        }
        params.passenger = currentPassenger.id;
      }

      const data = await bookingService.getAllBookings(params);
      
      // Filtrado adicional en el cliente si la API no filtra
      let filteredData = Array.isArray(data) ? data : [];
      if (role === 'CLIENTE' && currentPassenger) {
        filteredData = filteredData.filter(b => b.passenger === currentPassenger.id);
      }
      
      setBookings(filteredData);
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

  const handlePay = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowPaymentModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const bookingData = {
        ...formData,
        passenger: role === 'CLIENTE' && currentPassenger ? currentPassenger.id : formData.passenger
      };
      
      if (editingBooking) {
        // Usar PATCH en lugar de PUT para actualización parcial
        await bookingService.patchBooking(editingBooking.id, bookingData);
        alert('✅ Reserva actualizada exitosamente!');
      } else {
        await bookingService.createBooking(bookingData);
        alert('✅ Reserva creada exitosamente!');
      }
      
      setShowModal(false);
      setEditingBooking(null);
      setFormData({
        flight: 0,
        passenger: 0,
        seat_number: '',
        total_price: 0,
        status: 'pending',
      });
      loadBookings();
    } catch (err) {
      console.error('Error saving booking:', err);
      const error = err as { response?: { data?: any }; message?: string };
      
      // Extraer mensaje de error más detallado
      let errorMsg = 'Error desconocido';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else if (error.response.data.detail) {
          errorMsg = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message;
        } else {
          // Mostrar errores de validación de campos
          const errors = Object.entries(error.response.data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('\n');
          errorMsg = errors || error.message || 'Error desconocido';
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      alert(`❌ Error al ${editingBooking ? 'actualizar' : 'crear'} reserva:\n${errorMsg}`);
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

  const handleEdit = (booking: Booking) => {
    // Solo permitir editar reservas pendientes
    if (booking.status.toLowerCase() !== 'pending') {
      alert('⚠️ Solo se pueden editar reservas en estado PENDIENTE');
      return;
    }
    
    setEditingBooking(booking);
    setFormData({
      flight: booking.flight,
      passenger: booking.passenger,
      seat_number: booking.seat_number,
      total_price: booking.total_price,
      status: booking.status,
    });
    setShowModal(true);
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const handlePaymentConfirm = async (paymentData: { cardNumber: string; cardName: string; expiryDate: string; cvv: string }) => {
    if (!selectedBooking) return;
    
    try {
      console.log('Procesando pago para reserva:', selectedBooking.id);
      console.log('Datos de pago:', paymentData);
      
      // Intentar usar confirmBooking primero
      try {
        await bookingService.confirmBooking(selectedBooking.id);
      } catch (e) {
        // Fallback si confirmBooking no está implementado o falla
        console.warn('confirmBooking falló, intentando update manual', e);
        const updateData: BookingCreate = {
          flight: selectedBooking.flight,
          passenger: selectedBooking.passenger,
          seat_number: selectedBooking.seat_number,
          total_price: selectedBooking.total_price,
          status: 'confirmed'
        };
        await bookingService.updateBooking(selectedBooking.id, updateData);
      }
      
      alert('✅ Pago procesado exitosamente!\n\nTu reserva ha sido confirmada.');
      
      setShowPaymentModal(false);
      setSelectedBooking(null);
      loadBookings();
    } catch (error) {
      console.error('Error al procesar pago:', error);
      alert('❌ Error al procesar el pago. Por favor intenta de nuevo.');
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
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              + Nueva Reserva
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando reservas...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pasajero</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{booking.booking_code}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{booking.passenger_name || booking.passenger}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(booking.booking_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status === 'pending' ? 'PENDIENTE' : booking.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">${booking.total_price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {(booking.status.toLowerCase() === 'pending') && role === 'CLIENTE' && (
                        <button
                          onClick={() => handlePay(booking)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Pagar
                        </button>
                      )}
                      <button 
                        onClick={() => handleViewDetails(booking)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Ver
                      </button>
                      {(role === 'ADMIN' || role === 'EDITOR') && booking.status.toLowerCase() === 'pending' && (
                        <button 
                          onClick={() => handleEdit(booking)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Editar
                        </button>
                      )}
                      {(canDelete() || (role === 'CLIENTE' && booking.status === 'pending')) && (
                        <button 
                          onClick={() => handleDelete(booking.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
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
              <h2 className="text-2xl font-bold mb-4">{editingBooking ? '✏️ Editar Reserva' : '➕ Nueva Reserva'}</h2>
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
                          {passenger.first_name} {passenger.last_name} - {passenger.document_number}
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
                  {editingBooking && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                      <select
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="confirmed">Confirmada</option>
                        <option value="cancelled">Cancelada</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingBooking(null);
                      setFormData({
                        flight: 0,
                        passenger: 0,
                        seat_number: '',
                        total_price: 0,
                        status: 'pending',
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : (editingBooking ? 'Actualizar Reserva' : 'Guardar Reserva')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Ver Detalles */}
        {showDetailModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Detalles de la Reserva</h2>
                  <button 
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-3">Información de la Reserva</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Referencia</p>
                      <p className="font-semibold text-gray-900">{selectedBooking.booking_reference}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estado</p>
                      <span className={`inline-block px-3 py-1 text-sm rounded-full font-semibold ${
                        selectedBooking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                        selectedBooking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                        selectedBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedBooking.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fecha de Reserva</p>
                      <p className="font-semibold text-gray-900">{new Date(selectedBooking.booking_date).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Asiento</p>
                      <p className="font-semibold text-gray-900">{selectedBooking.seat_number || 'No asignado'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Información del Pasajero</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Nombre</p>
                      <p className="font-semibold text-gray-900">{selectedBooking.passenger_name || `ID: ${selectedBooking.passenger}`}</p>
                    </div>
                    {selectedBooking.passenger_details && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-semibold text-gray-900">{selectedBooking.passenger_details.email || 'No disponible'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Teléfono</p>
                          <p className="font-semibold text-gray-900">{selectedBooking.passenger_details.phone || 'No disponible'}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">Información del Vuelo</h3>
                  {selectedBooking.flight_details ? (
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Número de Vuelo</p>
                        <p className="font-semibold text-gray-900">{selectedBooking.flight_details.flight_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Ruta</p>
                        <p className="font-semibold text-gray-900">
                          {selectedBooking.flight_details.origin_airport_name || `Airport ${selectedBooking.flight_details.origin_airport}`} 
                          {' → '}
                          {selectedBooking.flight_details.destination_airport_name || `Airport ${selectedBooking.flight_details.destination_airport}`}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Salida</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(selectedBooking.flight_details.departure_time).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Llegada</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(selectedBooking.flight_details.arrival_time).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600">Vuelo ID: {selectedBooking.flight}</p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">Total Pagado</h3>
                    <p className="text-3xl font-bold text-green-600">${selectedBooking.total_price}</p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Pago */}
        {showPaymentModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">💳 Pagar Reserva</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Reserva</p>
                <p className="font-bold text-lg">{selectedBooking.booking_code}</p>
                <p className="text-2xl font-bold text-green-600 mt-2">${selectedBooking.total_price}</p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handlePaymentConfirm({
                  cardNumber: formData.get('cardNumber') as string,
                  cardName: formData.get('cardName') as string,
                  expiryDate: formData.get('expiryDate') as string,
                  cvv: formData.get('cvv') as string,
                });
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Número de Tarjeta *</label>
                  <input
                    type="text"
                    name="cardNumber"
                    required
                    placeholder="1234 5678 9012 3456"
                    maxLength={16}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Nombre en la Tarjeta *</label>
                  <input
                    type="text"
                    name="cardName"
                    required
                    placeholder="NOMBRE APELLIDO"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Vencimiento *</label>
                    <input
                      type="text"
                      name="expiryDate"
                      required
                      placeholder="MM/AA"
                      maxLength={5}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">CVV *</label>
                    <input
                      type="text"
                      name="cvv"
                      required
                      placeholder="123"
                      maxLength={3}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                  🔒 Esta es una simulación de pago para fines educativos.
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    💳 Pagar ${selectedBooking.total_price}
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
