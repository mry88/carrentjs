import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import UserDashboard from './pages/user/Dashboard';
import CarList from './pages/user/CarList';
import AdminCarManagement from './pages/admin/CarManagement';
import RentalHistory from './pages/user/RentalHistory';
import AdminRentals from './pages/admin/Rentals';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="cars" element={<AdminCarManagement />} />
            <Route path="rentals" element={<AdminRentals />} />
          </Route>

          {/* User Routes */}
          <Route path="/" element={<ProtectedRoute />}>
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="cars" element={<CarList />} />
            <Route path="rentals" element={<RentalHistory />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;