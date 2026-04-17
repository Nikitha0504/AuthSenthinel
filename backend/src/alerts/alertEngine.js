const AuthLog = require('../logs/Log');
const Alert = require('./Alert');

/**
 * Sliding-window alert engine.
 * Runs after every ingested log and checks all 4 built-in rules.
 */
async function runAlertEngine(log) {
  await Promise.all([
    checkBruteForce(log),
    checkCredentialStuffing(log),
    checkTokenFlood(log),
    checkAccountLockoutSpike(log)
  ]);
}

// Rule 1: 5+ LOGIN_FAILED from same IP in 2-minute window
async function checkBruteForce(log) {
  if (log.event !== 'LOGIN_FAILED') return;
  const since = new Date(Date.now() - 2 * 60 * 1000);
  const count = await AuthLog.countDocuments({ event: 'LOGIN_FAILED', ip: log.ip, timestamp: { $gte: since } });
  if (count >= 5) {
    const exists = await Alert.findOne({ rule: 'BRUTE_FORCE', resolved: false,
      triggeredAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }, message: { $regex: log.ip } });
    if (!exists) {
      await Alert.create({
        rule: 'BRUTE_FORCE', severity: 'HIGH',
        message: `${count} failed logins from ${log.ip} in 2 minutes`,
        affectedUser: log.user, relatedLogs: [log._id]
      });
    }
  }
}

// Rule 2: 10+ LOGIN_FAILED across different users from same IP in 10 minutes
async function checkCredentialStuffing(log) {
  if (log.event !== 'LOGIN_FAILED') return;
  const since = new Date(Date.now() - 10 * 60 * 1000);
  const results = await AuthLog.distinct('user', { event: 'LOGIN_FAILED', ip: log.ip, timestamp: { $gte: since } });
  if (results.length >= 10) {
    const exists = await Alert.findOne({ rule: 'CREDENTIAL_STUFFING', resolved: false,
      triggeredAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }, message: { $regex: log.ip } });
    if (!exists) {
      await Alert.create({
        rule: 'CREDENTIAL_STUFFING', severity: 'CRITICAL',
        message: `Credential stuffing detected: ${results.length} users targeted from ${log.ip} in 10 minutes`,
        affectedUser: 'multiple', relatedLogs: [log._id]
      });
    }
  }
}

// Rule 3: 20+ TOKEN_INVALID events in 5-minute window
async function checkTokenFlood(log) {
  if (log.event !== 'TOKEN_INVALID') return;
  const since = new Date(Date.now() - 5 * 60 * 1000);
  const count = await AuthLog.countDocuments({ event: 'TOKEN_INVALID', timestamp: { $gte: since } });
  if (count >= 20) {
    const exists = await Alert.findOne({ rule: 'TOKEN_FLOOD', resolved: false,
      triggeredAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) } });
    if (!exists) {
      await Alert.create({
        rule: 'TOKEN_FLOOD', severity: 'HIGH',
        message: `Token flood: ${count} TOKEN_INVALID events in 5 minutes`,
        affectedUser: '', relatedLogs: [log._id]
      });
    }
  }
}

// Rule 4: 3+ ACCOUNT_LOCKED events within 1 minute
async function checkAccountLockoutSpike(log) {
  if (log.event !== 'ACCOUNT_LOCKED') return;
  const since = new Date(Date.now() - 60 * 1000);
  const count = await AuthLog.countDocuments({ event: 'ACCOUNT_LOCKED', timestamp: { $gte: since } });
  if (count >= 3) {
    const exists = await Alert.findOne({ rule: 'LOCKOUT_SPIKE', resolved: false,
      triggeredAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } });
    if (!exists) {
      await Alert.create({
        rule: 'LOCKOUT_SPIKE', severity: 'CRITICAL',
        message: `Account lockout spike: ${count} accounts locked in 1 minute`,
        affectedUser: log.user, relatedLogs: [log._id]
      });
    }
  }
}

module.exports = { runAlertEngine };
