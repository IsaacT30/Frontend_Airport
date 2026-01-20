import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PrivateLayout } from '../../layouts/PrivateLayout';
import { useAuth } from '../../../application/auth/useAuth';
import { useRole } from '../../../application/auth/useRole';

export const Dashboard = () => {
  const { user } = useAuth();
  const { role, isAdmin, isEditor, isOperador } = useRole();
  const [stats, setStats] = useState({
    flights: 0,
    bookings: 0,
    passengers: 0,
    invoices: 0,
  });

  useEffect(() => {
    // En una aplicación real, obtener estadísticas del dashboard desde las APIs
    setStats({
      flights: 42,
      bookings: 156,
      passengers: 324,
      invoices: 89,
    });
  }, []);

  const modules = [
    {
      title: 'Flights Management',
      description: 'Manage flight schedules, routes, and statuses',
      icon: '✈️',
      link: '/flights',
      color: 'bg-blue-500',
    },
    {
      title: 'Bookings',
      description: 'View and manage passenger bookings',
      icon: '🎫',
      link: '/bookings',
      color: 'bg-green-500',
    },
    {
      title: 'Passengers',
      description: 'Manage passenger information',
      icon: '👤',
      link: '/passengers',
      color: 'bg-purple-500',
    },
    {
      title: 'Airlines',
      description: 'Manage airline information and details',
      icon: '🏢',
      link: '/airlines',
      color: 'bg-indigo-500',
    },
    {
      title: 'Airports',
      description: 'Manage airport information',
      icon: '🏛️',
      link: '/airports',
      color: 'bg-cyan-500',
    },
    {
      title: 'Crew Members',
      description: 'Manage crew members and assignments',
      icon: '👨‍✈️',
      link: '/crew',
      color: 'bg-orange-500',
    },
    {
      title: 'Maintenance',
      description: 'Track aircraft maintenance records',
      icon: '🔧',
      link: '/maintenance',
      color: 'bg-red-500',
    },
    {
      title: 'Product Catalog',
      description: 'Manage products and inventory',
      icon: '📦',
      link: '/catalog',
      color: 'bg-yellow-500',
    },
    {
      title: 'Invoices',
      description: 'Generate and manage invoices',
      icon: '📄',
      link: '/invoices',
      color: 'bg-pink-500',
    },
    {
      title: 'Warehouses',
      description: 'Manage warehouse operations',
      icon: '🏭',
      link: '/warehouses',
      color: 'bg-teal-500',
    },
    {
      title: 'Users',
      description: 'Manage system users',
      icon: '👥',
      link: '/users',
      color: 'bg-gray-500',
    },
  ];

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
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3">
                <span className="text-2xl">✈️</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Total Flights</p>
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
                <p className="text-gray-600 text-sm">Bookings</p>
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
                <p className="text-gray-600 text-sm">Passengers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.passengers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-pink-100 rounded-full p-3">
                <span className="text-2xl">📄</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{stats.invoices}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">System Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
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
