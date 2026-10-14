const express = require('express');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', requireAuth, (req, res) => {
  const { _id, username, email, role, createdAt } = req.user;
  return res.status(200).json({
    data: { id: _id, username, email, role, createdAt },
  });
});

module.exports = router;
