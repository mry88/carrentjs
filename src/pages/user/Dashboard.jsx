import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [activeRentals, setActiveRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      const [{ data: userData }, { data: rentalsData }] = await Promise.all([
        supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single(),
        supabase
          .from('rentals')
          .select(`
            *,
            cars (
              brand,
              model,
              license_plate
            )
          `)
          .eq('user_id', authUser.id)
          .eq('status', 'active')
      ]);

      setUser(userData);
      setActiveRentals(rentalsData || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Welcome, {user?.full_name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <Link
              to="/cars"
              className="block w-full text-center bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Rent a Car
            </Link>
            <Link
              to="/rentals"
              className="block w-full text-center bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              View Rental History
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Email:</span> {user?.email}</p>
            <p><span className="font-medium">Phone:</span> {user?.phone_number || 'Not provided'}</p>
            <p><span className="font-medium">Address:</span> {user?.address || 'Not provided'}</p>
          </div>
        </div>
      </div>

      {activeRentals.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Active Rentals</h2>
          <div className="space-y-4">
            {activeRentals.map((rental) => (
              <div
                key={rental.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{rental.cars.brand} {rental.cars.model}</p>
                  <p className="text-sm text-gray-500">{rental.cars.license_plate}</p>
                </div>
                <Link
                  to="/rentals"
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}