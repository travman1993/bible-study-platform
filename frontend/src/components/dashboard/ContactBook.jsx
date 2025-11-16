import { useState, useEffect } from 'react'
import './ContactBook.css'

function ContactBook({ userId }) {
  const [contacts, setContacts] = useState([])
  const [groups, setGroups] = useState(['General', 'Mens Group', 'Womens Group', 'Young Adults'])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
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
    try {
      const response = await fetch('/api/contacts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
      }
    } catch (err) {
      console.error('Error fetching contacts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddContact = async (e) => {
    e.preventDefault()

    if (!newContact.name || !newContact.email) {
      alert('Name and email are required')
      return
    }

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newContact)
      })

      if (response.ok) {
        const createdContact = await response.json()
        setContacts(prev => [...prev, createdContact])
        setNewContact({ name: '', email: '', phone: '', group: 'General' })
        setShowAddForm(false)
      }
    } catch (err) {
      console.error('Error adding contact:', err)
    }
  }

  const handleDeleteContact = async (contactId) => {
    if (!confirm('Delete this contact?')) return

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        setContacts(prev => prev.filter(c => c._id !== contactId))
      }
    } catch (err) {
      console.error('Error deleting contact:', err)
    }
  }

  const handleSendInvites = async (groupName) => {
    const groupContacts = filterGroup === 'All'
      ? contacts
      : contacts.filter(c => c.group === groupName)

    if (groupContacts.length === 0) {
      alert('No contacts to invite')
      return
    }

    try {
      const response = await fetch('/api/studies/send-invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          contactIds: groupContacts.map(c => c._id),
          group: groupName
        })
      })

      if (response.ok) {
        alert(`Invites sent to ${groupContacts.length} people`)
      }
    } catch (err) {
      console.error('Error sending invites:', err)
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

      {/* Add Contact Form */}
      {showAddForm && (
        <form className="add-contact-form" onSubmit={handleAddContact}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Name</label>
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
              <label htmlFor="email">Email</label>
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
        <p>Loading contacts...</p>
      ) : filteredContacts.length === 0 ? (
        <p className="no-contacts">No contacts found</p>
      ) : (
        <div className="contacts-list">
          <div className="contacts-header">
            <div className="col-name">Name</div>
            <div className="col-email">Email</div>
            <div className="col-group">Group</div>
            <div className="col-actions">Actions</div>
          </div>
          {filteredContacts.map(contact => (
            <div key={contact._id} className="contact-row">
              <div className="col-name">{contact.name}</div>
              <div className="col-email">{contact.email}</div>
              <div className="col-group">
                <span className="group-badge">{contact.group}</span>
              </div>
              <div className="col-actions">
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteContact(contact._id)}
                  title="Delete contact"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Send Invites Section */}
      {filteredContacts.length > 0 && (
        <div className="send-invites-section">
          <h3>📧 Send Invites</h3>
          <p>Invite selected contacts to join your next study</p>
          <button
            className="send-invites-btn"
            onClick={() => handleSendInvites(filterGroup)}
          >
            Send Invites to {filterGroup} ({filteredContacts.length})
          </button>
        </div>
      )}
    </div>
  )
}

export default ContactBook