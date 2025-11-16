import { useState } from 'react'
import './StudiesList.css'

function StudiesList({ studies, loading, onStartStudy, onRefresh }) {
  const [sortBy, setSortBy] = useState('date') // date or title
  const [filterStatus, setFilterStatus] = useState('all') // all, scheduled, ongoing, completed

  const handleDeleteStudy = async (studyId) => {
    if (!confirm('Delete this study? This cannot be undone.')) return

    try {
      const response = await fetch(`/api/studies/${studyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        onRefresh?.()
      }
    } catch (err) {
      console.error('Error deleting study:', err)
    }
  }

  const getStudyStatus = (study) => {
    const now = new Date()
    const startTime = new Date(study.startTime)
    const endTime = new Date(study.endTime)

    if (endTime < now) return 'completed'
    if (startTime <= now && now <= endTime) return 'ongoing'
    return 'scheduled'
  }

  let filteredStudies = studies.filter(study => {
    if (filterStatus === 'all') return true
    return getStudyStatus(study) === filterStatus
  })

  if (sortBy === 'title') {
    filteredStudies.sort((a, b) => a.title.localeCompare(b.title))
  } else {
    filteredStudies.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
  }

  return (
    <div className="studies-list-container">
      <div className="list-header">
        <h2>📚 My Studies</h2>
        <div className="list-controls">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Studies</option>
            <option value="scheduled">Scheduled</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="loading">Loading studies...</p>
      ) : filteredStudies.length === 0 ? (
        <div className="no-studies">
          <p>No studies found</p>
          <small>Create your first study from the Calendar tab</small>
        </div>
      ) : (
        <div className="studies-grid">
          {filteredStudies.map(study => {
            const status = getStudyStatus(study)
            const startDate = new Date(study.startTime)
            const startTime = startDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })
            const startDateStr = startDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })

            return (
              <div key={study._id} className={`study-card status-${status}`}>
                <div className="card-header">
                  <h3>{study.title}</h3>
                  <span className={`status-badge ${status}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>

                {study.topic && (
                  <p className="study-topic">
                    <strong>Topic:</strong> {study.topic}
                  </p>
                )}

                {study.description && (
                  <p className="study-description">{study.description}</p>
                )}

                <div className="study-meta">
                  <div className="meta-item">
                    <span className="label">Date:</span>
                    <span>{startDateStr}</span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Time:</span>
                    <span>{startTime}</span>
                  </div>
                  {study.group && (
                    <div className="meta-item">
                      <span className="label">Group:</span>
                      <span className="group-tag">{study.group}</span>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  {status === 'scheduled' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => onStartStudy(study._id)}
                    >
                      Start Now
                    </button>
                  )}
                  {status === 'ongoing' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => onStartStudy(study._id)}
                    >
                      Join Study
                    </button>
                  )}
                  {status === 'completed' && (
                    <button className="btn btn-secondary" disabled>
                      View Recording
                    </button>
                  )}

                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteStudy(study._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default StudiesList