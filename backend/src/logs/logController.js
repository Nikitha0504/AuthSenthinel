const AuthLog = require('./Log');
const { analyze } = require('../analyzer/analyzer');
const { runAlertEngine } = require('../alerts/alertEngine');

const VALID_EVENTS = [
  'LOGIN_SUCCESS','LOGIN_FAILED','TOKEN_EXPIRED','TOKEN_INVALID',
  'TOKEN_REVOKED','PASSWORD_RESET_INITIATED','ACCOUNT_LOCKED','MFA_FAILED'
];

// POST /api/logs  ── ingest single event
exports.ingest = async (req, res) => {
  try {
    const { user, event, reason, ip, appId, userAgent, timestamp } = req.body;
    if (!user || !event) return res.status(400).json({ error: 'user and event are required' });
    if (!VALID_EVENTS.includes(event)) {
      return res.status(400).json({ error: `Unknown event type: ${event}`, valid: VALID_EVENTS });
    }

    const analyzed = analyze({ event, reason });
    const log = await AuthLog.create({
      user, event, reason: reason || '', ip: ip || '',
      appId: appId || 'unknown', userAgent: userAgent || '',
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      analyzed
    });

    // Broadcast to live feed via Socket.io
    const io = req.app.get('io');
    if (io) io.emit('new_log', log);

    // Run alert engine asynchronously (don't block response)
    runAlertEngine(log).catch(console.error);

    res.status(201).json({ id: log._id, analyzed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/logs  ── query with filters
exports.getLogs = async (req, res) => {
  try {
    const { user, event, reason, appId, ip, from, to, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (user)   filter.user   = { $regex: user, $options: 'i' };
    if (event)  filter.event  = { $in: event.split(',') };
    if (reason) filter.reason = { $in: reason.split(',') };
    if (appId)  filter.appId  = appId;
    if (ip)     filter.ip     = { $regex: ip, $options: 'i' };
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to)   filter.timestamp.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      AuthLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(parseInt(limit)),
      AuthLog.countDocuments(filter)
    ]);

    res.json({ logs, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/logs/:id  ── single enriched log
exports.getLogById = async (req, res) => {
  try {
    const log = await AuthLog.findById(req.params.id);
    if (!log) return res.status(404).json({ error: 'Log not found' });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
