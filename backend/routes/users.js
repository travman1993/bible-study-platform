// backend/routes/users.js
const express = require('express');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// GET CURRENT USER PROFILE
router.get('/profile/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile', details: err.message });
  }
});

// UPDATE USER PROFILE
router.put('/profile/me', verifyToken, async (req, res) => {
  try {
    const { name, role } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (role && ['teacher', 'participant'].includes(role)) {
      user.role = role;
    }

    await user.save();

    console.log('Profile updated:', user._id);

    res.json({
      success: true,
      user: {
        _id: user._id,
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile', details: err.message });
  }
});

// GET CONTACTS
router.get('/contacts', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Placeholder - store contacts in user document
    const contacts = user.contacts || [];

    res.json({
      success: true,
      contacts: contacts
    });
  } catch (err) {
    console.error('Get contacts error:', err);
    res.status(500).json({ error: 'Failed to fetch contacts', details: err.message });
  }
});

// ADD CONTACT
router.post('/contacts', verifyToken, async (req, res) => {
  try {
    const { name, email, phone, group } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.contacts) {
      user.contacts = [];
    }

    const contact = {
      _id: require('mongoose').Types.ObjectId(),
      name,
      email,
      phone: phone || '',
      group: group || 'General',
      createdAt: new Date()
    };

    user.contacts.push(contact);
    await user.save();

    console.log('Contact added:', contact._id);

    res.status(201).json({
      success: true,
      contact: contact
    });
  } catch (err) {
    console.error('Add contact error:', err);
    res.status(500).json({ error: 'Failed to add contact', details: err.message });
  }
});

// UPDATE CONTACT
router.put('/contacts/:contactId', verifyToken, async (req, res) => {
  try {
    const { contactId } = req.params;
    const { name, email, phone, group } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const contact = user.contacts?.find(c => c._id.toString() === contactId);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    if (name) contact.name = name;
    if (email) contact.email = email;
    if (phone) contact.phone = phone;
    if (group) contact.group = group;

    await user.save();

    res.json({
      success: true,
      contact: contact
    });
  } catch (err) {
    console.error('Update contact error:', err);
    res.status(500).json({ error: 'Failed to update contact', details: err.message });
  }
});

// DELETE CONTACT
router.delete('/contacts/:contactId', verifyToken, async (req, res) => {
  try {
    const { contactId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.contacts = user.contacts?.filter(c => c._id.toString() !== contactId) || [];
    await user.save();

    res.json({
      success: true,
      message: 'Contact deleted'
    });
  } catch (err) {
    console.error('Delete contact error:', err);
    res.status(500).json({ error: 'Failed to delete contact', details: err.message });
  }
});

module.exports = router;