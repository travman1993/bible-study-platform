// frontend/src/components/dashboard/TeacherDashboard.jsx
import { useState, useEffect } from 'react'
import { LogOut } from 'lucide-react'
import Calendar from './Calendar'
import StudiesList from './StudiesList'
import ContactBook from './ContactBook'
import ProfileSection from './ProfileSection'
import './TeacherDashboard.css'

function TeacherDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('calendar')
  const [studies, setStudies] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchStudies()
  }, [])

  const fetchStudies = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/studies', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setStudies(data.studies || [])
      }
    } catch (err) {
      console.error('Error fetching studies:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStartStudy = (studyId) => {
    // Navigate to live study view
    window.location.href = `/study/${studyId}`
  }

  return (
    <div className="teacher-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>
            <img src="/src/assets/winner.png" alt="Gathered" className="logo-img" /> 
            Gathered
          </h1>
          <p className="welcome-text">Welcome back, {user?.name}!</p>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span>{user?.email}</span>
            {user?.role === 'teacher' && (
              <span className="badge teacher-badge">👨‍🏫 Teacher</span>
            )}
          </div>
          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button
          className={`nav-tab ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
          title="Schedule and view your Bible studies"
        >
          📅 Calendar
        </button>
        <button
          className={`nav-tab ${activeTab === 'studies' ? 'active' : ''}`}
          onClick={() => setActiveTab('studies')}
          title="View all your created studies"
        >
          📚 My Studies
        </button>
        <button
          className={`nav-tab ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contacts')}
          title="Manage contacts and send invites"
        >
          👥 Contacts
        </button>
        <button
          className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
          title="Update your profile"
        >
          ⚙️ Profile
        </button>
      </nav>

      {/* Content Area */}
      <main className="dashboard-content">
        {activeTab === 'calendar' && (
          <Calendar 
            studies={studies} 
            onStartStudy={handleStartStudy}
            onRefresh={fetchStudies}
          />
        )}

        {activeTab === 'studies' && (
          <StudiesList
            studies={studies}
            loading={loading}
            onStartStudy={handleStartStudy}
            onRefresh={fetchStudies}
          />
        )}

        {activeTab === 'contacts' && (
          <ContactBook userId={user?._id} />
        )}

        {activeTab === 'profile' && (
          <ProfileSection user={user} onProfileUpdate={fetchStudies} />
        )}
      </main>
    </div>
  )
}

export default TeacherDashboard