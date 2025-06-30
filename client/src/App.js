import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { WeatherProvider } from './context/WeatherContext';

// Import pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import CartPage from './pages/CartPage';
import OrderHistory from './pages/OrderHistory';
import RestaurantPage from './pages/RestaurantPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboardSimple';

// Import components
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <WeatherProvider>
        <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={
            user ? (
              user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />
            ) : (
              <LoginPage />
            )
          } />
          <Route path="/signup" element={
            user ? (
              user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />
            ) : (
              <SignupPage />
            )
          } />
          
          {/* Protected routes - User only */}
          <Route path="/dashboard" element={
            user ? (
              user.role === 'admin' ? (
                <Navigate to="/admin" />
              ) : (
                <>
                  <Navbar />
                  <Dashboard />
                </>
              )
            ) : (
              <Navigate to="/login" />
            )
          } />
          
          <Route path="/cart" element={
            user ? (
              user.role === 'admin' ? (
                <Navigate to="/admin" />
              ) : (
                <>
                  <Navbar />
                  <CartPage />
                </>
              )
            ) : (
              <Navigate to="/login" />
            )
          } />
          
          <Route path="/orders" element={
            user ? (
              user.role === 'admin' ? (
                <Navigate to="/admin" />
              ) : (
                <>
                  <Navbar />
                  <OrderHistory />
                </>
              )
            ) : (
              <Navigate to="/login" />
            )
          } />
          
          <Route path="/profile" element={
            user ? (
              user.role === 'admin' ? (
                <Navigate to="/admin" />
              ) : (
                <>
                  <Navbar />
                  <ProfilePage />
                </>
              )
            ) : (
              <Navigate to="/login" />
            )
          } />
          
          <Route path="/restaurant/:id" element={
            user ? (
              user.role === 'admin' ? (
                <Navigate to="/admin" />
              ) : (
                <>
                  <Navbar />
                  <RestaurantPage />
                </>
              )
            ) : (
              <Navigate to="/login" />
            )
          } />
          
          {/* Admin routes */}
          <Route path="/admin" element={
            user ? (
              user.role === 'admin' ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/dashboard" />
              )
            ) : (
              <Navigate to="/login" />
            )
          } />
          
          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      </WeatherProvider>
    </ErrorBoundary>
  );
}

export default App;
