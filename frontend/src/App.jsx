import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { BibleDisplay } from './components/BibleDisplay'
import { BibleSearch } from './components/BibleSearch'
import { HighlightTool } from './components/HighlightTool'
import './App.css'

function App() {
  const [socket, setSocket] = useState(null)
  const [passage, setPassage] = useState('John 3:16')
  const [verses, setVerses] = useState([])
  const [highlights, setHighlights] = useState([])
  const [isConnected, setIsConnected] = useState(false)

  // Connect to backend
  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to backend')
      newSocket.emit('join-study', 'test-study')
    })

    newSocket.on('highlight-updated', (data) => {
      setHighlights(prev => [...prev, data])
      console.log('Highlight received:', data)
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
    setHighlights([]) // Clear highlights for new passage
  }

  const handleHighlight = (highlight) => {
    setHighlights(prev => [...prev, highlight])
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Bible Study Platform</h1>
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

export default App
