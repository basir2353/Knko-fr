import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { getToken, removeToken } from '../utils/secureStorage';
import { initSocket, disconnectSocket } from '../utils/socket';
import config from '../utils/config';

const Dashboard = ({ user, onLogout }) => {
  const [availability, setAvailability] = useState([]);
  const [practitioners, setPractitioners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [formData, setFormData] = useState({
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '17:00'
  });

  const getUserTypeLabel = (type) => {
    const labels = {
      patient: 'Patient',
      practitioner: 'Practitioner',
      admin: 'Administrator'
    };
    return labels[type] || type;
  };

  const getUserTypeColor = (type) => {
    const colors = {
      patient: '#4CAF50',
      practitioner: '#2196F3',
      admin: '#FF9800'
    };
    return colors[type] || '#757575';
  };

  // Token is now retrieved from secure storage utility

  // Fetch availability for practitioner
  const fetchAvailability = async () => {
    if (user.userType !== 'practitioner') return;
    
    try {
      const token = getToken();
      if (!token) {
        onLogout();
        return;
      }
      const response = await fetch(`${config.API_BASE_URL}/api/practitioner/availability`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setAvailability(data.availability || []);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  // Fetch all practitioners (for admin and users)
  const fetchPractitioners = async () => {
    if (user.userType === 'practitioner') return;
    
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        onLogout();
        return;
      }
      const response = await fetch(`${config.API_BASE_URL}/api/practitioner/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Fetched practitioners:', data.practitioners);
        setPractitioners(data.practitioners || []);
      } else {
        console.error('Error fetching practitioners:', data);
      }
    } catch (error) {
      console.error('Error fetching practitioners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.userType === 'practitioner') {
      fetchAvailability();
    } else {
      fetchPractitioners();
      
      // Set up Socket.IO for real-time updates (admin/patient view)
      const socket = initSocket();
      
      // Listen for practitioner status updates
      socket.on('practitioner:status', (data) => {
        console.log('Received practitioner status update:', data);
        setPractitioners(prevPractitioners => {
          return prevPractitioners.map(practitioner => {
            if (practitioner.id === data.userId) {
              return {
                ...practitioner,
                isActive: data.isActive,
                lastActivity: data.lastActivity
              };
            }
            return practitioner;
          });
        });
      });

      return () => {
        socket.off('practitioner:status');
        // Don't disconnect socket as it might be used by other components
      };
    }
  }, [user.userType]);

  // Handle availability form submission
  const handleAvailabilitySubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        onLogout();
        return;
      }
      const response = await fetch(`${config.API_BASE_URL}/api/practitioner/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        await fetchAvailability();
        setShowAvailabilityForm(false);
        setFormData({ dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' });
        alert('Availability updated successfully!');
      } else {
        // Show detailed error message
        let errorMessage = data.error || 'Error updating availability';
        if (data.details) {
          if (Array.isArray(data.details)) {
            errorMessage += ': ' + data.details.map(d => d.msg || d).join(', ');
          } else {
            errorMessage += ': ' + data.details;
          }
        }
        console.error('Error response:', data);
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      alert(`Error updating availability: ${error.message || 'Network error. Please check if the server is running.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete availability
  const handleDeleteAvailability = async (id) => {
    if (!window.confirm('Are you sure you want to delete this availability slot?')) {
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        onLogout();
        return;
      }
      const response = await fetch(`${config.API_BASE_URL}/api/practitioner/availability/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchAvailability();
        alert('Availability deleted successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Error deleting availability');
      }
    } catch (error) {
      console.error('Error deleting availability:', error);
      alert('Error deleting availability');
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h1>Welcome to Dashboard</h1>
          <button 
            onClick={() => {
              disconnectSocket();
              onLogout();
            }} 
            className="logout-btn"
          >
            Logout
          </button>
        </div>

        <div className="user-info">
          <div 
            className="user-type-badge"
            style={{ backgroundColor: getUserTypeColor(user.userType) }}
          >
            {getUserTypeLabel(user.userType)}
          </div>
          
          <div className="user-details">
            <h2>
              {user.firstName} {user.lastName}
            </h2>
            <p className="user-email">{user.email}</p>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="info-section">
            <h3>Account Information</h3>
            <div className="info-item">
              <span className="info-label">User ID:</span>
              <span className="info-value">{user.userId || user.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Account Type:</span>
              <span className="info-value">{getUserTypeLabel(user.userType)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{user.email}</span>
            </div>
          </div>

          {/* Practitioner Availability Management */}
          {user.userType === 'practitioner' && (
            <div className="info-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3>My Availability</h3>
                <button 
                  onClick={() => setShowAvailabilityForm(!showAvailabilityForm)}
                  className="add-availability-btn"
                >
                  {showAvailabilityForm ? 'Cancel' : '+ Add Availability'}
                </button>
              </div>

              {showAvailabilityForm && (
                <form onSubmit={handleAvailabilitySubmit} className="availability-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Day of Week</label>
                      <select
                        value={formData.dayOfWeek}
                        onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                        required
                      >
                        {daysOfWeek.map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Start Time</label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>End Time</label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {availability.length > 0 ? (
                <div className="availability-list">
                  {availability.map((slot) => (
                    <div key={slot.id} className="availability-item">
                      <div className="availability-info">
                        <strong>{slot.dayOfWeek}</strong>
                        <span>{slot.startTime} - {slot.endTime}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteAvailability(slot.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-availability">No availability set. Click "+ Add Availability" to set your schedule.</p>
              )}
            </div>
          )}

          {/* Admin and User View: Practitioner List with Availability */}
          {(user.userType === 'admin' || user.userType === 'patient') && (
            <div className="info-section">
              <h3>Available Practitioners</h3>
              {loading ? (
                <p>Loading practitioners...</p>
              ) : practitioners.length > 0 ? (
                <div className="practitioners-list">
                  {practitioners.map((practitioner) => (
                    <div key={practitioner.id} className="practitioner-card">
                      <div className="practitioner-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h4>{practitioner.firstName} {practitioner.lastName}</h4>
                          {practitioner.isActive && (
                            <span className="active-status-badge" title="Currently Active">
                              <span className="active-dot"></span>
                              Active
                            </span>
                          )}
                        </div>
                        <span className="practitioner-email">{practitioner.email}</span>
                      </div>
                      {practitioner.availability.length > 0 ? (
                        <div className="practitioner-availability">
                          <strong>Availability:</strong>
                          <div className="availability-slots">
                            {practitioner.availability.map((slot, index) => (
                              <div key={index} className="availability-slot">
                                <span className="day">{slot.dayOfWeek}</span>
                                <span className="time">{slot.startTime} - {slot.endTime}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="no-availability-text">No availability set</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No practitioners found.</p>
              )}
            </div>
          )}

          <div className="welcome-message">
            <p>
              You have successfully logged in as a <strong>{getUserTypeLabel(user.userType)}</strong>.
            </p>
            <p>This is your personalized dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
