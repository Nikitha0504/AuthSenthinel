const express = require('express');
const router = express.Router();
const { inspectJWT } = require('./jwtController');
const { authenticate } = require('../auth/middleware');

router.post('/jwt/inspect', authenticate, inspectJWT);

module.exports = router;
