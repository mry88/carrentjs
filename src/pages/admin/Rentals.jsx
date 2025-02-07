import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminRentals() {
  const [rentals, setRentals] = useState([]);
  const [damages, setDamages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDamage, setSelectedDamage] = useState(null);
  const [repairCost, setRepairCost] = useState('');

  useEffect(() => {
    fetchRentalsAndDamages();
  }, []);

  async function fetchRentalsAndDamages() {
    try {
      const [rentalsResponse, damagesResponse] = await Promise.all([
        supabase
          .from('rentals')
          .select(`
            *,
            cars (
              brand,
              model,
              license_plate
            ),
            users (
              full_name,
              email
            )
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('damages')
          .select(`
            *,
            rentals (
              cars (
                brand,
                model,
                license_plate
              ),
              users (
                full_name,
                email
              )
            )
          `)
          .order('created_at', { ascending: false })
      ]);

      if (rentalsResponse.error) throw rentalsResponse.error;
      if (damagesResponse.error) throw damagesResponse.error;

      setRentals(rentalsResponse.data);
      setDamages(damagesResponse.data);
    } catch (error) {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  }

  async function handleDamageResolution(damage) {
    try {
      const { error } = await supabase
        .from('damages')
        .update({
          repair_cost: parseFloat(repairCost),
          status: 'charged'
        })
        .eq('id', damage.id);

      if (error) throw error;

      toast.success('Damage report resolved');
      setSelectedDamage(null);
      setRepairCost('');
      fetchRentalsAndDamages();
    } catch (error) {
      toast.error(error.message);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Rental Management</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Pending Damage Reports</h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {damages.filter(d => d.status === 'pending').map((damage) => (
                <tr key={damage.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {damage.rentals.cars.brand} {damage.rentals.cars.model}
                    </div>
                    <div className="text-sm text-gray-500">
                      {damage.rentals.cars.license_plate}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {damage.rentals.users.full_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {damage.rentals.users.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {damage.description}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {damage.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <button
                      onClick={() => setSelectedDamage(damage)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Resolve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">All Rentals</h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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
                    <div className="text-sm font-medium text-gray-900">
                      {rental.users.full_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {rental.users.email}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDamage && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Resolve Damage Report</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Repair Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={repairCost}
                onChange={(e) => setRepairCost(e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setSelectedDamage(null)}
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDamageResolution(selectedDamage)}
                className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}