import { ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../application/auth/useAuth';
import { useRole } from '../../application/auth/useRole';

interface PrivateLayoutProps {
  children: ReactNode;
}

export const PrivateLayout = ({ children }: PrivateLayoutProps) => {
  const { user, logout } = useAuth();
  const { role } = useRole();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allNavigation = [
    { name: 'Panel', href: '/dashboard', icon: '📊' },
    { name: 'Vuelos', href: '/flights', icon: '✈️' },
    { name: 'Reservas', href: '/bookings', icon: '🎫' },
    { name: 'Pasajeros', href: '/passengers', icon: '👤' },
    { name: 'Aerolíneas', href: '/airlines', icon: '🏢' },
    { name: 'Aeropuertos', href: '/airports', icon: '🏛️' },
    { name: 'Tripulación', href: '/crew', icon: '👨‍✈️' },
    { name: 'Mantenimiento', href: '/maintenance', icon: '🔧' },
  ];

  const navigation = role === 'CLIENTE' 
    ? allNavigation.filter(item => ['Panel', 'Buscar Vuelos', 'Vuelos', 'Reservas'].includes(item.name))
    : allNavigation;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-4 text-white hover:text-indigo-200"
              >
                ☰
              </button>
              <Link to="/dashboard" className="text-xl font-bold">
                ✈️ Airport & Flights Management
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">Welcome, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed lg:translate-x-0 lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out`}
        >
          <div className="h-full overflow-y-auto py-4">
            <nav className="space-y-1 px-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
