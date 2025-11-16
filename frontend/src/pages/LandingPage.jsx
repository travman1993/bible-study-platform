import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './LandingPage.css'

function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="header-container">
          <h1 className="logo"><img src="/src/assets/winner.png" alt="Gathered" className="logo-img" /> Gathered</h1>
          <nav className="header-nav">
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-link primary">Sign Up</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h2>Lead Bible Studies Without the Chaos</h2>
          <p>Real-time Scripture display and highlighting for focused group study sessions</p>
          <div className="hero-cta">
            {!user && (
              <>
                <Link to="/register" className="cta-button primary">Get Started Free</Link>
                <Link to="/login" className="cta-button secondary">Already have an account?</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="problem">
        <h3>The Problem</h3>
        <div className="problem-grid">
          <div className="problem-card">
            <span className="icon">⏱️</span>
            <h4>Wasted Time Searching</h4>
            <p>"Turn to John 3:16" → 30 seconds of chaos while everyone searches</p>
          </div>
          <div className="problem-card">
            <span className="icon">📱</span>
            <h4>Different Bible Versions</h4>
            <p>Everyone on different apps and translations, nobody on the same page</p>
          </div>
          <div className="problem-card">
            <span className="icon">😴</span>
            <h4>Disengagement</h4>
            <p>People miss content while searching instead of listening</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <h3>Built for Bible Study Leaders</h3>
        <div className="benefits-grid">
          <div className="benefit-card">
            <h4>✅ Instant Passage Display</h4>
            <p>Teacher searches "John 3:16" → appears on everyone's screen instantly</p>
          </div>
          <div className="benefit-card">
            <h4>✅ Real-time Highlighting</h4>
            <p>Highlight key phrases in yellow, green, blue, or red. Everyone sees it live</p>
          </div>
          <div className="benefit-card">
            <h4>✅ Teacher-Controlled Experience</h4>
            <p>You're in control. Participants just watch, listen, and engage</p>
          </div>
          <div className="benefit-card">
            <h4>✅ Professional & Focused</h4>
            <p>No distractions. Everyone follows along at the same pace</p>
          </div>
          <div className="benefit-card">
            <h4>✅ Easy Contact Management</h4>
            <p>Store attendees, send invites via email or SMS, track who joined</p>
          </div>
          <div className="benefit-card">
            <h4>✅ Schedule Your Studies</h4>
            <p>Calendar to organize your studies by group and topic</p>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="comparison">
        <h3>Why Not Just Use Zoom or Discord?</h3>
        <div className="comparison-table">
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Bible Study Platform</th>
                <th>Zoom</th>
                <th>Discord</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Live Bible Display</td>
                <td>✅</td>
                <td>❌</td>
                <td>❌</td>
              </tr>
              <tr>
                <td>Real-time Highlighting</td>
                <td>✅</td>
                <td>❌</td>
                <td>❌</td>
              </tr>
              <tr>
                <td>Contact Management</td>
                <td>✅</td>
                <td>❌</td>
                <td>❌</td>
              </tr>
              <tr>
                <td>Study Calendar</td>
                <td>✅</td>
                <td>❌</td>
                <td>❌</td>
              </tr>
              <tr>
                <td>Built for Churches</td>
                <td>✅</td>
                <td>❌</td>
                <td>❌</td>
              </tr>
              <tr>
                <td>Affordable</td>
                <td>✅</td>
                <td>⚠️ Expensive</td>
                <td>✅</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing">
        <h3>Simple, Transparent Pricing</h3>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h4>Starter</h4>
            <p className="price">$19<span>/month</span></p>
            <ul>
              <li>✅ Up to 50 participants</li>
              <li>✅ Bible search & highlighting</li>
              <li>✅ Live video & audio</li>
              <li>✅ Contact management</li>
              <li>✅ Study calendar</li>
            </ul>
            <Link to="/register" className="pricing-btn">Get Started</Link>
          </div>

          <div className="pricing-card featured">
            <h4>Pro</h4>
            <p className="price">$49<span>/month</span></p>
            <ul>
              <li>✅ Up to 500 participants</li>
              <li>✅ Everything in Starter</li>
              <li>✅ 5 Bible versions</li>
              <li>✅ Session recordings</li>
              <li>✅ Usage analytics</li>
            </ul>
            <Link to="/register" className="pricing-btn featured">Get Started</Link>
          </div>

          <div className="pricing-card">
            <h4>Ministry</h4>
            <p className="price">$149<span>/month</span></p>
            <ul>
              <li>✅ Up to 5,000 participants</li>
              <li>✅ Everything in Pro</li>
              <li>✅ Unlimited Bible versions</li>
              <li>✅ API access</li>
              <li>✅ Priority support</li>
            </ul>
            <Link to="/register" className="pricing-btn">Get Started</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>Built for churches and faith-based leaders who want to focus on content, not tech</p>
        <p className="footer-secondary">© 2025 Bible Study Platform. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default LandingPage