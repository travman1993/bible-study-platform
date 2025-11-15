import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { TeacherCamera } from './components/TeacherCamera'
import { ParticipantView } from './components/ParticipantView'
import { BibleDisplay } from './components/BibleDisplay'
import { BibleSearch } from './components/BibleSearch'
import { HighlightTool } from './components/HighlightTool'
import './App.css'

function App() {
  const [socket, setSocket] = useState(null)
  const [isTeacher, setIsTeacher] = useState(false)
  const [passage, setPassage] = useState('John 3:16')
  const [verses, setVerses] = useState([])
  const [highlights, setHighlights] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [teacherCamera, setTeacherCamera] = useState(null)

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      newSocket.emit('join-study', 'test-study')
    })

    newSocket.on('highlight-updated', (data) => {
      setHighlights(prev => [...prev, data])
    })

    newSocket.on('teacher-camera', (stream) => {
      setTeacherCamera(stream)
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    setSocket(newSocket)
    return () => newSocket.disconnect()
  }, [])

  const handleSearch = ({ passage, verses }) => {
    setPassage(passage)
    setVerses(verses)
    setHighlights([])
  }

  const handleHighlight = (highlight) => {
    setHighlights(prev => [...prev, highlight])
  }

  // PARTICIPANT VIEW (Simple - just watch)
  if (!isTeacher) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>📖 Bible Study Live</h1>
          <div className="connection-status">
            {isConnected ? (
              <span className="status-connected">🟢 Connected</span>
            ) : (
              <span className="status-disconnected">🔴 Disconnected</span>
            )}
          </div>
        </header>
        <ParticipantView socket={socket} teacherCamera={teacherCamera} />
        <button 
          className="switch-btn"
          onClick={() => setIsTeacher(true)}
          style={{ display: 'none' }} // Only for testing
        >
          Teacher Mode
        </button>
      </div>
    )
  }

  // TEACHER VIEW (Full controls)
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <h1>📖 Bible Study Platform</h1>
          <span className="teacher-indicator">Teacher Mode</span>
        </div>
        <div className="connection-status">
          {isConnected ? (
            <span className="status-connected">🟢 Connected</span>
          ) : (
            <span className="status-disconnected">🔴 Disconnected</span>
          )}
        </div>
      </header>

      <main className="app-main">
        <div className="sidebar">
          <BibleSearch onSearch={handleSearch} />
          <HighlightTool onHighlight={handleHighlight} socket={socket} />
        </div>

        <div className="content">
          <TeacherCamera socket={socket} isTeacher={isTeacher} />
          <BibleDisplay 
            passage={passage} 
            verses={verses} 
            highlights={highlights} 
          />
        </div>
      </main>

      {/* AD SPOT - Bottom of page */}
      <div className="footer-ad">
        <small>Advertisement</small>
      </div>

      <button 
        className="switch-btn"
        onClick={() => setIsTeacher(false)}
        style={{ display: 'none' }} // Only for testing
      >
        Participant Mode
      </button>
    </div>
  )
}

export default App