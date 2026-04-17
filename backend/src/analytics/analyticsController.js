const AuthLog = require('../logs/Log');

const periodMap = { '24h': 24, '7d': 168, '30d': 720 };

// GET /api/analytics/summary?period=24h|7d|30d
exports.getSummary = async (req, res) => {
  try {
    const period = req.query.period || '24h';
    const hours = periodMap[period] || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const prevSince = new Date(since.getTime() - hours * 60 * 60 * 1000);

    const [current, previous, uniqueUsers, errorDist] = await Promise.all([
      AuthLog.aggregate([
        { $match: { timestamp: { $gte: since } } },
        { $group: { _id: '$event', count: { $sum: 1 } } }
      ]),
      AuthLog.aggregate([
        { $match: { timestamp: { $gte: prevSince, $lt: since } } },
        { $group: { _id: '$event', count: { $sum: 1 } } }
      ]),
      AuthLog.distinct('user', { event: { $ne: 'LOGIN_SUCCESS' }, timestamp: { $gte: since } }),
      AuthLog.aggregate([
        { $match: { timestamp: { $gte: since }, event: { $ne: 'LOGIN_SUCCESS' } } },
        { $group: { _id: { $ifNull: ['$reason', '$event'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 6 }
      ])
    ]);

    const toMap = (arr) => arr.reduce((m, x) => { m[x._id] = x.count; return m; }, {});
    const cur = toMap(current);
    const prev = toMap(previous);

    const totalAttempts = Object.values(cur).reduce((a, b) => a + b, 0);
    const prevTotal = Object.values(prev).reduce((a, b) => a + b, 0);
    const failures = (cur['LOGIN_FAILED'] || 0) + (cur['TOKEN_INVALID'] || 0) + (cur['TOKEN_EXPIRED'] || 0) + (cur['ACCOUNT_LOCKED'] || 0) + (cur['MFA_FAILED'] || 0);
    const prevFailures = (prev['LOGIN_FAILED'] || 0) + (prev['TOKEN_INVALID'] || 0) + (prev['TOKEN_EXPIRED'] || 0) + (prev['ACCOUNT_LOCKED'] || 0) + (prev['MFA_FAILED'] || 0);

    const failureRate = totalAttempts > 0 ? ((failures / totalAttempts) * 100).toFixed(1) : '0.0';
    const prevFailureRate = prevTotal > 0 ? ((prevFailures / prevTotal) * 100).toFixed(1) : '0.0';

    res.json({
      period,
      totalAttempts,
      prevTotalAttempts: prevTotal,
      failureRate: parseFloat(failureRate),
      prevFailureRate: parseFloat(prevFailureRate),
      uniqueUsersAffected: uniqueUsers.length,
      topErrors: errorDist.map(e => ({ code: e._id, count: e.count })),
      eventBreakdown: cur
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/analytics/timeseries?period=24h
exports.getTimeSeries = async (req, res) => {
  try {
    const period = req.query.period || '24h';
    const hours = periodMap[period] || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const bucketHours = hours <= 24 ? 1 : hours <= 168 ? 6 : 24;

    const data = await AuthLog.aggregate([
      { $match: { timestamp: { $gte: since } } },
      {
        $group: {
          _id: {
            bucket: {
              $toDate: {
                $subtract: [
                  { $toLong: '$timestamp' },
                  { $mod: [{ $toLong: '$timestamp' }, bucketHours * 3600 * 1000] }
                ]
              }
            },
            event: '$event'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.bucket': 1 } }
    ]);

    // Reshape into [{time, success, failure}]
    const buckets = {};
    data.forEach(({ _id: { bucket, event }, count }) => {
      const key = bucket.toISOString();
      if (!buckets[key]) buckets[key] = { time: key, success: 0, failure: 0 };
      if (event === 'LOGIN_SUCCESS') buckets[key].success += count;
      else buckets[key].failure += count;
    });

    res.json(Object.values(buckets));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/analytics/top-offenders?period=24h
exports.getTopOffenders = async (req, res) => {
  try {
    const period = req.query.period || '24h';
    const hours = periodMap[period] || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const [byUser, byIP] = await Promise.all([
      AuthLog.aggregate([
        { $match: { timestamp: { $gte: since }, event: { $ne: 'LOGIN_SUCCESS' } } },
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 10 },
        { $project: { label: '$_id', count: 1, _id: 0 } }
      ]),
      AuthLog.aggregate([
        { $match: { timestamp: { $gte: since }, event: { $ne: 'LOGIN_SUCCESS' }, ip: { $ne: '' } } },
        { $group: { _id: '$ip', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 10 },
        { $project: { label: '$_id', count: 1, _id: 0 } }
      ])
    ]);

    res.json({ byUser, byIP });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
