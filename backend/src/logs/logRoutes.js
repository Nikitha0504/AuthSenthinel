const express = require('express');
const router = express.Router();
const { ingest, getLogs, getLogById } = require('./logController');
const { authenticate } = require('../auth/middleware');

// POST /api/logs — public API key auth or bearer (use authenticate for dashboard)
router.post('/', authenticate, ingest);
router.get('/',   authenticate, getLogs);
router.get('/:id', authenticate, getLogById);

module.exports = router;
