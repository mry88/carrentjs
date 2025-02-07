import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function RentalHistory() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState(null);
  const [damageReport, setDamageReport] = useState('');

  useEffect(() => {
    fetchRentals();
  }, []);

  async function fetchRentals() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('rentals')
        .select(`
          *,
          cars (
            brand,
            model,
            license_plate
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRentals(data);
    } catch (error) {
      toast.error('Error fetching rental history');
    } finally {
      setLoading(false);
    }
  }

  async function handleReturn(rental) {
    try {
      // Update rental status
      const { error: rentalError } = await supabase
        .from('rentals')
        .update({ status: 'completed' })
        .eq('id', rental.id);

      if (rentalError) throw rentalError;

      // Update car status
      const { error: carError } = await supabase
        .from('cars')
        .update({ status: 'available' })
        .eq('id', rental.car_id);

      if (carError) throw carError;

      // If there's damage reported, create damage record
      if (damageReport.trim()) {
        const { error: damageError } = await supabase
          .from('damages')
          .insert([{
            rental_id: rental.id,
            description: damageReport,
            status: 'pending'
          }]);

        if (damageError) throw damageError;
      }

      toast.success('Car returned successfully');
      setSelectedRental(null);
      setDamageReport('');
      fetchRentals();
    } catch (error) {
      toast.error(error.message);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Rental History</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rentals.map((rental) => (
              <tr key={rental.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {rental.cars.brand} {rental.cars.model}
                  </div>
                  <div className="text-sm text-gray-500">
                    {rental.cars.license_plate}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {format(new Date(rental.start_date), 'MMM d, yyyy')}
                  </div>
                  <div className="text-sm text-gray-500">
                    to {format(new Date(rental.end_date), 'MMM d, yyyy')}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  ${rental.total_amount}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    rental.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {rental.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  {rental.status === 'active' && (
                    <button
                      onClick={() => setSelectedRental(rental)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Return Car
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRental && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Return Car</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Damage Report (if any)
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows="3"
                value={damageReport}
                onChange={(e) => setDamageReport(e.target.value)}
                placeholder="Describe any damages to the vehicle..."
              ></textarea>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setSelectedRental(null)}
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReturn(selectedRental)}
                className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}