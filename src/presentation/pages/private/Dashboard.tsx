import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PrivateLayout } from '../../layouts/PrivateLayout';
import { useAuth } from '../../../application/auth/useAuth';
import { useRole } from '../../../application/auth/useRole';
import { flightService } from '../../../application/airport-api/flight.service';
import { bookingService } from '../../../application/airport-api/booking.service';
import { passengerService } from '../../../application/airport-api/passenger.service';
import { airlineService } from '../../../application/airport-api/airline.service';
import { airportService } from '../../../application/airport-api/airport.service';

export const Dashboard = () => {
  const { user } = useAuth();
  const { role, isAdmin, isEditor, isOperador } = useRole();
  const [stats, setStats] = useState({
    flights: 0,
    bookings: 0,
    passengers: 0,
    airlines: 0,
    airports: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [flights, bookings, passengers, airlines, airports] = await Promise.all([
        flightService.getAllFlights().catch(() => []),
        bookingService.getAllBookings().catch(() => []),
        passengerService.getAllPassengers().catch(() => []),
        airlineService.getAllAirlines().catch(() => []),
        airportService.getAllAirports().catch(() => []),
      ]);
      
      setStats({
        flights: Array.isArray(flights) ? flights.length : 0,
        bookings: Array.isArray(bookings) ? bookings.length : 0,
        passengers: Array.isArray(passengers) ? passengers.length : 0,
        airlines: Array.isArray(airlines) ? airlines.length : 0,
        airports: Array.isArray(airports) ? airports.length : 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const modules = [
    {
      title: 'Gestión de Vuelos',
      description: 'Administrar horarios, rutas y estados de vuelos',
      icon: '✈️',
      link: '/flights',
      color: 'bg-blue-500',
      roles: ['ADMIN', 'EDITOR', 'OPERADOR', 'CLIENTE'],
    },
    {
      title: 'Reservas',
      description: 'Ver y gestionar reservas de pasajeros',
      icon: '🎫',
      link: '/bookings',
      color: 'bg-green-500',
      roles: ['ADMIN', 'EDITOR', 'OPERADOR', 'CLIENTE'],
    },
    {
      title: 'Pasajeros',
      description: 'Gestionar información de pasajeros',
      icon: '👤',
      link: '/passengers',
      color: 'bg-purple-500',
      roles: ['ADMIN', 'EDITOR', 'OPERADOR'],
    },
    {
      title: 'Aerolíneas',
      description: 'Administrar información de aerolíneas',
      icon: '🏢',
      link: '/airlines',
      color: 'bg-indigo-500',
      roles: ['ADMIN', 'EDITOR'],
    },
    {
      title: 'Aeropuertos',
      description: 'Gestionar información de aeropuertos',
      icon: '🏛️',
      link: '/airports',
      color: 'bg-cyan-500',
      roles: ['ADMIN', 'EDITOR'],
    },
    {
      title: 'Tripulación',
      description: 'Gestionar tripulación y asignaciones',
      icon: '👨‍✈️',
      link: '/crew',
      color: 'bg-orange-500',
      roles: ['ADMIN', 'OPERADOR'],
    },
    {
      title: 'Mantenimiento',
      description: 'Seguimiento de mantenimiento de aeronaves',
      icon: '🔧',
      link: '/maintenance',
      color: 'bg-red-500',
      roles: ['ADMIN', 'OPERADOR'],
    },
  ];

  const visibleModules = modules.filter(m => role && m.roles.includes(role));

  return (
    <PrivateLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Bienvenido, {user?.first_name || user?.username}! 
            <span className="ml-2 px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full font-semibold">
              Rol: {role}
            </span>
          </p>
        </div>

        {/* Aviso de permisos */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Permisos de tu rol:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            {isAdmin && <li>✅ ADMIN: Acceso completo - Crear, Editar, Eliminar y Ver todo</li>}
            {isEditor && !isAdmin && <li>✅ EDITOR: Puede Crear, Editar y Ver (sin eliminar)</li>}
            {isOperador && !isAdmin && !isEditor && <li>✅ OPERADOR: Puede Crear, Cambiar Estados y Ver</li>}
            {!isAdmin && !isEditor && !isOperador && <li>✅ CLIENTE: Solo puede Ver información</li>}
          </ul>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            <div className="col-span-4 text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full p-3">
                    <span className="text-2xl">✈️</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-600 text-sm">Total de vuelos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.flights}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-full p-3">
                    <span className="text-2xl">🎫</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-600 text-sm">Reservas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.bookings}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-full p-3">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-600 text-sm">Pasajeros</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.passengers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-indigo-100 rounded-full p-3">
                    <span className="text-2xl">🏢</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-600 text-sm">Aerolíneas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.airlines}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modules Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">System Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleModules.map((module) => (
              <Link
                key={module.title}
                to={module.link}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 group"
              >
                <div className={`${module.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {module.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {module.title}
                </h3>
                <p className="text-gray-600">{module.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
};
