import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { TeacherCamera } from '../components/TeacherCamera'
import { ParticipantView } from '../components/ParticipantView'
import { BibleDisplay } from '../components/BibleDisplay'
import { BibleSearch } from '../components/BibleSearch'
import { HighlightTool } from '../components/HighlightTool'
import { useAuth } from '../context/AuthContext'
import './LiveStudyPage.css'

function LiveStudyPage() {
  const { studyId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [socket, setSocket] = useState(null)
  const [isTeacher, setIsTeacher] = useState(false)
  const [passage, setPassage] = useState('John 3:16')
  const [verses, setVerses] = useState([])
  const [highlights, setHighlights] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [teacherCamera, setTeacherCamera] = useState(null)
  const [studyInfo, setStudyInfo] = useState(null)
  const [participantCount, setParticipantCount] = useState(0)

  useEffect(() => {
    // Connect to socket
    const newSocket = io('http://localhost:3000', {
      auth: {
        token: localStorage.getItem('token'),
        studyId: studyId,
        userId: user?._id
      },
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      newSocket.emit('join-study', { studyId, userId: user?._id })
    })

    newSocket.on('study-info', (info) => {
      setStudyInfo(info)
      setIsTeacher(info.creatorId === user?._id)
    })

    newSocket.on('participant-count', (count) => {
      setParticipantCount(count)
    })

    newSocket.on('highlight-updated', (data) => {
      setHighlights(prev => [...prev, data])
    })

    newSocket.on('teacher-camera', (stream) => {
      setTeacherCamera(stream)
    })

    newSocket.on('passage-changed', (data) => {
      setPassage(data.passage)
      setVerses(data.verses)
      setHighlights([])
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    setSocket(newSocket)

    return () => newSocket.disconnect()
  }, [studyId, user?._id])

  const handleSearch = ({ passage, verses }) => {
    setPassage(passage)
    setVerses(verses)
    setHighlights([])
    socket?.emit('passage-update', { passage, verses, studyId })
  }

  const handleHighlight = (highlight) => {
    setHighlights(prev => [...prev, highlight])
    socket?.emit('highlight', { ...highlight, studyId })
  }

  const handleEndStudy = () => {
    socket?.emit('end-study', { studyId })
    navigate('/dashboard')
  }

  // PARTICIPANT VIEW
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
          <div className="participant-info">
            <span>{participantCount} people in study</span>
          </div>
        </header>
        <ParticipantView socket={socket} teacherCamera={teacherCamera} />
      </div>
    )
  }

  // TEACHER VIEW
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <h1>📖 Bible Study Platform</h1>
          <span className="teacher-indicator">Teacher Mode</span>
        </div>
        <div className="header-center">
          <p className="study-title">{studyInfo?.title || 'Untitled Study'}</p>
        </div>
        <div className="header-right">
          <span className="connection-status">
            {isConnected ? (
              <span className="status-connected">🟢 Connected</span>
            ) : (
              <span className="status-disconnected">🔴 Disconnected</span>
            )}
          </span>
          <button className="end-study-btn" onClick={handleEndStudy}>
            End Study
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="sidebar">
          <BibleSearch onSearch={handleSearch} />
          <HighlightTool onHighlight={handleHighlight} socket={socket} />
          <div className="participant-counter">
            <p>👥 {participantCount} Participants</p>
          </div>
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
    </div>
  )
}

export default LiveStudyPage