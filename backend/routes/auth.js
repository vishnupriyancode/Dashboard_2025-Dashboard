const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Get user from database
    const users = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    
    // Compare password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (isValidPassword) {
      res.json({ 
        success: true, 
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if user already exists
    const existingUsers = await db.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash the password and insert new user
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (username, password, email) VALUES ($1, $2, $3)', [username, hashedPassword, email]);
    
    res.json({ 
      success: true, 
      message: 'User registered successfully' 
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password endpoint
router.post('/change-password', async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;
    
    if (!username || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Username, current password, and new password are required' });
    }

    // Get user from database
    const users = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = users[0];
    
    // Verify current password using bcrypt
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash the new password and update
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hashedNewPassword, user.id]);
    
    res.json({ 
      success: true, 
      message: 'Password changed successfully' 
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const users = await db.query('SELECT id, username, email, created_at FROM users WHERE username = $1', [username]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update existing users endpoint (for migration)
router.post('/update-users', async (req, res) => {
  try {
    // Find users where username contains @ (email format)
    const users = await db.query('SELECT * FROM users WHERE username LIKE \'%@%\'');
    
    for (const user of users) {
      // Extract username from email (everything before @)
      const newUsername = user.username.split('@')[0];
      
      // Check if the new username already exists
      const existingUser = await db.query('SELECT * FROM users WHERE username = $1', [newUsername]);
      
      if (existingUser.length === 0) {
        // Update the username
        await db.query('UPDATE users SET username = $1 WHERE id = $2', [newUsername, user.id]);
        console.log(`Updated user ${user.username} to ${newUsername}`);
      } else {
        console.log(`Username ${newUsername} already exists, skipping ${user.username}`);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Users updated successfully' 
    });
  } catch (error) {
    console.error('Update users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 