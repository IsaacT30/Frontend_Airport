import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrivateLayout } from '../../layouts/PrivateLayout';
import { flightService } from '../../../application/airport-api/flight.service';
import { airportService } from '../../../application/airport-api/airport.service';
import { passengerService } from '../../../application/airport-api/passenger.service';
import { bookingService } from '../../../application/airport-api/booking.service';
import { Flight, Airport } from '../../../domain/airport-api/airport-api.types';

interface BookingModalProps {
  flight: Flight;
  onClose: () => void;
  onBook: (data: BookingData) => void;
}

interface BookingData {
  flight_id: number;
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  seat_number: string;
}

const BookingModal = ({ flight, onClose, onBook }: BookingModalProps) => {
  const [formData, setFormData] = useState({
    passenger_name: '',
    passenger_email: '',
    passenger_phone: '',
    seat_number: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBook({
      flight_id: flight.id,
      ...formData,
    });
  };

  // Generar asientos disponibles
  const generateSeats = () => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const seats = [];
    for (let i = 1; i <= 20; i++) {
      for (const row of rows) {
        seats.push(`${i}${row}`);
      }
    }
    return seats;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Reservar Vuelo</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Detalles del vuelo */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-lg mb-2">Detalles del Vuelo</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Vuelo:</span>
                <span className="ml-2 font-semibold">{flight.flight_number}</span>
              </div>
              <div>
                <span className="text-gray-600">Precio:</span>
                <span className="ml-2 font-semibold text-green-600">${flight.price || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Origen:</span>
                <span className="ml-2 font-semibold">{flight.origin_airport_name}</span>
              </div>
              <div>
                <span className="text-gray-600">Destino:</span>
                <span className="ml-2 font-semibold">{flight.destination_airport_name}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={formData.passenger_name}
                onChange={(e) => setFormData({ ...formData, passenger_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.passenger_email}
                onChange={(e) => setFormData({ ...formData, passenger_email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="juan@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                required
                value={formData.passenger_phone}
                onChange={(e) => setFormData({ ...formData, passenger_phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Asiento *
              </label>
              <select
                required
                value={formData.seat_number}
                onChange={(e) => setFormData({ ...formData, seat_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione un asiento</option>
                {generateSeats().map(seat => (
                  <option key={seat} value={seat}>{seat}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continuar al Pago
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

interface PaymentModalProps {
  bookingData: BookingData;
  flight: Flight;
  onClose: () => void;
  onConfirm: () => void;
}

const PaymentModal = ({ bookingData, flight, onClose, onConfirm }: PaymentModalProps) => {
  const [paymentData, setPaymentData] = useState({
    card_number: '',
    card_name: '',
    expiry_date: '',
    cvv: '',
  });
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simular procesamiento de pago
    setTimeout(() => {
      setProcessing(false);
      onConfirm();
    }, 2000);
  };

  const totalPrice = flight.price || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">💳 Pago Seguro</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Resumen de la reserva */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-lg mb-3">Resumen de tu Reserva</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Vuelo:</span>
                <span className="font-semibold">{flight.flight_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pasajero:</span>
                <span className="font-semibold">{bookingData.passenger_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Asiento:</span>
                <span className="font-semibold">{bookingData.seat_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ruta:</span>
                <span className="font-semibold">{flight.origin_airport_name} → {flight.destination_airport_name}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between text-lg">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-green-600">${totalPrice}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Tarjeta *
              </label>
              <input
                type="text"
                required
                maxLength={16}
                value={paymentData.card_number}
                onChange={(e) => setPaymentData({ ...paymentData, card_number: e.target.value.replace(/\D/g, '') })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="1234 5678 9012 3456"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre en la Tarjeta *
              </label>
              <input
                type="text"
                required
                value={paymentData.card_name}
                onChange={(e) => setPaymentData({ ...paymentData, card_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="JUAN PEREZ"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Vencimiento *
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={paymentData.expiry_date}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }
                    setPaymentData({ ...paymentData, expiry_date: value });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="MM/YY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV *
                </label>
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={paymentData.cvv}
                  onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="123"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
              🔒 Tu pago está protegido. Esta es una simulación de pago para fines educativos.
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={processing}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
              >
                {processing ? '⏳ Procesando...' : `💳 Pagar $${totalPrice}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const SearchFlightsPage = () => {
  const navigate = useNavigate();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [filters, setFilters] = useState({
    origin: '',
    destination: '',
    status: '',
  });

  useEffect(() => {
    loadFlights();
    loadAirports();
  }, []);

  const loadFlights = async () => {
    try {
      setLoading(true);
      const data = await flightService.getAllFlights();
      setFlights(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading flights:', err);
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAirports = async () => {
    try {
      const data = await airportService.getAllAirports();
      setAirports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading airports:', err);
    }
  };

  const handleBookFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = (data: BookingData) => {
    setBookingData(data);
    setShowBookingModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = async () => {
    if (!selectedFlight || !bookingData) return;
    
    try {
      console.log('Iniciando proceso de reserva...');
      console.log('Vuelo seleccionado:', selectedFlight);
      console.log('Datos de reserva:', bookingData);
      
      // 1. Crear o buscar el pasajero
      const passengerData = {
        first_name: bookingData.passenger_name.split(' ')[0],
        last_name: bookingData.passenger_name.split(' ').slice(1).join(' ') || bookingData.passenger_name,
        email: bookingData.passenger_email,
        phone: bookingData.passenger_phone,
        date_of_birth: '2000-01-01',
        nationality: 'MX',
        document_type: 'PASSPORT',
        document_number: 'TEMP' + Date.now(),
      };
      
      console.log('Creando pasajero con datos:', passengerData);
      const passenger = await passengerService.createPassenger(passengerData);
      console.log('Pasajero creado:', passenger);
      
      // 2. Crear la reserva
      const reservaData = {
        flight: selectedFlight.id,
        passenger: passenger.id,
        seat_number: bookingData.seat_number,
        total_price: selectedFlight.price || 100,
        status: 'confirmed',
      };
      
      console.log('Creando reserva con datos:', reservaData);
      const nuevaReserva = await bookingService.createBooking(reservaData);
      console.log('Reserva creada:', nuevaReserva);
      
      setShowPaymentModal(false);
      
      // Resetear estados
      setSelectedFlight(null);
      setBookingData(null);
      
      // Mostrar mensaje y redirigir a Reservas
      alert('Pago exitoso! Tu reserva ha sido confirmada.\n\n' +
            'Vuelo: ' + selectedFlight.flight_number + '\n' +
            'Pasajero: ' + bookingData.passenger_name + '\n' +
            'Asiento: ' + bookingData.seat_number + '\n\n' +
            'Seras redirigido a tus reservas.');
      
      navigate('/bookings');
    } catch (error) {
      console.error('Error completo:', error);
      const err = error as { response?: { data?: unknown }; message?: string };
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      
      let errorMsg = 'Error desconocido';
      if (err.response?.data) {
        const responseData = err.response.data as { detail?: string; [key: string]: unknown };
        if (typeof responseData === 'string') {
          errorMsg = responseData;
        } else if (responseData.detail) {
          errorMsg = responseData.detail;
        } else {
          errorMsg = JSON.stringify(responseData);
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      alert('Error al procesar la reserva:\n' + errorMsg + '\n\nRevisa la consola para mas detalles.');
    }
  };

  const filteredFlights = flights.filter(flight => {
    if (filters.origin && flight.origin_airport !== parseInt(filters.origin)) return false;
    if (filters.destination && flight.destination_airport !== parseInt(filters.destination)) return false;
    if (filters.status && flight.status !== filters.status) return false;
    return true;
  });

  // Formatear fecha simple sin librerías
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      SCHEDULED: 'bg-blue-100 text-blue-800',
      DELAYED: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <PrivateLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">✈️ Buscar Vuelos</h1>
          <p className="text-gray-600">Encuentra y reserva tu próximo vuelo</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filtros de Búsqueda</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Origen</label>
              <select
                value={filters.origin}
                onChange={(e) => setFilters({ ...filters, origin: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los aeropuertos</option>
                {airports.map(airport => (
                  <option key={airport.id} value={airport.id}>
                    {airport.code} - {airport.city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destino</label>
              <select
                value={filters.destination}
                onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los aeropuertos</option>
                {airports.map(airport => (
                  <option key={airport.id} value={airport.id}>
                    {airport.code} - {airport.city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="SCHEDULED">Programado</option>
                <option value="DELAYED">Retrasado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de vuelos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Cargando vuelos...</p>
          </div>
        ) : filteredFlights.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No se encontraron vuelos disponibles</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFlights.map((flight) => (
              <div key={flight.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{flight.flight_number}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(flight.status)}`}>
                        {flight.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Origen</p>
                        <p className="font-semibold">{flight.origin_airport_name}</p>
                        <p className="text-gray-500">{formatDateTime(flight.departure_time)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Destino</p>
                        <p className="font-semibold">{flight.destination_airport_name}</p>
                        <p className="text-gray-500">{formatDateTime(flight.arrival_time)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Asientos Disponibles</p>
                        <p className="font-semibold">{flight.available_seats} / {flight.total_seats}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-gray-600 text-sm">Precio desde</p>
                      <p className="text-3xl font-bold text-green-600">${flight.price || 0}</p>
                    </div>
                    <button
                      onClick={() => handleBookFlight(flight)}
                      disabled={flight.status !== 'SCHEDULED' || flight.available_seats === 0}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {flight.available_seats === 0 ? 'Sin Disponibilidad' : 'Reservar Ahora'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modales */}
        {showBookingModal && selectedFlight && (
          <BookingModal
            flight={selectedFlight}
            onClose={() => {
              setShowBookingModal(false);
              setSelectedFlight(null);
            }}
            onBook={handleBookingSubmit}
          />
        )}

        {showPaymentModal && selectedFlight && bookingData && (
          <PaymentModal
            flight={selectedFlight}
            bookingData={bookingData}
            onClose={() => setShowPaymentModal(false)}
            onConfirm={handlePaymentConfirm}
          />
        )}
      </div>
    </PrivateLayout>
  );
};
