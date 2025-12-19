import React, { useState, useEffect } from 'react';
import './PractitionerDashboard.css';
import { getToken, removeToken } from '../utils/secureStorage';
import { initSocket, disconnectSocket } from '../utils/socket';

const PractitionerDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('upcoming');

  // Socket.IO heartbeat to keep session active
  useEffect(() => {
    if (user?.userType !== 'practitioner') return;

    const socket = initSocket();

    // Send heartbeat via socket immediately
    const sendHeartbeat = () => {
      if (socket.connected && user?.id) {
        socket.emit('practitioner:heartbeat', {
          userId: user.id
        });
      }
    };

    // Send heartbeat immediately
    sendHeartbeat();

    // Send heartbeat every 2 minutes to keep session active
    const heartbeatInterval = setInterval(sendHeartbeat, 2 * 60 * 1000);

    return () => {
      clearInterval(heartbeatInterval);
      // Don't disconnect socket here as it might be used by other components
    };
  }, [user]);

  // Mock data - in production, this would come from API
  const wellnessScore = 78;
  const metrics = {
    completedMilestone: 12,
    upcomingSessions: 32,
    inProgress: 5
  };

  const appointments = {
    upcoming: [
      {
        service: 'Deep Tissue Massage',
        practitioner: 'Sarah Mitchell, RMT',
        date: 'Tue, Nov 18 at 10:00 PM',
        duration: '90 min',
        location: 'Onsite'
      }
    ],
    completed: [],
    confirmed: []
  };

  const recentActivity = [
    { type: 'Appointment Booked', title: 'Massage Therapy for tomorrow', time: '2 Days Ago', icon: '📅' },
    { type: 'Session completed', title: 'Massage Therapy with Dr. Sarah Williams', time: '3 Days Ago', icon: '🏃' },
    { type: 'Form Submitted', title: 'Updated Health Intake Form', time: '1 Week Ago', icon: '📄' }
  ];

  const documents = [
    { name: 'LMN - Nov 2025', type: 'Letter of Medical Necessity' },
    { name: 'Wellness Assessment Results', type: 'Assessment' },
    { name: 'Service Agreement', type: 'Legal' }
  ];

  const careTeam = [
    { name: 'Dr. Michael Chen', specialty: 'Massage Therapist', avatar: '👨‍⚕️' },
    { name: 'Dr. Sarah Williams', specialty: 'Physiotherapist', avatar: '👩‍⚕️' }
  ];

  const wellnessGoals = [
    { title: 'Reduce chronic back pain', category: 'Physical Wellness', progress: 85, icon: '⚪' },
    { title: 'Manage stress and improve sleep', category: 'Mental Wellness', progress: 36, icon: '🧠' },
    { title: 'Optimize nutrition for energy', category: 'Nutritional Wellness', progress: 77, icon: '🍲' }
  ];

  const firstName = user?.firstName || 'User';

  return (
    <div className="practitioner-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">🍃</span>
            <span className="logo-text">KNKO</span>
          </div>
          <nav className="main-nav">
            <a href="#dashboard" className="nav-link active">Dashboard</a>
            <a href="#appointments" className="nav-link">Appointments</a>
            <a href="#wellness" className="nav-link">Wellness</a>
            <a href="#services" className="nav-link">Services</a>
            <a href="#haven" className="nav-link">Haven</a>
            <a href="#clinical-notes" className="nav-link">Clinical Notes</a>
          </nav>
        </div>
        <div className="header-right">
          <button className="icon-btn chat-btn">💬</button>
          <button className="icon-btn notification-btn">🔔</button>
          <div className="user-profile">
            <div className="profile-avatar">
              {firstName.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <div className="profile-name">{firstName} {user?.lastName || ''}</div>
              <div className="profile-status">Premium</div>
            </div>
          </div>
          <button 
            onClick={async () => {
              try {
                const token = getToken();
                if (token) {
                  await fetch('https://knko-fr.onrender.com/api/auth/logout', {
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
                onLogout();
              }
            }} 
            className="logout-btn-header"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <h1 className="greeting">Hello {firstName},</h1>

        {/* Top Section - Wellness Score and Metrics */}
        <div className="top-section">
          <div className="wellness-score-card">
            <h3>Here's your wellness Score</h3>
            <div className="score-container">
              <div className="score-circle">
                <div className="score-value">{wellnessScore}%</div>
              </div>
              <div className="score-progress-bar">
                <div className="progress-fill" style={{ width: `${wellnessScore}%` }}></div>
              </div>
            </div>
            <a href="#overview" className="see-overview">
              See Overview <span>→</span>
            </a>
          </div>

          <div className="metrics-container">
            <div className="metric-card">
              <div className="metric-value">{metrics.completedMilestone}</div>
              <div className="metric-label">Completed Milestone</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{metrics.upcomingSessions}</div>
              <div className="metric-label">Upcoming Sessions</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{metrics.inProgress}</div>
              <div className="metric-label">In Progress</div>
            </div>
          </div>
        </div>

        {/* Middle Section - Appointments and Recent Activity */}
        <div className="middle-section">
          <div className="appointments-section">
            <h2 className="section-title">Your Appointments</h2>
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveTab('completed')}
              >
                Completed
              </button>
              <button 
                className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming
              </button>
              <button 
                className={`tab ${activeTab === 'confirmed' ? 'active' : ''}`}
                onClick={() => setActiveTab('confirmed')}
              >
                Confirmed
              </button>
            </div>

            {activeTab === 'upcoming' && appointments.upcoming.length > 0 && (
              <div className="appointment-details">
                <div className="appointment-item">
                  <span className="appointment-icon">💆</span>
                  <div className="appointment-info">
                    <div className="appointment-field">
                      <strong>Service:</strong> {appointments.upcoming[0].service}
                    </div>
                    <div className="appointment-field">
                      <strong>Practitioner:</strong> {appointments.upcoming[0].practitioner}
                    </div>
                    <div className="appointment-field">
                      <strong>Date and Time:</strong> {appointments.upcoming[0].date} ({appointments.upcoming[0].duration})
                    </div>
                    <div className="appointment-field">
                      <strong>Location:</strong> {appointments.upcoming[0].location}
                    </div>
                  </div>
                </div>
                <div className="appointment-actions">
                  <button className="btn-reschedule">RESCHEDULE</button>
                  <button className="btn-cancel">CANCEL</button>
                </div>
              </div>
            )}

            {activeTab === 'completed' && appointments.completed.length === 0 && (
              <p className="empty-state">No completed appointments</p>
            )}

            {activeTab === 'confirmed' && appointments.confirmed.length === 0 && (
              <p className="empty-state">No confirmed appointments</p>
            )}
          </div>

          <div className="recent-activity-section">
            <h2 className="section-title">Recent Activity</h2>
            <div className="activity-list">
              {recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <span className="activity-icon">{activity.icon}</span>
                  <div className="activity-content">
                    <div className="activity-type">{activity.type}</div>
                    <div className="activity-title">{activity.title}</div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section - Documents, Care Team, Wellness Goals */}
        <div className="bottom-section">
          <div className="documents-section">
            <h2 className="section-title">My Documents</h2>
            <div className="documents-list">
              {documents.map((doc, index) => (
                <div key={index} className="document-item">
                  <span className="document-icon">📄</span>
                  <div className="document-info">
                    <div className="document-name">{doc.name}</div>
                    <div className="document-type">{doc.type}</div>
                  </div>
                  <button className="download-btn">⬇️</button>
                </div>
              ))}
            </div>
          </div>

          <div className="care-team-section">
            <h2 className="section-title">Your Care Team</h2>
            <div className="care-team-list">
              {careTeam.map((member, index) => (
                <div key={index} className="care-team-member">
                  <div className="member-avatar">{member.avatar}</div>
                  <div className="member-info">
                    <div className="member-name">{member.name}</div>
                    <div className="member-specialty">{member.specialty}</div>
                  </div>
                  <button className="chat-member-btn">💬</button>
                </div>
              ))}
            </div>
          </div>

          <div className="wellness-goals-section">
            <h2 className="section-title">Active Wellness Goals</h2>
            <div className="goals-list">
              {wellnessGoals.map((goal, index) => (
                <div key={index} className="goal-item">
                  <div className="goal-header">
                    <span className="goal-icon">{goal.icon}</span>
                    <div className="goal-info">
                      <div className="goal-title">{goal.title}</div>
                      <div className="goal-category">{goal.category}</div>
                    </div>
                  </div>
                  <div className="goal-progress">
                    <div className="goal-progress-bar">
                      <div 
                        className="goal-progress-fill" 
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <div className="goal-percentage">{goal.progress}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PractitionerDashboard;

