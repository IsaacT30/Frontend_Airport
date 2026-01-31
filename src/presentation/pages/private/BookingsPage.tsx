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
    travel_class: 'ECONOMY',
    checked_baggage: 0,
    carry_on_baggage: 0,
    meal_preference: '',
    special_requests: '',
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

  useEffect(() => {
    if (!editingBooking && formData.flight) {
      const selectedFlight = getFlightById(formData.flight);
      const price = getFlightPrice(selectedFlight);
      if (price > 0) {
        setFormData(prev => ({ ...prev, total_price: price }));
      }
    }
  }, [formData.flight, editingBooking, flights]);

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

  const getFlightById = (flightId: number) => flights.find(f => f.id === flightId);

  const getFlightPrice = (flight?: Flight) => {
    if (!flight) return 0;
    return Number(flight.price ?? flight.base_price ?? 0);
  };

  const getBookingTotal = (booking: Booking) => {
    if (booking.total_price && booking.total_price > 0) {
      return booking.total_price;
    }
    const bookingFlight = booking.flight_details || getFlightById(booking.flight);
    return getFlightPrice(bookingFlight);
  };

  const getFlightUpdateBlockReason = (flight?: Flight) => {
    if (!flight) return '';
    const status = flight.status;
    if (status === 'DEPARTED' || status === 'IN_FLIGHT' || status === 'LANDED' || status === 'ARRIVED') {
      return `El estado del vuelo es ${status}.`;
    }
    const departureTime = new Date(flight.departure_time).getTime();
    if (!Number.isNaN(departureTime) && departureTime <= Date.now()) {
      const formatted = new Date(flight.departure_time).toLocaleString('es-ES');
      return `La hora de salida ya pasó (${formatted}).`;
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingBooking) {
        let editingFlight = editingBooking.flight_details || getFlightById(editingBooking.flight);
        try {
          const latestFlight = await flightService.getFlightById(editingBooking.flight);
          editingFlight = latestFlight || editingFlight;
        } catch (fetchError) {
          console.warn('No se pudo obtener el vuelo actualizado, usando datos locales.', fetchError);
        }
        const blockReason = getFlightUpdateBlockReason(editingFlight);
        if (blockReason) {
          alert(`❌ No se puede actualizar una reserva de un vuelo que ya partió.\n${blockReason}`);
          return;
        }
        // Para edición, NO enviar flight ni passenger ya que no se pueden modificar
        // y el backend puede aplicar validaciones que ya no aplican (ej: vuelo ya partió)
        const updateData: any = {
          seat_number: formData.seat_number,
          travel_class: formData.travel_class,
          checked_baggage: formData.checked_baggage,
          carry_on_baggage: formData.carry_on_baggage,
          meal_preference: formData.meal_preference,
          special_requests: formData.special_requests,
        };
        
        // Solo ADMIN puede cambiar el estado y el precio
        if (role === 'ADMIN') {
          updateData.status = formData.status;
          updateData.total_price = Number(formData.total_price);
        }
        
        console.log('Updating booking ID:', editingBooking.id);
        console.log('Update data:', updateData);
        
        const result = await bookingService.patchBooking(editingBooking.id, updateData);
        console.log('Update result:', result);
        
        alert('✅ Reserva actualizada exitosamente!');
      } else {
        // Para creación, enviar todos los datos
        const bookingData = {
          ...formData,
          passenger: role === 'CLIENTE' && currentPassenger ? currentPassenger.id : formData.passenger,
          total_price: Number(formData.total_price),
        };
        
        console.log('Creating booking with data:', bookingData);
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
        travel_class: 'ECONOMY',
        checked_baggage: 0,
        carry_on_baggage: 0,
        meal_preference: '',
        special_requests: '',
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

  const handleEdit = async (booking: Booking) => {
    let editingFlight = booking.flight_details || getFlightById(booking.flight);
    try {
      const latestFlight = await flightService.getFlightById(booking.flight);
      editingFlight = latestFlight || editingFlight;
    } catch (fetchError) {
      console.warn('No se pudo obtener el vuelo actualizado, usando datos locales.', fetchError);
    }
    const blockReason = getFlightUpdateBlockReason(editingFlight);
    if (blockReason) {
      alert(`❌ No se puede editar una reserva de un vuelo que ya partió.\n${blockReason}`);
      return;
    }

    setEditingBooking(booking);
    setFormData({
      flight: booking.flight,
      passenger: booking.passenger,
      seat_number: booking.seat_number || '',
      total_price: getBookingTotal(booking),
      status: booking.status,
      travel_class: booking.travel_class || 'ECONOMY',
      checked_baggage: booking.checked_baggage || 0,
      carry_on_baggage: booking.carry_on_baggage || 0,
      meal_preference: booking.meal_preference || '',
      special_requests: booking.special_requests || '',
    });
    setShowModal(true);
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const handlePaymentConfirm = async (paymentData: { 
    paymentMethod: string;
    cardNumber?: string; 
    cardName?: string; 
    expiryDate?: string; 
    cvv?: string;
    amountToPay: number;
  }) => {
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
        const updateData: Partial<BookingCreate> = {
          status: 'confirmed',
          payment_method: paymentData.paymentMethod as 'credit_card' | 'debit_card' | 'transfer' | 'cash',
          amount_paid: paymentData.amountToPay,
        };
        await bookingService.patchBooking(selectedBooking.id, updateData);
      }
      
      const precio = getBookingTotal(selectedBooking).toFixed(2);
      alert(`✅ Pago procesado exitosamente!\n\nTotal pagado: $${precio}\n\nTu reserva ha sido confirmada.\nCódigo: ${selectedBooking.booking_code}`);
      
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-green-600">
                        ${getBookingTotal(booking).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {(booking.status.toLowerCase() === 'pending') && role === 'CLIENTE' && (
                        <button
                          onClick={() => handlePay(booking)}
                          className="text-green-600 hover:text-green-900 mr-4 font-bold"
                        >
                          💳 Pagar
                        </button>
                      )}
                      <button 
                        onClick={() => handleViewDetails(booking)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Ver
                      </button>
                      {(role === 'ADMIN' || role === 'EDITOR') && (
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

        {/* Modal Crear/Editar Reserva */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingBooking ? '✏️ Editar Reserva' : '➕ Nueva Reserva'}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Vuelo y Pasajero */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vuelo *</label>
                    <select
                      required
                      value={formData.flight}
                      onChange={(e) => setFormData({...formData, flight: Number(e.target.value)})}
                      disabled={!!editingBooking}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value={0}>Seleccione un vuelo</option>
                      {flights.map(flight => (
                        <option key={flight.id} value={flight.id}>
                          {flight.flight_number} - {flight.origin_airport_name || `Airport ${flight.origin_airport}`} → {flight.destination_airport_name || `Airport ${flight.destination_airport}`}
                          {getFlightPrice(flight) > 0 ? ` • $${getFlightPrice(flight).toFixed(2)}` : ''}
                        </option>
                      ))}
                    </select>
                    {!editingBooking && formData.flight > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        Precio del vuelo: ${getFlightPrice(getFlightById(formData.flight)).toFixed(2)}
                      </p>
                    )}
                    {editingBooking && (
                      <p className="text-xs text-gray-500 mt-1">El vuelo no se puede cambiar al editar</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pasajero *</label>
                    <select
                      required
                      value={formData.passenger}
                      onChange={(e) => setFormData({...formData, passenger: Number(e.target.value)})}
                      disabled={!!editingBooking}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value={0}>Seleccione un pasajero</option>
                      {passengers.map(passenger => (
                        <option key={passenger.id} value={passenger.id}>
                          {passenger.first_name} {passenger.last_name} - {passenger.document_number}
                        </option>
                      ))}
                    </select>
                    {editingBooking && (
                      <p className="text-xs text-gray-500 mt-1">El pasajero no se puede cambiar al editar</p>
                    )}
                  </div>
                </div>

                {/* Clase y Asiento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Clase de Viaje</label>
                    <select
                      value={formData.travel_class}
                      onChange={(e) => setFormData({...formData, travel_class: e.target.value as 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST_CLASS'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="ECONOMY">Económica</option>
                      <option value="PREMIUM_ECONOMY">Económica Premium</option>
                      <option value="BUSINESS">Ejecutiva</option>
                      <option value="FIRST_CLASS">Primera Clase</option>
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
                </div>

                {/* Equipaje */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maletas Facturadas</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const currentBags = formData.checked_baggage || 0;
                          if (currentBags > 0) {
                            setFormData({...formData, checked_baggage: currentBags - 1});
                          }
                        }}
                        className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        <span className="text-xl">-</span>
                      </button>
                      <input
                        type="number"
                        value={formData.checked_baggage || 0}
                        onChange={(e) => setFormData({...formData, checked_baggage: Number(e.target.value)})}
                        min="0"
                        max="5"
                        className="w-16 text-center px-2 py-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const currentBags = formData.checked_baggage || 0;
                          if (currentBags < 5) {
                            setFormData({...formData, checked_baggage: currentBags + 1});
                          }
                        }}
                        className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        <span className="text-xl">+</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Equipaje de Mano</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const currentBags = formData.carry_on_baggage || 0;
                          if (currentBags > 0) {
                            setFormData({...formData, carry_on_baggage: currentBags - 1});
                          }
                        }}
                        className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        <span className="text-xl">-</span>
                      </button>
                      <input
                        type="number"
                        value={formData.carry_on_baggage || 0}
                        onChange={(e) => setFormData({...formData, carry_on_baggage: Number(e.target.value)})}
                        min="0"
                        max="2"
                        className="w-16 text-center px-2 py-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const currentBags = formData.carry_on_baggage || 0;
                          if (currentBags < 2) {
                            setFormData({...formData, carry_on_baggage: currentBags + 1});
                          }
                        }}
                        className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        <span className="text-xl">+</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preferencias */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferencia de Comida</label>
                  <select
                    value={formData.meal_preference}
                    onChange={(e) => setFormData({...formData, meal_preference: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Sin preferencia</option>
                    <option value="vegetarian">Vegetariana</option>
                    <option value="vegan">Vegana</option>
                    <option value="gluten_free">Sin Gluten</option>
                    <option value="kosher">Kosher</option>
                    <option value="halal">Halal</option>
                    <option value="diabetic">Diabética</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Solicitudes Especiales</label>
                  <textarea
                    value={formData.special_requests}
                    onChange={(e) => setFormData({...formData, special_requests: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ej: Asiento cerca de la salida, asistencia especial, etc."
                  />
                </div>

                {/* Precio y Estado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio Total ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.total_price}
                      onChange={(e) => setFormData({...formData, total_price: Number(e.target.value)})}
                      disabled={!!(editingBooking && role !== 'ADMIN')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    {editingBooking && role !== 'ADMIN' && (
                      <p className="text-xs text-gray-500 mt-1">Solo ADMIN puede modificar el precio</p>
                    )}
                  </div>
                  
                  {editingBooking && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                      <select
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        disabled={role !== 'ADMIN'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="confirmed">Confirmada</option>
                        <option value="cancelled">Cancelada</option>
                      </select>
                      {role !== 'ADMIN' && (
                        <p className="text-xs text-gray-500 mt-1">Solo ADMIN puede cambiar el estado</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
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
                        travel_class: 'ECONOMY',
                        checked_baggage: 0,
                        carry_on_baggage: 0,
                        meal_preference: '',
                        special_requests: '',
                      });
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold"
                  >
                    {saving ? 'Guardando...' : (editingBooking ? '✅ Actualizar Reserva' : '💾 Guardar Reserva')}
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
                {/* Código de Reserva con icono */}
                <div className="text-center py-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Código de Reserva</p>
                  <p className="text-3xl font-bold text-gray-900 tracking-wider">{selectedBooking.booking_code}</p>
                  {selectedBooking.status === 'confirmed' && (
                    <span className="inline-block mt-3 px-4 py-2 bg-green-500 text-white rounded-full text-sm font-semibold">
                      ✓ Pagada
                    </span>
                  )}
                  {selectedBooking.status === 'pending' && (
                    <span className="inline-block mt-3 px-4 py-2 bg-yellow-500 text-white rounded-full text-sm font-semibold">
                      ⏳ Pendiente
                    </span>
                  )}
                </div>

                {/* Información del Vuelo */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Información del Vuelo</h3>
                  {selectedBooking.flight_details ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Vuelo</p>
                          <p className="font-bold text-gray-900 text-lg">{selectedBooking.flight_details.flight_number}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Clase</p>
                          <p className="font-semibold text-gray-900 capitalize">
                            {selectedBooking.travel_class === 'ECONOMY' ? 'Económica' : 
                             selectedBooking.travel_class === 'PREMIUM_ECONOMY' ? 'Económica Premium' :
                             selectedBooking.travel_class === 'BUSINESS' ? 'Ejecutiva' : 
                             selectedBooking.travel_class === 'FIRST_CLASS' ? 'Primera Clase' : 'Económica'}
                          </p>
                        </div>
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

                {/* Información del Pasajero */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">Información del Pasajero</h3>
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

                {/* Equipaje */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Equipaje</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{selectedBooking.checked_baggage || 0}</p>
                        <p className="text-sm text-gray-600">Maletas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{selectedBooking.carry_on_baggage || 0}</p>
                        <p className="text-sm text-gray-600">Equipaje de mano</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información de Pago */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">Información de Pago</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-gray-700 font-medium">Precio Total</p>
                      <p className="text-2xl font-bold text-gray-900">
                          ${getBookingTotal(selectedBooking).toFixed(2)}
                        </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-700 font-medium">Monto Pagado</p>
                      <p className="text-xl font-bold text-green-600">
                        ${Number(selectedBooking.amount_paid || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-green-300">
                      <p className="text-gray-700 font-medium">Saldo Pendiente</p>
                      <p className="text-xl font-bold text-red-600">
                        ${selectedBooking.balance_due ? selectedBooking.balance_due.toFixed(2) :
                          selectedBooking.status === 'pending' ? getBookingTotal(selectedBooking).toFixed(2) : '0.00'}
                      </p>
                    </div>
                    {selectedBooking.payment_method && (
                      <div className="pt-2 border-t border-green-300">
                        <p className="text-sm text-gray-600">Método de Pago</p>
                        <p className="font-semibold text-gray-900 capitalize">
                          {selectedBooking.payment_method === 'credit_card' ? '💳 Tarjeta de Crédito' :
                           selectedBooking.payment_method === 'debit_card' ? '💳 Tarjeta de Débito' :
                           selectedBooking.payment_method === 'transfer' ? '🏦 Transferencia' :
                           selectedBooking.payment_method === 'cash' ? '💵 Efectivo' : 'No especificado'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedBooking.meal_preference && (
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h3 className="text-sm font-semibold text-orange-900 mb-1">Preferencia de Comida</h3>
                    <p className="text-gray-900 capitalize">{selectedBooking.meal_preference.replace('_', ' ')}</p>
                  </div>
                )}

                {selectedBooking.special_requests && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="text-sm font-semibold text-yellow-900 mb-1">Solicitudes Especiales</h3>
                    <p className="text-gray-900">{selectedBooking.special_requests}</p>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  {selectedBooking.status === 'pending' && role === 'CLIENTE' && (
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handlePay(selectedBooking);
                      }}
                      className="mr-3 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
                    >
                      💳 Pagar Ahora
                    </button>
                  )}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">💳 Procesar Pago</h2>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-600">Reserva</p>
                    <span className="text-xs font-medium px-2 py-1 bg-blue-600 text-white rounded-full">
                      {selectedBooking.booking_code}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-700 font-medium">Monto a Pagar</p>
                    <p className="text-3xl font-bold text-green-600">
                      ${getBookingTotal(selectedBooking).toFixed(2)}
                    </p>
                  </div>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const paymentMethod = formData.get('paymentMethod') as string;
                  
                  handlePaymentConfirm({
                    paymentMethod,
                    amountToPay: getBookingTotal(selectedBooking),
                    cardNumber: paymentMethod === 'credit_card' || paymentMethod === 'debit_card' 
                      ? formData.get('cardNumber') as string 
                      : undefined,
                    cardName: paymentMethod === 'credit_card' || paymentMethod === 'debit_card'
                      ? formData.get('cardName') as string
                      : undefined,
                    expiryDate: paymentMethod === 'credit_card' || paymentMethod === 'debit_card'
                      ? formData.get('expiryDate') as string
                      : undefined,
                    cvv: paymentMethod === 'credit_card' || paymentMethod === 'debit_card'
                      ? formData.get('cvv') as string
                      : undefined,
                  });
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Método de Pago *</label>
                    <div className="space-y-2">
                      <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="credit_card"
                          defaultChecked
                          className="w-5 h-5 text-blue-600"
                          onChange={(e) => {
                            const cardFields = document.getElementById('cardFields');
                            if (cardFields) {
                              cardFields.style.display = e.target.checked ? 'block' : 'none';
                            }
                          }}
                        />
                        <span className="ml-3 font-medium text-gray-900">💳 Tarjeta de Crédito</span>
                      </label>

                      <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="debit_card"
                          className="w-5 h-5 text-blue-600"
                          onChange={(e) => {
                            const cardFields = document.getElementById('cardFields');
                            if (cardFields) {
                              cardFields.style.display = e.target.checked ? 'block' : 'none';
                            }
                          }}
                        />
                        <span className="ml-3 font-medium text-gray-900">💳 Tarjeta de Débito</span>
                      </label>

                      <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="transfer"
                          className="w-5 h-5 text-blue-600"
                          onChange={(e) => {
                            const cardFields = document.getElementById('cardFields');
                            if (cardFields) {
                              cardFields.style.display = e.target.checked ? 'none' : 'block';
                            }
                          }}
                        />
                        <span className="ml-3 font-medium text-gray-900">🏦 Transferencia</span>
                      </label>

                      <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash"
                          className="w-5 h-5 text-blue-600"
                          onChange={(e) => {
                            const cardFields = document.getElementById('cardFields');
                            if (cardFields) {
                              cardFields.style.display = e.target.checked ? 'none' : 'block';
                            }
                          }}
                        />
                        <span className="ml-3 font-medium text-gray-900">💵 Efectivo</span>
                      </label>
                    </div>
                  </div>

                  <div id="cardFields" className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número de Tarjeta *</label>
                      <input
                        type="text"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre en la Tarjeta *</label>
                      <input
                        type="text"
                        name="cardName"
                        placeholder="NOMBRE APELLIDO"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento *</label>
                        <input
                          type="text"
                          name="expiryDate"
                          placeholder="MM/AA"
                          maxLength={5}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                        <input
                          type="text"
                          name="cvv"
                          placeholder="123"
                          maxLength={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                    🔒 Esta es una simulación de pago para fines educativos.
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
                    >
                      ✅ Confirmar Pago
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </PrivateLayout>
  );
};
