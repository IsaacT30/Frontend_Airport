import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PrivateLayout } from '../../layouts/PrivateLayout';
import { useAuth } from '../../../application/auth/useAuth';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    flights: 0,
    bookings: 0,
    passengers: 0,
    airlines: 0,
  });

  useEffect(() => {
    setStats({
      flights: 42,
      bookings: 156,
      passengers: 324,
      airlines: 15,
    });
  }, []);

  const adminModules = [
    {
      title: 'Panel',
      description: 'Vista general del sistema',
      icon: '📊',
      link: '/dashboard',
      color: 'bg-indigo-500',
    },
    {
      title: 'Vuelos',
      description: 'Gestionar rutas y horarios',
      icon: '✈️',
      link: '/flights',
      color: 'bg-blue-500',
    },
    {
      title: 'Reservas',
      description: 'Administrar reservas de pasajeros',
      icon: '🎫',
      link: '/bookings',
      color: 'bg-green-500',
    },
    {
      title: 'Pasajeros',
      description: 'Gestión de pasajeros',
      icon: '👤',
      link: '/passengers',
      color: 'bg-purple-500',
    },
    {
      title: 'Aerolíneas',
      description: 'Administrar aerolíneas',
      icon: '🏢',
      link: '/airlines',
      color: 'bg-indigo-500',
    },
    {
      title: 'Aeropuertos',
      description: 'Gestión de aeropuertos',
      icon: '🏛️',
      link: '/airports',
      color: 'bg-cyan-500',
    },
    {
      title: 'Multitud',
      description: 'Tripulación y asignaciones',
      icon: '👨‍✈️',
      link: '/crew',
      color: 'bg-orange-500',
    },
    {
      title: 'Mantenimiento',
      description: 'Registros de mantenimiento',
      icon: '🔧',
      link: '/maintenance',
      color: 'bg-red-500',
    },
    {
      title: 'Catalogar',
      description: 'Productos e inventario',
      icon: '📦',
      link: '/catalog',
      color: 'bg-yellow-500',
    },
    {
      title: 'Facturas',
      description: 'Gestión de facturas',
      icon: '📄',
      link: '/invoices',
      color: 'bg-pink-500',
    },
    {
      title: 'Almacenes',
      description: 'Operaciones de almacén',
      icon: '🏭',
      link: '/warehouses',
      color: 'bg-teal-500',
    },
    {
      title: 'Usuarios',
      description: 'Administrar usuarios del sistema',
      icon: '👥',
      link: '/users',
      color: 'bg-gray-500',
    },
  ];

  return (
    <PrivateLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administrador</h1>
          <p className="text-gray-600 mt-2">
            Bienvenido, {user?.first_name || user?.username}! 
            <span className="ml-2 px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full font-semibold">
              🔐 ADMIN
            </span>
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-900 mb-2">🔐 Privilegios de Administrador</h3>
          <p className="text-sm text-red-800">
            Tienes acceso completo: Crear, Editar, Eliminar y Ver todos los módulos del sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3">
                <span className="text-2xl">✈️</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Vuelos</p>
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
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Módulos del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminModules.map((module) => (
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
