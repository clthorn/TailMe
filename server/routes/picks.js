const express = require('express');
const db = require('../models/db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Create a pick
router.post('/', authenticateToken, (req, res) => {
  if (!req.user.isCreator) {
    return res.status(403).json({ error: 'Only creators can post picks' });
  }

  const { sport, pick, odds, result, game_time } = req.body;
  db.run(
    'INSERT INTO picks (creator_id, sport, pick, odds, result, game_time) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, sport, pick, odds, result, game_time],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error creating pick' });
      }
      res.json({ 
        id: this.lastID, 
        sport, 
        pick, 
        odds, 
        result, 
        created_at: new Date().toISOString(),
        game_time 
      });
    }
  );
});

// Get picks for a specific creator (only if subscribed or it's the creator themselves)
router.get('/creator/:id', authenticateToken, (req, res) => {
  const creatorId = req.params.id;
  
  // If the user is the creator, they can see their own picks
  if (req.user.id === parseInt(creatorId)) {
    db.all(
      'SELECT p.* FROM picks p WHERE p.creator_id = ?',
      [creatorId],
      (err, picks) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Error fetching picks' });
        }
        res.json(picks);
      }
    );
    return;
  }
  
  // Check if the user is subscribed to the creator
  db.get(
    'SELECT * FROM subscriptions WHERE user_id = ? AND creator_id = ?',
    [req.user.id, creatorId],
    (err, subscription) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error checking subscription' });
      }
      
      if (!subscription) {
        return res.status(403).json({ 
          error: 'You must be subscribed to this creator to view their picks',
          subscribed: false
        });
      }
      
      // User is subscribed, fetch the picks
      db.all(
        'SELECT p.* FROM picks p WHERE p.creator_id = ?',
        [creatorId],
        (err, picks) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Error fetching picks' });
          }
          res.json(picks);
        }
      );
    }
  );
});

// Get picks for subscribed creators
router.get('/subscribed', authenticateToken, (req, res) => {
  db.all(
    `SELECT p.*, u.username as creator_name 
     FROM picks p 
     JOIN users u ON p.creator_id = u.id 
     JOIN subscriptions s ON u.id = s.creator_id 
     WHERE s.user_id = ?
     ORDER BY p.created_at DESC`,
    [req.user.id],
    (err, picks) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error fetching picks' });
      }
      res.json(picks);
    }
  );
});

// Update a pick result (only the creator can update their own picks)
router.put('/:id', authenticateToken, (req, res) => {
  if (!req.user.isCreator) {
    return res.status(403).json({ error: 'Only creators can update picks' });
  }

  const { result } = req.body;
  
  // First check if the pick belongs to the creator
  db.get(
    'SELECT * FROM picks WHERE id = ? AND creator_id = ?',
    [req.params.id, req.user.id],
    (err, pick) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error fetching pick' });
      }
      
      if (!pick) {
        return res.status(404).json({ error: 'Pick not found or you are not authorized to update it' });
      }
      
      // Update the pick result
      db.run(
        'UPDATE picks SET result = ? WHERE id = ?',
        [result, req.params.id],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Error updating pick' });
          }
          
          res.json({ 
            ...pick,
            result 
          });
        }
      );
    }
  );
});

module.exports = router; 