const express = require('express');
const router = express.Router();
const { getAlerts, resolveAlert, alertCount } = require('./alertController');
const { authenticate } = require('../auth/middleware');

router.get('/',            authenticate, getAlerts);
router.get('/count',       authenticate, alertCount);
router.patch('/:id/resolve', authenticate, resolveAlert);

module.exports = router;
