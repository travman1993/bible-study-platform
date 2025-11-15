import { useState, useEffect, useRef } from 'react'
import { Camera, CameraOff, Mic, MicOff } from 'lucide-react'

export function TeacherCamera({ socket, isTeacher = false }) {
  const videoRef = useRef(null)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [isMicOn, setIsMicOn] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [stream, setStream] = useState(null)

  // Start camera when isTeacher is true
  useEffect(() => {
    if (isTeacher && isCameraOn) {
      startCamera()
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [isTeacher, isCameraOn])

  const startCamera = async () => {
    try {
      setCameraError('')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: isMicOn
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setStream(mediaStream)

      // Broadcast to other participants via socket
      if (socket) {
        socket.emit('camera-started', {
          teacherId: socket.id,
          timestamp: new Date()
        })
      }

      console.log('✅ Camera started')
    } catch (err) {
      setCameraError(err.message)
      console.error('Camera error:', err)
      setIsCameraOn(false)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCameraOn(false)

    if (socket) {
      socket.emit('camera-stopped', {
        teacherId: socket.id,
        timestamp: new Date()
      })
    }
    console.log('❌ Camera stopped')
  }

  const toggleCamera = () => {
    if (isCameraOn) {
      stopCamera()
    } else {
      setIsCameraOn(true)
    }
  }

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isMicOn
        setIsMicOn(!isMicOn)
      }
    } else {
      setIsMicOn(!isMicOn)
    }
  }

  return (
    <div className="teacher-camera-container">
      <div className="camera-section">
        <div className="camera-header">
          <h3>👨‍🏫 Teacher</h3>
          {isTeacher && (
            <span className="teacher-badge">LIVE</span>
          )}
        </div>

        <div className="camera-feed">
          {isCameraOn ? (
            <video
              ref={videoRef}
              className="video-stream"
              autoPlay
              playsInline
              muted={isTeacher}
            />
          ) : (
            <div className="camera-placeholder">
              <CameraOff size={48} />
              <p>Camera is {isTeacher ? 'off' : 'not available'}</p>
            </div>
          )}
        </div>

        {cameraError && (
          <div className="camera-error">
            ⚠️ {cameraError}
          </div>
        )}

        {isTeacher && (
          <div className="camera-controls">
            <button
              className={`control-btn ${isCameraOn ? 'active' : ''}`}
              onClick={toggleCamera}
              title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
              aria-label={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isCameraOn ? <Camera size={20} /> : <CameraOff size={20} />}
              {isCameraOn ? 'Camera On' : 'Camera Off'}
            </button>

            <button
              className={`control-btn ${isMicOn ? 'active' : ''}`}
              onClick={toggleMic}
              title={isMicOn ? 'Mute' : 'Unmute'}
              aria-label={isMicOn ? 'Mute' : 'Unmute'}
              disabled={!isCameraOn}
            >
              {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
              {isMicOn ? 'Mic On' : 'Mic Off'}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .teacher-camera-container {
          width: 100%;
          margin-bottom: 24px;
        }

        .camera-section {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .camera-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .camera-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .teacher-badge {
          background: #ef4444;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .camera-feed {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #000;
          overflow: hidden;
        }

        .video-stream {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .camera-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          color: #9ca3af;
          gap: 12px;
        }

        .camera-placeholder p {
          margin: 0;
          font-size: 14px;
        }

        .camera-error {
          padding: 12px 16px;
          background: #fee2e2;
          color: #991b1b;
          font-size: 13px;
          border-left: 3px solid #ef4444;
          margin: 0;
        }

        .camera-controls {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          background: #f8fafb;
          border-top: 1px solid #e5e7eb;
        }

        .control-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 12px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          color: #6b7280;
          transition: all 0.2s ease;
        }

        .control-btn:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .control-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .control-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .camera-feed {
            aspect-ratio: 4 / 3;
          }

          .control-btn {
            font-size: 12px;
            padding: 8px 10px;
          }
        }
      `}</style>
    </div>
  )
}