const express = require('express');
const router = express.Router();
const db = require('../models/db');
const authenticateToken = require('../middleware/auth');

// Get all subscriptions for the current user
router.get('/', authenticateToken, (req, res) => {
  db.all(
    `SELECT s.*, u.username as creator_name
     FROM subscriptions s
     JOIN users u ON s.creator_id = u.id
     WHERE s.user_id = ?`,
    [req.user.id],
    (err, subscriptions) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error fetching subscriptions' });
      }
      res.json(subscriptions);
    }
  );
});

// Subscribe to a creator
router.post('/:creatorId', authenticateToken, (req, res) => {
  // Check if already subscribed
  db.get(
    'SELECT * FROM subscriptions WHERE user_id = ? AND creator_id = ?',
    [req.user.id, req.params.creatorId],
    (err, subscription) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error checking subscription' });
      }
      
      if (subscription) {
        return res.status(400).json({ error: 'Already subscribed to this creator' });
      }
      
      // Create new subscription
      db.run(
        'INSERT INTO subscriptions (user_id, creator_id) VALUES (?, ?)',
        [req.user.id, req.params.creatorId],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Error subscribing to creator' });
          }
          res.json({ 
            id: this.lastID,
            user_id: req.user.id,
            creator_id: parseInt(req.params.creatorId),
            created_at: new Date().toISOString()
          });
        }
      );
    }
  );
});

// Unsubscribe from a creator
router.delete('/:creatorId', authenticateToken, (req, res) => {
  db.run(
    'DELETE FROM subscriptions WHERE user_id = ? AND creator_id = ?',
    [req.user.id, req.params.creatorId],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error unsubscribing from creator' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Subscription not found' });
      }
      
      res.json({ message: 'Unsubscribed successfully' });
    }
  );
});

// Check subscription status for a creator
router.get('/:creatorId/status', authenticateToken, (req, res) => {
  db.get(
    'SELECT * FROM subscriptions WHERE user_id = ? AND creator_id = ?',
    [req.user.id, req.params.creatorId],
    (err, subscription) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error checking subscription status' });
      }
      
      res.json({ 
        isSubscribed: !!subscription,
        subscription: subscription || null
      });
    }
  );
});

module.exports = router; 