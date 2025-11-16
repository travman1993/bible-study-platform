import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProfileSection from '../components/dashboard/ProfileSection'
import ContactBook from '../components/dashboard/ContactBook'
import Calendar from '../components/dashboard/Calendar'
import StudiesList from '../components/dashboard/StudiesList'
import './DashboardPage.css'

function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('calendar') // calendar, contacts, profile, studies
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
        setStudies(data)
      }
    } catch (err) {
      console.error('Error fetching studies:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStartStudy = (studyId) => {
    navigate(`/study/${studyId}`)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>📖 Bible Study Platform</h1>
          <p className="welcome-text">Welcome back, {user?.name}!</p>
        </div>
        <div className="header-right">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button
          className={`nav-tab ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          📅 Calendar
        </button>
        <button
          className={`nav-tab ${activeTab === 'studies' ? 'active' : ''}`}
          onClick={() => setActiveTab('studies')}
        >
          📚 My Studies
        </button>
        <button
          className={`nav-tab ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contacts')}
        >
          👥 Contacts
        </button>
        <button
          className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
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

export default DashboardPage