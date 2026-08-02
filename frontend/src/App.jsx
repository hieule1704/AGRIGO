import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LiveSupportWidget from './components/LiveSupportWidget';
import BackendHealthBanner from './components/BackendHealthBanner';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Search from './pages/Search';
import MachineDetail from './pages/MachineDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerDashboard from './pages/OwnerDashboard';
import FarmerBookings from './pages/FarmerBookings';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import PricingPolicy from './pages/PricingPolicy';
import Guide from './pages/Guide';

import Profile from './pages/Profile';
import OwnerPublicProfile from './pages/OwnerPublicProfile';

export default function App() {
  return (
    <>
      <BackendHealthBanner />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/machine/:id" element={<MachineDetail />} />
        <Route path="/owner-profile/:id" element={<OwnerPublicProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<PricingPolicy />} />
        <Route path="/guide" element={<Guide />} />

        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/owner/*" element={
          <ProtectedRoute roles={['owner']}><OwnerDashboard /></ProtectedRoute>
        } />
        <Route path="/my-bookings" element={
          <ProtectedRoute roles={['farmer']}><FarmerBookings /></ProtectedRoute>
        } />
        <Route path="/admin/*" element={
          <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
        } />

        <Route path="*" element={<div className="container" style={{ padding: 80, textAlign: 'center' }}>
          <h1>404</h1><p>Không tìm thấy trang bạn yêu cầu.</p>
        </div>} />
      </Routes>
      <Footer />
      <LiveSupportWidget />
    </>
  );
}
