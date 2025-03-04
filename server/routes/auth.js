const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/db');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password, isCreator } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO users (username, password, is_creator) VALUES (?, ?, ?)',
      [username, hashedPassword, isCreator],
      function(err) {
        if (err) {
          return res.status(400).json({ error: 'Username already exists' });
        }
        res.json({ id: this.lastID, username });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, user) => {
      if (err || !user) {
        return res.status(400).json({ error: 'User not found' });
      }
      
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ error: 'Invalid password' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, isCreator: user.is_creator },
        process.env.JWT_SECRET || 'your_jwt_secret'
      );
      res.json({ token });
    }
  );
});

module.exports = router; 