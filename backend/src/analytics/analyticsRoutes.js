const express = require('express');
const router = express.Router();
const { getSummary, getTimeSeries, getTopOffenders } = require('./analyticsController');
const { authenticate } = require('../auth/middleware');

router.get('/summary',       authenticate, getSummary);
router.get('/timeseries',    authenticate, getTimeSeries);
router.get('/top-offenders', authenticate, getTopOffenders);

module.exports = router;
