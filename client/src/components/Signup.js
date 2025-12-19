import React, { useState } from 'react';
import './Auth.css';
import { setToken } from '../utils/secureStorage';
import { initSocket } from '../utils/socket';

const Signup = ({ onSignup, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://knko-fr.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          userType: formData.userType
        })
      });

      // Handle rate limiting (429) specifically
      if (response.status === 429) {
        let data;
        try {
          data = await response.json();
        } catch {
          data = { error: 'Too many signup attempts. Please wait 15 minutes before trying again.' };
        }
        setError(data.error || data.message || 'Too many signup attempts. Please wait 15 minutes before trying again.');
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
        // Initialize socket connection after signup
        initSocket();
        onSignup(data.user);
      } else {
        // Generic error messages - don't expose specific details
        if (data.errors) {
          setError('Validation failed. Please check your input.');
        } else {
          setError(data.error || 'Signup failed. Please try again.');
        }
      }
    } catch (err) {
      // More specific error handling
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        console.error('Network error: Server may not be running');
        setError('Unable to connect to server. Please ensure the server is running on port 5001.');
      } else {
        console.error('Signup error occurred:', err.message);
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="userType">Account Type</label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              required
            >
              <option value="patient">Patient</option>
              <option value="practitioner">Practitioner</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="Enter your first name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Enter your last name"
            />
          </div>

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
              placeholder="Enter your password (min 8 characters)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="switch-auth">
          Already have an account?{' '}
          <span onClick={onSwitchToLogin} className="link">
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;

