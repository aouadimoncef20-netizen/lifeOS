const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { auth } = require('../middleware');
const router = express.Router();

function uid() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}

router.post('/signup', (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Email, name, and password required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const id = uid();
    const hashed = bcrypt.hashSync(password, 10);

    db.prepare('INSERT INTO users (id, email, name, password) VALUES (?, ?, ?, ?)').run(id, email, name, hashed);

    // Default habits
    const defaultHabits = [
      { name: 'Drink Water', icon: '💧', target: 8, color: '#38bdf8' },
      { name: 'Deep Work', icon: '🧠', target: 1, color: '#a78bfa' },
      { name: 'Exercise', icon: '🏃', target: 1, color: '#f472b6' },
      { name: 'Read 30 min', icon: '📖', target: 1, color: '#34d399' },
      { name: 'Meditate', icon: '🧘', target: 1, color: '#fbbf24' },
    ];
    const insertHabit = db.prepare('INSERT INTO habits (id, user_id, name, icon, target, color) VALUES (?, ?, ?, ?, ?, ?)');
    for (const h of defaultHabits) {
      insertHabit.run(uid(), id, h.name, h.icon, h.target, h.color);
    }

    // Default settings
    db.prepare('INSERT INTO user_settings (user_id) VALUES (?)').run(id);

    // Sample tasks
    const sampleTasks = [
      { title: 'Welcome to Life OS!', description: 'Check this off to see the particle effect!', priority: 'low', energy: 'low' },
      { title: 'Customize your theme', description: 'Open the sidebar and pick an accent color.', priority: 'medium', energy: 'low' },
      { title: 'Start a Pomodoro', description: 'Click Start in the bar above to begin focusing.', priority: 'high', energy: 'high' },
    ];
    const insertTask = db.prepare('INSERT INTO tasks (id, user_id, title, description, priority, energy) VALUES (?, ?, ?, ?, ?, ?)');
    for (const t of sampleTasks) {
      insertTask.run(uid(), id, t.title, t.description, t.priority, t.energy);
    }

    const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id, email, name } });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

module.exports = router;
