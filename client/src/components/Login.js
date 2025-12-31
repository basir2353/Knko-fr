import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';
import { setToken } from '../utils/secureStorage';
import { initSocket } from '../utils/socket';
import config from '../utils/config';

const Login = ({ onLogin, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'patient'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      // Handle rate limiting (429) specifically
      if (response.status === 429) {
        let data;
        try {
          data = await response.json();
        } catch {
          data = { error: 'Too many login attempts. Please wait 15 minutes before trying again.' };
        }
        setError(data.error || data.message || 'Too many login attempts. Please wait 15 minutes before trying again.');
        return;
      }

      // Check if response is ok before trying to parse JSON
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If response is not JSON, check status
        if (!response.ok) {
          setError('Server error occurred. Please try again later.');
          return;
        }
        throw parseError;
      }

      if (response.ok) {
        // Use secure storage instead of direct localStorage
        setToken(data.token);
        // Initialize socket connection after login
        initSocket();
        onLogin(data.user);
      } else {
        // Generic error message - don't expose specific details
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      // More specific error handling
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        console.error('Network error: Server may not be running');
        setError('Unable to connect to server. Please ensure the server is running on port 5001.');
      } else {
        console.error('Login error occurred:', err.message);
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="switch-auth">
          Don't have an account?{' '}
          <Link to="/signup" className="link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

