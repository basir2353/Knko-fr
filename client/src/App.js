import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import { getToken, removeToken } from './utils/secureStorage';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    removeToken();
    setUser(null);
    setCurrentView('login');
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
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
