const Alert = require('./Alert');

// GET /api/alerts
exports.getAlerts = async (req, res) => {
  try {
    const { resolved, severity, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (resolved !== undefined) filter.resolved = resolved === 'true';
    if (severity) filter.severity = { $in: severity.split(',') };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [alerts, total] = await Promise.all([
      Alert.find(filter).sort({ triggeredAt: -1 }).skip(skip).limit(parseInt(limit)),
      Alert.countDocuments(filter)
    ]);
    res.json({ alerts, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/alerts/:id/resolve
exports.resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { resolved: true, resolvedAt: new Date() },
      { new: true }
    );
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json({ resolved: true, alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/alerts/count — active alert count for dashboard badge
exports.alertCount = async (req, res) => {
  try {
    const counts = await Alert.aggregate([
      { $match: { resolved: false } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);
    const total = await Alert.countDocuments({ resolved: false });
    res.json({ total, breakdown: counts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
