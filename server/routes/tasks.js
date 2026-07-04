const express = require('express');
const db = require('../db');
const { auth } = require('../middleware');
const router = express.Router();

function uid() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}

router.get('/', auth, (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
  res.json(tasks.map(t => ({
    ...t,
    completed: !!t.completed,
    tags: JSON.parse(t.tags || '[]'),
    subtasks: JSON.parse(t.subtasks || '[]'),
  })));
});

router.post('/', auth, (req, res) => {
  const { title, description, tags, priority, energy, timeBlock, quadrant, recurring, subtasks } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });

  const id = uid();
  db.prepare(`INSERT INTO tasks (id, user_id, title, description, tags, priority, energy, time_block, quadrant, recurring, subtasks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    id, req.userId, title, description || '', JSON.stringify(tags || []),
    priority || 'medium', energy || 'low', timeBlock || null,
    quadrant || null, recurring || null, JSON.stringify(subtasks || [])
  );

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.json({ ...task, completed: false, tags: tags || [], subtasks: subtasks || [] });
});

router.put('/:id', auth, (req, res) => {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!existing) return res.status(404).json({ error: 'Task not found' });

  const { title, description, tags, priority, energy, completed, completedAt, timeBlock, quadrant, pomodoroSessions, subtasks, recurring } = req.body;

  db.prepare(`UPDATE tasks SET
    title = COALESCE(?, title), description = COALESCE(?, description),
    tags = COALESCE(?, tags), priority = COALESCE(?, priority),
    energy = COALESCE(?, energy), completed = COALESCE(?, completed),
    completed_at = COALESCE(?, completed_at), time_block = ?,
    quadrant = ?, pomodoro_sessions = COALESCE(?, pomodoro_sessions),
    subtasks = COALESCE(?, subtasks), recurring = ?
    WHERE id = ? AND user_id = ?`)
    .run(
      title || null, description !== undefined ? description : null,
      tags ? JSON.stringify(tags) : null, priority || null, energy || null,
      completed !== undefined ? (completed ? 1 : 0) : null, completedAt || null,
      timeBlock !== undefined ? timeBlock : null, quadrant !== undefined ? quadrant : null,
      pomodoroSessions !== undefined ? pomodoroSessions : null,
      subtasks ? JSON.stringify(subtasks) : null,
      recurring !== undefined ? recurring : null,
      req.params.id, req.userId
    );

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  res.json({ ...updated, completed: !!updated.completed, tags: JSON.parse(updated.tags || '[]'), subtasks: JSON.parse(updated.subtasks || '[]') });
});

router.delete('/:id', auth, (req, res) => {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!existing) return res.status(404).json({ error: 'Task not found' });
  db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ success: true });
});

module.exports = router;
