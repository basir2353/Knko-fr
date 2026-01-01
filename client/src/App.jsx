import React, { useState, useEffect, createContext, useContext } from 'react';
import './App.css';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import PractitionerDashboard from './components/PractitionerDashboard';
import { getToken, removeToken } from './utils/secureStorage';
import { initSocket, disconnectSocket } from './utils/socket';
import config from './utils/config';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import UserRoutes from './routes/UserRoutes';

// Create Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogin = (userData) => {
    setUser(userData);
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
    }
  };

  // Check if user is already logged in
  useEffect(() => {
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
          } else {
            // Token invalid, remove it
            removeToken();
          }
        })
        .catch(err => {
          console.error('Token verification failed');
          removeToken();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Login Page Wrapper
const LoginPage = () => {
  const { user, handleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.userType === 'practitioner' ? '/practitioner-dashboard' : '/user-dashboard');
    }
  }, [user, navigate]);

  return (
    <Login 
      onLogin={(userData) => {
        handleLogin(userData);
        navigate(userData.userType === 'practitioner' ? '/practitioner-dashboard' : '/user-dashboard');
      }} 
      onSwitchToSignup={() => navigate('/signup')} 
    />
  );
};

// Signup Page Wrapper
const SignupPage = () => {
  const { user, handleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.userType === 'practitioner' ? '/practitioner-dashboard' : '/user-dashboard');
    }
  }, [user, navigate]);

  return (
    <Signup 
      onSignup={(userData) => {
        handleLogin(userData);
        navigate(userData.userType === 'practitioner' ? '/practitioner-dashboard' : '/user-dashboard');
      }} 
      onSwitchToLogin={() => navigate('/login')} 
    />
  );
};

// Old Dashboard Wrapper (for practitioner)
const PractitionerDashboardPage = () => {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await handleLogout();
    navigate('/login');
  };

  return <PractitionerDashboard user={user} onLogout={onLogout} />;
};

// Old User Dashboard Wrapper
const OldDashboardPage = () => {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await handleLogout();
    navigate('/login');
  };

  return <Dashboard user={user} onLogout={onLogout} />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Protected User Dashboard Routes */}
            <Route 
              path="/user-dashboard/*" 
              element={
                <ProtectedRoute>
                  <UserRoutes />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Practitioner Dashboard */}
            <Route 
              path="/practitioner-dashboard" 
              element={
                <ProtectedRoute>
                  <PractitionerDashboardPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Legacy dashboard route */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <OldDashboardPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
