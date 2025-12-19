import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import PractitionerDashboard from './components/PractitionerDashboard';
import { getToken, removeToken } from './utils/secureStorage';
import { initSocket, disconnectSocket } from './utils/socket';

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
        await fetch('http://localhost:5001/api/auth/logout', {
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
      fetch('http://localhost:5001/api/auth/verify', {
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
    <div className="App">
      {currentView === 'login' && (
        <Login 
          onLogin={handleLogin} 
          onSwitchToSignup={() => setCurrentView('signup')} 
        />
      )}
      {currentView === 'signup' && (
        <Signup 
          onSignup={handleLogin} 
          onSwitchToLogin={() => setCurrentView('login')} 
        />
      )}
      {currentView === 'dashboard' && user && (
        user.userType === 'practitioner' ? (
          <PractitionerDashboard user={user} onLogout={handleLogout} />
        ) : (
          <Dashboard user={user} onLogout={handleLogout} />
        )
      )}
    </div>
  );
}

export default App;
