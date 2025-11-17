// frontend/src/components/dashboard/ContactBook.jsx - FIXED VERSION
import { useState, useEffect } from 'react'
import './ContactBook.css'

function ContactBook({ userId }) {
  const [contacts, setContacts] = useState([])
  const [groups, setGroups] = useState(['General', 'Mens Group', 'Womens Group', 'Young Adults'])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState(null)
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    group: 'General'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGroup, setFilterGroup] = useState('All')

  useEffect(() => {
    fetchContacts()
  }, [userId])

  const fetchContacts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/users/contacts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      
      if (response.ok) {
        setContacts(data.contacts || [])
      } else {
        setError(data.error || 'Failed to fetch contacts')
      }
    } catch (err) {
      console.error('Error fetching contacts:', err)
      setError('Failed to fetch contacts')
    } finally {
      setLoading(false)
    }
  }

  const handleAddContact = async (e) => {
    e.preventDefault()
    setError(null)

    if (!newContact.name || !newContact.email) {
      setError('Name and email are required')
      return
    }

    try {
      const response = await fetch('/api/users/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newContact)
      })

      const data = await response.json()

      if (response.ok) {
        setContacts(prev => [...prev, data.contact])
        setNewContact({ name: '', email: '', phone: '', group: 'General' })
        setShowAddForm(false)
        setError(null)
        alert('Contact added successfully!')
      } else {
        setError(data.error || 'Failed to add contact')
      }
    } catch (err) {
      console.error('Error adding contact:', err)
      setError('Failed to add contact')
    }
  }

  const handleDeleteContact = async (contactId) => {
    if (!confirm('Delete this contact?')) return

    try {
      const response = await fetch(`/api/users/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        setContacts(prev => prev.filter(c => c._id !== contactId))
        alert('Contact deleted!')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete contact')
      }
    } catch (err) {
      console.error('Error deleting contact:', err)
      setError('Failed to delete contact')
    }
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGroup = filterGroup === 'All' || contact.group === filterGroup
    return matchesSearch && matchesGroup
  })

  return (
    <div className="contact-book">
      <div className="contact-book-header">
        <h2>👥 Contact Book</h2>
        <button
          className="add-contact-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add Contact'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Add Contact Form */}
      {showAddForm && (
        <form className="add-contact-form" onSubmit={handleAddContact}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                id="name"
                type="text"
                placeholder="John Smith"
                value={newContact.name}
                onChange={(e) => setNewContact(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={newContact.email}
                onChange={(e) => setNewContact(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone (Optional)</label>
              <input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={newContact.phone}
                onChange={(e) => setNewContact(prev => ({
                  ...prev,
                  phone: e.target.value
                }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="group">Group</label>
              <select
                id="group"
                value={newContact.group}
                onChange={(e) => setNewContact(prev => ({
                  ...prev,
                  group: e.target.value
                }))}
              >
                {groups.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="form-submit">Add</button>
          </div>
        </form>
      )}

      {/* Search & Filter */}
      <div className="contact-controls">
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          className="group-filter"
        >
          <option value="All">All Groups</option>
          {groups.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {/* Contacts List */}
      {loading ? (
        <p className="loading">Loading contacts...</p>
      ) : filteredContacts.length === 0 ? (
        <p className="no-contacts">No contacts found</p>
      ) : (
        <div className="contacts-list">
          {filteredContacts.map(contact => (
            <div key={contact._id} className="contact-item">
              <div className="contact-info">
                <h4>{contact.name}</h4>
                <p className="email">{contact.email}</p>
                {contact.phone && <p className="phone">{contact.phone}</p>}
                <span className="group-tag">{contact.group}</span>
              </div>
              <button
                className="delete-btn"
                onClick={() => handleDeleteContact(contact._id)}
                title="Delete contact"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ContactBook