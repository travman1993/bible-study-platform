// frontend/src/components/dashboard/ParticipantDashboard.jsx
import { useState, useEffect } from 'react'
import { LogOut } from 'lucide-react'
import ProfileSection from './ProfileSection'
import './ParticipantDashboard.css'

function ParticipantDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('calendar')
  const [studies, setStudies] = useState([])
  const [loading, setLoading] = useState(false)
  const [upcomingStudies, setUpcomingStudies] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    fetchFollowedStudies()
  }, [])

  const fetchFollowedStudies = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/studies', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        // For participants, filter only studies they've joined
        const participantStudies = data.studies?.filter(s => !s.isCreator) || []
        setStudies(participantStudies)
        
        // Sort by date and get upcoming
        const upcoming = participantStudies
          .filter(s => new Date(s.startTime) > new Date())
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
          .slice(0, 5)
        setUpcomingStudies(upcoming)
      }
    } catch (err) {
      console.error('Error fetching studies:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinStudy = (studyId) => {
    window.location.href = `/study/${studyId}`
  }

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getStudiesForDate = (day) => {
    return studies.filter(study => {
      const studyDate = new Date(study.startTime)
      return studyDate.getDate() === day &&
             studyDate.getMonth() === currentDate.getMonth() &&
             studyDate.getFullYear() === currentDate.getFullYear()
    })
  }

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const days = []
  const totalDays = daysInMonth(currentDate)
  const firstDay = firstDayOfMonth(currentDate)

  // Empty cells before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // Days of month
  for (let i = 1; i <= totalDays; i++) {
    days.push(i)
  }

  return (
    <div className="participant-dashboard">
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
            {user?.role === 'participant' && (
              <span className="badge participant-badge">👤 Participant</span>
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
          title="View teacher studies calendar"
        >
          📅 Studies Calendar
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
          <div className="calendar">
            <div className="calendar-header">
              <h2>📅 Bible Studies Calendar</h2>
              <p className="subtitle">Browse upcoming studies and join a session</p>
            </div>

            {/* Calendar Navigation */}
            <div className="calendar-nav">
              <button onClick={handlePrevMonth} className="nav-btn">← Previous</button>
              <h3>{monthName}</h3>
              <button onClick={handleNextMonth} className="nav-btn">Next →</button>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">
              <div className="weekdays">
                <div className="weekday">Sun</div>
                <div className="weekday">Mon</div>
                <div className="weekday">Tue</div>
                <div className="weekday">Wed</div>
                <div className="weekday">Thu</div>
                <div className="weekday">Fri</div>
                <div className="weekday">Sat</div>
              </div>

              <div className="days">
                {days.map((day, index) => {
                  const dayStudies = day ? getStudiesForDate(day) : []
                  return (
                    <div
                      key={index}
                      className={`day ${day ? '' : 'empty'} ${dayStudies.length > 0 ? 'has-studies' : ''}`}
                    >
                      {day && (
                        <>
                          <div className="day-number">{day}</div>
                          <div className="day-studies">
                            {dayStudies.slice(0, 2).map(study => (
                              <div
                                key={study._id}
                                className="study-item"
                                onClick={() => handleJoinStudy(study._id)}
                                title={study.title}
                              >
                                <small>{study.title}</small>
                              </div>
                            ))}
                            {dayStudies.length > 2 && (
                              <small className="more-studies">+{dayStudies.length - 2} more</small>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Upcoming Studies */}
            <div className="upcoming-studies">
              <h3>📋 Upcoming Studies</h3>
              {loading ? (
                <p>Loading studies...</p>
              ) : upcomingStudies.length === 0 ? (
                <div className="no-studies">
                  <p>No upcoming studies. Check back soon!</p>
                  <small>You'll see studies here when a teacher invites you or you join using a join code.</small>
                </div>
              ) : (
                <div className="studies-list">
                  {upcomingStudies.map(study => (
                    <div key={study._id} className="upcoming-study">
                      <div className="study-info">
                        <h4>{study.title}</h4>
                        <p>{new Date(study.startTime).toLocaleString()}</p>
                      </div>
                      <button
                        className="join-btn"
                        onClick={() => handleJoinStudy(study._id)}
                      >
                        Join Study
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <ProfileSection user={user} onProfileUpdate={fetchFollowedStudies} />
        )}
      </main>
    </div>
  )
}

export default ParticipantDashboard