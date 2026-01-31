import { Link } from 'react-router-dom';
import { PublicLayout } from '../../layouts/PublicLayout';

export const Home = () => {
  return (
    <PublicLayout>
      <div className="py-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Sistema de Gestión de Aeropuertos y Vuelos
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Solución completa para gestionar aeropuertos, vuelos, reservas y más
          </p>
          
          <div className="flex justify-center space-x-4 mb-16">
            <Link
              to="/login"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition"
            >
              Comenzar
            </Link>
            <Link
              to="/register"
              className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition"
            >
              Registrarse
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {/* Features */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">✈️</div>
              <h3 className="text-xl font-semibold mb-2">Gestión de Vuelos</h3>
              <p className="text-gray-600">
                Administra vuelos, horarios y rutas eficientemente
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">🎫</div>
              <h3 className="text-xl font-semibold mb-2">Sistema de Reservas</h3>
              <p className="text-gray-600">
                Gestiona reservas y reservaciones de pasajeros sin problemas
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">👨‍✈️</div>
              <h3 className="text-xl font-semibold mb-2">Gestión de Tripulación</h3>
              <p className="text-gray-600">
                Organiza y programa miembros de tripulación para vuelos
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold mb-2">Seguimiento de Mantenimiento</h3>
              <p className="text-gray-600">
                Mantén el seguimiento de mantenimiento e inspecciones de aeronaves
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-xl font-semibold mb-2">Generación de Facturas</h3>
              <p className="text-gray-600">
                Genera y administra facturas automáticamente
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">🏭</div>
              <h3 className="text-xl font-semibold mb-2">Gestión de Almacén</h3>
              <p className="text-gray-600">
                Administra inventario y operaciones de almacén
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};
