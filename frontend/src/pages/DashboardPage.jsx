// frontend/src/pages/DashboardPage.jsx - ROLE-BASED VERSION
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TeacherDashboard from '../components/dashboard/TeacherDashboard'
import ParticipantDashboard from '../components/dashboard/ParticipantDashboard'
import './DashboardPage.css'

function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  if (loading) {
    return (
      <div className="dashboard-loading">
        <p>Loading dashboard...</p>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Show appropriate dashboard based on role
  if (user?.role === 'teacher') {
    return <TeacherDashboard user={user} onLogout={handleLogout} />
  } else {
    return <ParticipantDashboard user={user} onLogout={handleLogout} />
  }
}

export default DashboardPage