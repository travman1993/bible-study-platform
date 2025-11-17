// frontend/src/pages/LandingPage.jsx - FIXED VERSION
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Users, Zap, BarChart3 } from 'lucide-react'
import './LandingPage.css'

function LandingPage() {
  const navigate = useNavigate()
  const [billingCycle, setBillingCycle] = useState('monthly')

  // Button handlers
  const handleLogin = () => navigate('/login')
  const handleSignUp = () => navigate('/register')
  const handleGetStarted = () => navigate('/register')

  const pricingTiers = [
    {
      name: 'Free',
      price: 'Free',
      description: 'Perfect for getting started',
      features: [
        '✅ Up to 10 participants',
        '✅ Calendar & study scheduling',
        '✅ Manage contacts',
        '❌ Live classroom',
        '❌ Real-time highlighting',
        '❌ Limited to 2 studies/month'
      ],
      cta: 'Get Started',
      ctaStyle: 'secondary'
    },
    {
      name: 'Starter',
      price: billingCycle === 'monthly' ? '$19.99' : '$199.99',
      pricePeriod: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'Best for small to medium groups',
      features: [
        '✅ Up to 50 participants',
        '✅ Everything in Free, plus:',
        '✅ Live classroom with video/audio',
        '✅ Real-time highlighting (1 color)',
        '✅ Bible chat & notes',
        '✅ Recording & replay',
        '✅ Email follow-ups'
      ],
      cta: 'Start Free Trial',
      ctaStyle: 'primary',
      popular: true
    },
    {
      name: 'Pro',
      price: billingCycle === 'monthly' ? '$49.99' : '$499.99',
      pricePeriod: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'For growing ministries',
      features: [
        '✅ Up to 500 participants',
        '✅ Everything in Starter, plus:',
        '✅ Multi-color highlighting',
        '✅ 5 Bible versions',
        '✅ Custom branding',
        '✅ Usage analytics',
        '✅ Priority support'
      ],
      cta: 'Start Free Trial',
      ctaStyle: 'primary'
    }
  ]

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <span class="logo-image"><img src="./src/assets/winner.png" /> Gathered</span>
          </div>
          <div className="nav-buttons">
            <button 
              className="nav-link"
              onClick={handleLogin}
            >
              Login
            </button>
            <button 
              className="nav-button primary"
              onClick={handleSignUp}
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1>Live Bible Study Made Simple</h1>
            <p className="hero-subtitle">
              Stop wasting time searching for passages. Start engaging with Scripture.
            </p>
            <div className="hero-problem">
              <p>
                <span className="problem-icon">❌</span>
                Your Zoom Bible study: 30 seconds of chaos searching for John 3:16
              </p>
              <p>
                <span className="solution-icon">✅</span>
                With Gathered: Teacher clicks → Everyone sees the same passage instantly
              </p>
            </div>
            <button 
              className="cta-button"
              onClick={handleGetStarted}
            >
              Start Your Free Trial
            </button>
          </div>
          
          <div className="hero-image">
            <div className="hero-image-placeholder">
              <img src="./src/assets/hero.png" alt="Live Bible Study Interface" />
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="features">
        <div className="features-container">
          <h2>Everything You Need</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <Zap className="feature-icon" />
              <h3>Instant Bible Display</h3>
              <p>Search any passage and it appears on everyone's screen in real-time. No more chaos.</p>
            </div>
            
            <div className="feature-card">
              <CheckCircle className="feature-icon" />
              <h3>Real-Time Highlighting</h3>
              <p>Highlight key phrases in multiple colors. Everyone sees your highlights instantly.</p>
            </div>
            
            <div className="feature-card">
              <Users className="feature-icon" />
              <h3>Teacher Camera + Participant Audio</h3>
              <p>You present, they listen and participate. Professional, distraction-free.</p>
            </div>
            
            <div className="feature-card">
              <BarChart3 className="feature-icon" />
              <h3>Built for Bible Study</h3>
              <p>200+ Bible versions, discussion guides, notes, prayer requests. Everything in one place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing">
        <div className="pricing-container">
          <h2>Simple, Transparent Pricing</h2>
          
          <div className="billing-toggle">
            <button 
              className={billingCycle === 'monthly' ? 'active' : ''}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button 
              className={billingCycle === 'yearly' ? 'active' : ''}
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly (Save 17%)
            </button>
          </div>

          <div className="pricing-grid">
            {pricingTiers.map((tier, index) => (
              <div key={index} className={`pricing-card ${tier.popular ? 'popular' : ''}`}>
                {tier.popular && <div className="popular-badge">Most Popular</div>}
                
                <h3>{tier.name}</h3>
                <p className="tier-description">{tier.description}</p>
                
                <div className="price">
                  <span className="amount">{tier.price}</span>
                  {tier.pricePeriod && <span className="period">{tier.pricePeriod}</span>}
                </div>

                <button 
                  className={`tier-cta ${tier.ctaStyle}`}
                  onClick={handleGetStarted}
                >
                  {tier.cta}
                </button>

                <div className="features-list">
                  {tier.features.map((feature, idx) => (
                    <p key={idx} className="feature">{feature}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="pricing-note">
            ✅ Free trial: 14 days full access. No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="social-proof">
        <div className="proof-container">
          <h2>Loved by Bible Study Leaders</h2>
          
          <div className="testimonials">
            <div className="testimonial">
              <p className="quote">"Game changer for our online ministry. No more Zoom chaos."</p>
              <p className="author">- Sarah M., Church Pastor</p>
            </div>
            
            <div className="testimonial">
              <p className="quote">"Students are actually engaged now instead of searching their Bibles."</p>
              <p className="author">- Dr. James L., Seminary Professor</p>
            </div>
            
            <div className="testimonial">
              <p className="quote">"We switched from Zoom. Our engagement went up 60%."</p>
              <p className="author">- David K., Prayer Group Leader</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta">
        <div className="cta-container">
          <h2>Ready to Transform Your Bible Study?</h2>
          <p>Start your free 14-day trial today. No credit card required.</p>
          <button 
            className="cta-button large"
            onClick={handleGetStarted}
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-section">
            <h4>Gathered</h4>
            <p>Live Bible study for the modern church.</p>
          </div>
          
          <div className="footer-section">
            <h4>Links</h4>
            <ul>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#privacy">Privacy</a></li>
              <li><a href="#terms">Terms</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Follow</h4>
            <ul>
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a></li>
              <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 Gathered. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage