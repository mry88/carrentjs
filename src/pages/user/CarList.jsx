import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function CarList() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [rentalDates, setRentalDates] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchAvailableCars();
  }, []);

  async function fetchAvailableCars() {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('status', 'available')
        .order('daily_rate');

      if (error) throw error;
      setCars(data);
    } catch (error) {
      toast.error('Error fetching available cars');
    } finally {
      setLoading(false);
    }
  }

  async function handleRent(e) {
    e.preventDefault();
    if (!selectedCar) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const startDate = new Date(rentalDates.startDate);
      const endDate = new Date(rentalDates.endDate);
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const totalAmount = days * selectedCar.daily_rate;

      const { error: rentalError } = await supabase
        .from('rentals')
        .insert([{
          user_id: user.id,
          car_id: selectedCar.id,
          start_date: rentalDates.startDate,
          end_date: rentalDates.endDate,
          total_amount: totalAmount,
          status: 'active'
        }]);

      if (rentalError) throw rentalError;

      const { error: carError } = await supabase
        .from('cars')
        .update({ status: 'rented' })
        .eq('id', selectedCar.id);

      if (carError) throw carError;

      toast.success('Car rented successfully');
      setSelectedCar(null);
      setRentalDates({ startDate: '', endDate: '' });
      fetchAvailableCars();
    } catch (error) {
      toast.error(error.message);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Available Cars</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <div key={car.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{car.brand} {car.model}</h3>
              <p className="text-gray-600 mb-4">Year: {car.year}</p>
              <p className="text-lg font-semibold text-indigo-600 mb-4">
                ${car.daily_rate}/day
              </p>
              <button
                onClick={() => setSelectedCar(car)}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Rent Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedCar && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Rent {selectedCar.brand} {selectedCar.model}</h2>
            
            <form onSubmit={handleRent}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  required
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={rentalDates.startDate}
                  onChange={(e) => setRentalDates({ ...rentalDates, startDate: e.target.value })}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  required
                  min={rentalDates.startDate}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={rentalDates.endDate}
                  onChange={(e) => setRentalDates Continuing exactly where we left off with the CarList.jsx file:

                  value={rentalDates.endDate}
                  onChange={(e) => setRentalDates({ ...rentalDates, endDate: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setSelectedCar(null)}
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Confirm Rental
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}