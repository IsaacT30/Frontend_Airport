import { Link } from 'react-router-dom';
import { PublicLayout } from '../../layouts/PublicLayout';

export const Home = () => {
  return (
    <PublicLayout>
      <div className="py-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Airport & Flights Management System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Complete solution for managing airports, flights, bookings, and more
          </p>
          
          <div className="flex justify-center space-x-4 mb-16">
            <Link
              to="/login"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition"
            >
              Get Started
            </Link>
            <Link
              to="/register"
              className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition"
            >
              Sign Up
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {/* Features */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">✈️</div>
              <h3 className="text-xl font-semibold mb-2">Flight Management</h3>
              <p className="text-gray-600">
                Manage flights, schedules, and routes efficiently
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">🎫</div>
              <h3 className="text-xl font-semibold mb-2">Booking System</h3>
              <p className="text-gray-600">
                Handle passenger bookings and reservations seamlessly
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">👨‍✈️</div>
              <h3 className="text-xl font-semibold mb-2">Crew Management</h3>
              <p className="text-gray-600">
                Organize and schedule crew members for flights
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold mb-2">Maintenance Tracking</h3>
              <p className="text-gray-600">
                Keep track of aircraft maintenance and inspections
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-xl font-semibold mb-2">Invoice Generation</h3>
              <p className="text-gray-600">
                Generate and manage invoices automatically
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">🏭</div>
              <h3 className="text-xl font-semibold mb-2">Warehouse Management</h3>
              <p className="text-gray-600">
                Manage inventory and warehouse operations
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};
