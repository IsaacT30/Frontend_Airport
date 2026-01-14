import { useEffect, useState } from 'react';
import { PrivateLayout } from '../../layouts/PrivateLayout';
import { passengerService } from '../../../application/airport-api/passenger.service';
import { Passenger } from '../../../domain/airport-api/airport-api.types';

export const PassengersPage = () => {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPassengers();
  }, []);

  const loadPassengers = async () => {
    try {
      const data = await passengerService.getAllPassengers();
      setPassengers(data);
    } catch (err) {
      console.error('Failed to load passengers:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PrivateLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">👤 Passengers</h1>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
            + Add Passenger
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Passport</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nationality</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DOB</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {passengers.map((passenger) => (
                  <tr key={passenger.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {passenger.first_name} {passenger.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{passenger.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{passenger.passport_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{passenger.nationality}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(passenger.date_of_birth).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PrivateLayout>
  );
};
