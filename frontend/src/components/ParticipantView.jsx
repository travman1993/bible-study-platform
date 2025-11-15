import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff } from 'lucide-react'

export function ParticipantView({ socket, teacherCamera }) {
  const [isMicOn, setIsMicOn] = useState(false)

  return (
    <div className="participant-container">
      {/* TOP AD SPOT - Non-intrusive */}
      <div className="ad-spot top-ad">
        <small>Advertisement</small>
      </div>

      {/* Teacher Camera - Big and centered */}
      <div className="participant-camera">
        <div className="camera-header">
          <h2>👨‍🏫 Live Teaching</h2>
          <span className="live-badge">LIVE 🔴</span>
        </div>
        <video
          className="teacher-video"
          autoPlay
          playsInline
          muted
          srcObject={teacherCamera}
        />
        
        {/* Just Mic Toggle - CENTERED */}
        <div className="mic-control">
          <button
            className={`mic-btn ${isMicOn ? 'on' : 'off'}`}
            onClick={() => setIsMicOn(!isMicOn)}
          >
            {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
            {isMicOn ? 'Mic On' : 'Mic Off'}
          </button>
        </div>
      </div>

      {/* Bible Display - Scrollable */}
      <div className="participant-bible">
        <h3>John 3:16</h3>
        <p>
          For God so <span className="highlight-yellow">loved</span> the world that he gave his one and only{' '}
          <span className="highlight-green">Son</span>, that whoever{' '}
          <span className="highlight-blue">believes</span> in him shall not perish but have eternal{' '}
          <span className="highlight-red">life</span>.
        </p>
      </div>

      {/* SIDE AD SPOT - Non-intrusive */}
      <div className="ad-spot side-ad">
        <small>Ad</small>
      </div>

      <style jsx>{`
        .participant-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #f8fafb;
          gap: 12px;
          padding: 12px;
        }

        .ad-spot {
          background: #e5e7eb;
          padding: 8px;
          border-radius: 6px;
          font-size: 11px;
          color: #6b7280;
          text-align: center;
          flex-shrink: 0;
        }

        .top-ad {
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .participant-camera {
          flex: 2;
          min-height: 350px;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
        }

        .camera-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .camera-header h2 {
          margin: 0;
          font-size: 16px;
        }

        .live-badge {
          background: #ef4444;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .teacher-video {
          flex: 1;
          width: 100%;
          object-fit: cover;
        }

        .mic-control {
          padding: 12px;
          background: #f8fafb;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: center;
        }

        .mic-btn {
          width: 100%;
          max-width: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          color: #6b7280;
          transition: all 0.2s;
          font-size: 14px;
        }

        .mic-btn:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .mic-btn.on {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .participant-bible {
          flex: 0.8;
          background: white;
          padding: 16px;
          border-radius: 12px;
          overflow-y: auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          min-height: 150px;
        }

        .participant-bible h3 {
          margin: 0 0 12px 0;
          font-size: 18px;
          color: #1f2937;
          border-bottom: 3px solid #667eea;
          padding-bottom: 8px;
        }

        .participant-bible p {
          margin: 0;
          line-height: 1.8;
          color: #374151;
          font-size: 15px;
        }

        .highlight-yellow {
          background: #FFEB3B;
          padding: 2px 4px;
          border-radius: 3px;
        }

        .highlight-green {
          background: #4CAF50;
          color: white;
          padding: 2px 4px;
          border-radius: 3px;
        }

        .highlight-blue {
          background: #2196F3;
          color: white;
          padding: 2px 4px;
          border-radius: 3px;
        }

        .highlight-red {
          background: #F44336;
          color: white;
          padding: 2px 4px;
          border-radius: 3px;
        }

        .side-ad {
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* TABLET */
        @media (max-width: 768px) {
          .participant-container {
            gap: 8px;
            padding: 8px;
            align-items: center;
          }

          .participant-camera {
            flex: 1.8;
            min-height: 300px;
            max-width: 300px;
          }

          .participant-bible {
            flex: 1;
            min-height: 150px;
            padding: 12px;
          }

          .participant-bible h3 {
            font-size: 16px;
            margin-bottom: 8px;
          }

          .participant-bible p {
            font-size: 13px;
            line-height: 1.6;
          }

          .mic-btn {
            padding: 10px 12px;
            font-size: 13px;
          }

          .top-ad {
            height: 40px;
            font-size: 10px;
            min-width: 100%;
          }

          .side-ad {
            height: 60px;
            font-size: 10px;
            min-width: 100%;
          }

          .camera-header h2 {
            font-size: 14px;
          }

          .live-badge {
            font-size: 10px;
            padding: 3px 8px;
          }
        }

        /* MOBILE */
        @media (max-width: 430px) {
          .participant-container {
            gap: 6px;
            padding: 6px;
          }

          .participant-camera {
            flex: 1.5;
            min-height: 260px;
          }

          .participant-bible {
            flex: 1;
            min-height: 140px;
            padding: 10px;
          }

          .participant-bible h3 {
            font-size: 14px;
            margin-bottom: 6px;
          }

          .participant-bible p {
            font-size: 12px;
            line-height: 1.5;
          }

          .mic-btn {
            padding: 8px 12px;
            font-size: 12px;
          }

          .top-ad {
            height: 35px;
            font-size: 9px;
          }

          .side-ad {
            height: 50px;
            font-size: 9px;
          }

          .camera-header {
            padding: 10px 12px;
          }

          .camera-header h2 {
            font-size: 12px;
          }

          .live-badge {
            font-size: 9px;
            padding: 2px 6px;
          }

          .mic-btn svg {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
    </div>
  )
}