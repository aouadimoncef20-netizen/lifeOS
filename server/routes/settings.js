const express = require('express');
const db = require('../db');
const { auth } = require('../middleware');
const router = express.Router();

router.get('/', auth, (req, res) => {
  let settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(req.userId);
  if (!settings) {
    db.prepare('INSERT INTO user_settings (user_id) VALUES (?)').run(req.userId);
    settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(req.userId);
  }
  res.json({
    mode: settings.theme_mode,
    accent: settings.accent_color,
    fontSize: settings.font_size,
    focusMinutes: settings.minutes_focus,
    breakMinutes: settings.minutes_break,
  });
});

router.put('/', auth, (req, res) => {
  const { mode, accent, fontSize, focusMinutes, breakMinutes } = req.body;
  db.prepare(`UPDATE user_settings SET
    theme_mode = COALESCE(?, theme_mode), accent_color = COALESCE(?, accent_color),
    font_size = COALESCE(?, font_size), minutes_focus = COALESCE(?, minutes_focus),
    minutes_break = COALESCE(?, minutes_break)
    WHERE user_id = ?`)
    .run(mode || null, accent || null, fontSize || null, focusMinutes || null, breakMinutes || null, req.userId);
  const s = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(req.userId);
  res.json({
    mode: s.theme_mode, accent: s.accent_color, fontSize: s.font_size,
    focusMinutes: s.minutes_focus, breakMinutes: s.minutes_break,
  });
});

module.exports = router;
