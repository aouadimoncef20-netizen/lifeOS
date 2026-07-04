const express = require('express');
const db = require('../db');
const { auth } = require('../middleware');
const router = express.Router();

function uid() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}

router.get('/', auth, (req, res) => {
  const habits = db.prepare('SELECT * FROM habits WHERE user_id = ?').all(req.userId);
  res.json(habits.map(h => ({ ...h, streak: JSON.parse(h.streak || '[0,0,0,0,0,0,0]') })));
});

router.post('/', auth, (req, res) => {
  const { name, icon, target, color } = req.body;
  const id = uid();
  db.prepare('INSERT INTO habits (id, user_id, name, icon, target, color) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, req.userId, name || 'New Habit', icon || '💧', target || 1, color || '#38bdf8');
  const h = db.prepare('SELECT * FROM habits WHERE id = ?').get(id);
  res.json({ ...h, streak: JSON.parse(h.streak) });
});

router.put('/:id', auth, (req, res) => {
  const existing = db.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!existing) return res.status(404).json({ error: 'Habit not found' });
  const { streak, name, icon, target, color } = req.body;
  db.prepare('UPDATE habits SET streak = ?, name = COALESCE(?, name), icon = COALESCE(?, icon), target = COALESCE(?, target), color = COALESCE(?, color) WHERE id = ?')
    .run(JSON.stringify(streak || JSON.parse(existing.streak)), name || null, icon || null, target || null, color || null, req.params.id);
  const h = db.prepare('SELECT * FROM habits WHERE id = ?').get(req.params.id);
  res.json({ ...h, streak: JSON.parse(h.streak) });
});

router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM habits WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ success: true });
});

module.exports = router;
