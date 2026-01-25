import { PrivateLayout } from '../../layouts/PrivateLayout';
import { useAuth } from '../../../application/auth/useAuth';
import { Link } from 'react-router-dom';

export const UserDashboard = () => {
  const { user } = useAuth();

  const userModules = [
    {
      title: 'Buscar Vuelos',
      description: 'Encuentra y reserva tu próximo vuelo',
      icon: '🔍',
      link: '/search-flights',
      color: 'bg-indigo-500',
    },
    {
      title: 'Mis Vuelos',
      description: 'Ver vuelos disponibles y horarios',
      icon: '✈️',
      link: '/flights',
      color: 'bg-blue-500',
    },
    {
      title: 'Mis Reservas',
      description: 'Ver mis reservas y tickets',
      icon: '🎫',
      link: '/bookings',
      color: 'bg-green-500',
    },
    {
      title: 'Mi Perfil',
      description: 'Información de pasajero',
      icon: '👤',
      link: '/passengers',
      color: 'bg-purple-500',
    },
  ];

  return (
    <PrivateLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bienvenido Usuario</h1>
          <p className="text-gray-600 mt-2">
            Hola, {user?.first_name || user?.username}! 
            <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-semibold">
              👤 Usuario
            </span>
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3 text-lg">✨ Tus Opciones</h3>
          <p className="text-blue-800 mb-3">
            Como usuario puedes consultar vuelos, hacer reservas, realizar pagos y gestionar tus viajes.
          </p>
          <Link 
            to="/search-flights"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
          >
            ✈️ Reservar Vuelo Ahora
          </Link>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Mis Servicios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userModules.map((module) => (
              <Link
                key={module.title}
                to={module.link}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 group"
              >
                <div className={`${module.color} w-16 h-16 rounded-lg flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
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
