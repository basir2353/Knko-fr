import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import PractitionerDashboard from './components/PractitionerDashboard';
import { getToken, removeToken } from './utils/secureStorage';
import { initSocket, disconnectSocket } from './utils/socket';
import config from './utils/config';

// Import dashboard pages
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/dashboard/page';
import AppointmentPage from './pages/dashboard/appointment/page';
import ServicesPage from './pages/dashboard/services/page';
import ServiceDetailPage from './pages/dashboard/services/[id]/page';
import WellnessPage from './pages/dashboard/wellness/page';
import MembershipPage from './pages/dashboard/membership/page';
import SessionSummaryPage from './pages/dashboard/session-summary/page';
import ResourcesPage from './pages/dashboard/resources/page';


function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    try {
      const token = getToken();
      if (token) {
        await fetch(`${config.API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      disconnectSocket();
      removeToken();
      setUser(null);
      setCurrentView('login');
    }
  };

  // Check if user is already logged in
  React.useEffect(() => {
    const token = getToken();
    if (token) {
      // Verify token with backend
      fetch(`${config.API_BASE_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.valid) {
            // Initialize socket connection if user is logged in
            initSocket();
            setUser(data.user);
            setCurrentView('dashboard');
          } else {
            // Token invalid, remove it
            removeToken();
          }
        })
        .catch(err => {
          // Don't log sensitive information
          console.error('Token verification failed');
          removeToken();
        });
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={
            <Login
              onLogin={handleLogin}
              onSwitchToSignup={() => {}}
            />
          } />
          <Route path="/signup" element={
            <Signup
              onSignup={handleLogin}
              onSwitchToLogin={() => {}}
            />
          } />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="appointment" element={<AppointmentPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="services/:id" element={<ServiceDetailPage />} />
            <Route path="wellness" element={<WellnessPage />} />
            <Route path="membership" element={<MembershipPage />} />
            <Route path="session-summary" element={<SessionSummaryPage />} />
            <Route path="resources" element={<ResourcesPage />} />
          </Route>

          {/* Redirect /sign to /signup */}
          <Route path="/sign" element={<Navigate to="/signup" replace />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
