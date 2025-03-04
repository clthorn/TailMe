const express = require('express');
const router = express.Router();
const db = require('../models/db');
const authenticateToken = require('../middleware/auth');
const bcrypt = require('bcrypt');

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
  db.get(
    `SELECT id, username, is_creator, created_at FROM users WHERE id = ?`,
    [req.user.id],
    (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error fetching user profile' });
      }
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    }
  );
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Check if username is already taken by another user
    if (username) {
      db.get(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, req.user.id],
        async (err, existingUser) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Error checking username' });
          }
          
          if (existingUser) {
            return res.status(400).json({ error: 'Username already taken' });
          }
          
          // Update user profile
          let query = 'UPDATE users SET ';
          const params = [];
          
          if (username) {
            query += 'username = ?';
            params.push(username);
          }
          
          if (password) {
            if (params.length > 0) {
              query += ', ';
            }
            query += 'password = ?';
            const hashedPassword = await bcrypt.hash(password, 10);
            params.push(hashedPassword);
          }
          
          if (params.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
          }
          
          query += ' WHERE id = ?';
          params.push(req.user.id);
          
          db.run(query, params, function(err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Error updating user profile' });
            }
            
            res.json({ 
              message: 'Profile updated successfully',
              username: username || req.user.username
            });
          });
        }
      );
    } else if (password) {
      // Only updating password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      db.run(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, req.user.id],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Error updating password' });
          }
          
          res.json({ message: 'Password updated successfully' });
        }
      );
    } else {
      res.status(400).json({ error: 'No fields to update' });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all creators a user is subscribed to
router.get('/:userId/subscriptions', authenticateToken, (req, res) => {
  console.log("Fetching subscribed creators for user:", req.params.userId);
  
  // Only allow users to view their own subscriptions
  if (req.user.id !== parseInt(req.params.userId)) {
    return res.status(403).json({ error: 'Unauthorized to view other users\' subscriptions' });
  }
  
  db.all(
    `SELECT u.id, u.username,
     (SELECT COUNT(*) FROM picks WHERE creator_id = u.id) as totalPicks,
     (SELECT COUNT(*) FROM picks WHERE creator_id = u.id AND result = 'Win') as wins
     FROM users u 
     JOIN subscriptions s ON u.id = s.creator_id 
     WHERE s.user_id = ?`,
    [req.params.userId],
    (err, creators) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error fetching subscribed creators' });
      }
      
      const creatorsWithStats = creators.map(creator => ({
        ...creator,
        winRate: creator.totalPicks > 0 ? creator.wins / creator.totalPicks : 0
      }));
      
      res.json(creatorsWithStats);
    }
  );
});

// Get user stats (for creators)
router.get('/stats', authenticateToken, (req, res) => {
  if (!req.user.isCreator) {
    return res.status(403).json({ error: 'Only creators can view their stats' });
  }
  
  db.get(
    `SELECT 
      (SELECT COUNT(*) FROM picks WHERE creator_id = ?) as totalPicks,
      (SELECT COUNT(*) FROM picks WHERE creator_id = ? AND result = 'Win') as wins,
      (SELECT COUNT(*) FROM picks WHERE creator_id = ? AND result = 'Loss') as losses,
      (SELECT COUNT(*) FROM subscriptions WHERE creator_id = ?) as subscribers
    `,
    [req.user.id, req.user.id, req.user.id, req.user.id],
    (err, stats) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error fetching user stats' });
      }
      
      const winRate = stats.totalPicks > 0 ? stats.wins / stats.totalPicks : 0;
      
      res.json({
        ...stats,
        winRate
      });
    }
  );
});

module.exports = router;