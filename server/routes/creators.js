const express = require('express');
const db = require('../models/db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Get all creators
router.get('/', authenticateToken, (req, res) => {
  db.all(
    `SELECT u.id, u.username,
     (SELECT COUNT(*) FROM picks WHERE creator_id = u.id) as totalPicks,
     (SELECT COUNT(*) FROM picks WHERE creator_id = u.id AND result = 'Win') as wins,
     EXISTS(SELECT 1 FROM subscriptions WHERE user_id = ? AND creator_id = u.id) as isSubscribed
     FROM users u
     WHERE u.is_creator = 1 AND u.id != ?`,
    [req.user.id, req.user.id],
    (err, creators) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error fetching creators' });
      }

      const creatorsWithStats = creators.map(creator => ({
        ...creator,
        winRate: creator.totalPicks > 0 ? creator.wins / creator.totalPicks : 0,
        isSubscribed: Boolean(creator.isSubscribed)
      }));

      res.json(creatorsWithStats);
    }
  );
});

// Get specific creator
router.get('/:id', authenticateToken, (req, res) => {
  console.log('Fetching creator:', req.params.id);
  
  db.get(
    `SELECT u.id, u.username,
     (SELECT COUNT(*) FROM picks WHERE creator_id = u.id) as totalPicks,
     (SELECT COUNT(*) FROM picks WHERE creator_id = u.id AND result = 'Win') as wins,
     EXISTS(SELECT 1 FROM subscriptions WHERE user_id = ? AND creator_id = u.id) as isSubscribed
     FROM users u
     WHERE u.id = ? AND u.is_creator = 1`,
    [req.user.id, req.params.id],
    (err, creator) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error fetching creator' });
      }
      
      if (!creator) {
        return res.status(404).json({ error: 'Creator not found' });
      }

      const creatorWithStats = {
        ...creator,
        winRate: creator.totalPicks > 0 ? creator.wins / creator.totalPicks : 0,
        isSubscribed: Boolean(creator.isSubscribed)
      };
      
      res.json(creatorWithStats);
    }
  );
});

// Subscribe to a creator (for backward compatibility)
router.post('/subscribe/:creatorId', authenticateToken, (req, res) => {
  // Forward to the new subscription route
  db.run(
    'INSERT INTO subscriptions (user_id, creator_id) VALUES (?, ?)',
    [req.user.id, req.params.creatorId],
    (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error subscribing to creator' });
      }
      res.json({ message: 'Subscribed successfully' });
    }
  );
});

// Unsubscribe from a creator (for backward compatibility)
router.delete('/subscribe/:creatorId', authenticateToken, (req, res) => {
  db.run(
    'DELETE FROM subscriptions WHERE user_id = ? AND creator_id = ?',
    [req.user.id, req.params.creatorId],
    (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error unsubscribing from creator' });
      }
      res.json({ message: 'Unsubscribed successfully' });
    }
  );
});

module.exports = router; 