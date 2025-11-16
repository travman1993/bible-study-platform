import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import './ProfileSection.css'

function ProfileSection({ user, onProfileUpdate }) {
  const { user: currentUser } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    phoneNumber: user?.phoneNumber || '',
    profileImage: user?.profileImage || ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [previewImage, setPreviewImage] = useState(user?.profileImage || null)

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
        setFormData(prev => ({
          ...prev,
          profileImage: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSuccess(true)
        onProfileUpdate?.()
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update profile')
      }
    } catch (err) {
      setError('Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-section">
      <h2>Your Profile</h2>

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Profile Image */}
        <div className="profile-image-group">
          <label>Profile Picture</label>
          <div className="image-upload">
            {previewImage && (
              <img src={previewImage} alt="Profile preview" className="preview-image" />
            )}
            <label className="upload-label">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
              />
              <span>{previewImage ? 'Change Photo' : 'Upload Photo'}</span>
            </label>
          </div>
        </div>

        {/* Name */}
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* Email (read-only) */}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            disabled
          />
          <small>Email cannot be changed</small>
        </div>

        {/* Phone */}
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number (Optional)</label>
          <input
            id="phoneNumber"
            type="tel"
            name="phoneNumber"
            placeholder="+1 (555) 123-4567"
            value={formData.phoneNumber}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* Bio */}
        <div className="form-group">
          <label htmlFor="bio">Bio/About (Optional)</label>
          <textarea
            id="bio"
            name="bio"
            placeholder="Tell people a bit about yourself and what you teach"
            value={formData.bio}
            onChange={handleChange}
            disabled={loading}
            rows={4}
          />
        </div>

        {/* Messages */}
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">Profile updated successfully!</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="submit-btn"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}

export default ProfileSection