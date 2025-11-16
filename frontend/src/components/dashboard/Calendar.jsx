import { useState, useEffect } from 'react'
import './Calendar.css'

function Calendar({ studies, onStartStudy, onRefresh }) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 15)) // Nov 15, 2025
  const [viewMode, setViewMode] = useState('month') // month or week
  const [newStudyForm, setNewStudyForm] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '19:00',
    endTime: '20:00',
    group: 'General',
    topic: ''
  })

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

  const handleCreateStudy = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/studies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          startTime: new Date(`${formData.date}T${formData.startTime}`),
          endTime: new Date(`${formData.date}T${formData.endTime}`),
          group: formData.group,
          topic: formData.topic
        })
      })

      if (response.ok) {
        setFormData({
          title: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          startTime: '19:00',
          endTime: '20:00',
          group: 'General',
          topic: ''
        })
        setNewStudyForm(null)
        onRefresh?.()
      }
    } catch (err) {
      console.error('Error creating study:', err)
    }
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
    <div className="calendar">
      <div className="calendar-header">
        <h2>📅 Study Calendar</h2>
        <button
          className="create-study-btn"
          onClick={() => setNewStudyForm(!newStudyForm)}
        >
          {newStudyForm ? 'Cancel' : '+ Schedule Study'}
        </button>
      </div>

      {/* Create Study Form */}
      {newStudyForm && (
        <form className="create-study-form" onSubmit={handleCreateStudy}>
          <div className="form-grid">
            <div className="form-group">
              <label>Study Title</label>
              <input
                type="text"
                placeholder="e.g., John Chapter 3"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  title: e.target.value
                }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  date: e.target.value
                }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  startTime: e.target.value
                }))}
                required
              />
            </div>

            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  endTime: e.target.value
                }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Group</label>
              <select
                value={formData.group}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  group: e.target.value
                }))}
              >
                <option>General</option>
                <option>Mens Group</option>
                <option>Womens Group</option>
                <option>Young Adults</option>
              </select>
            </div>

            <div className="form-group">
              <label>Topic/Passage</label>
              <input
                type="text"
                placeholder="e.g., John 3:16-18"
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  topic: e.target.value
                }))}
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Description (Optional)</label>
            <textarea
              placeholder="Add notes or details about this study"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                description: e.target.value
              }))}
              rows={3}
            />
          </div>

          <button type="submit" className="submit-btn">Schedule Study</button>
        </form>
      )}

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
                          onClick={() => onStartStudy(study._id)}
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

      {/* Upcoming Studies List */}
      <div className="upcoming-studies">
        <h3>📋 Upcoming Studies</h3>
        {studies.length === 0 ? (
          <p>No studies scheduled yet</p>
        ) : (
          <div className="studies-list">
            {studies.slice(0, 5).map(study => (
              <div key={study._id} className="upcoming-study">
                <div className="study-info">
                  <h4>{study.title}</h4>
                  <p>{new Date(study.startTime).toLocaleString()}</p>
                </div>
                <button
                  className="start-btn"
                  onClick={() => onStartStudy(study._id)}
                >
                  Start Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Calendar