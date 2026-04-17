const mongoose = require('mongoose');
const { analyze } = require('./src/analyzer/analyzer');
const AuthLog = require('./src/logs/Log');
const Alert = require('./src/alerts/Alert');
const User = require('./src/auth/User');
const { runAlertEngine } = require('./src/alerts/alertEngine');

const events = ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'TOKEN_EXPIRED', 'TOKEN_INVALID', 'TOKEN_REVOKED', 'ACCOUNT_LOCKED', 'MFA_FAILED'];
const reasons = ['INVALID_PASSWORD', 'USER_NOT_FOUND', 'ACCOUNT_DISABLED', ''];
const ipAddresses = ['192.168.1.1', '203.0.113.42', '10.0.0.5', '104.28.10.15', '185.199.108.153'];
const users = ['demo@authsentinel.local', 'nikitha@company.com', 'admin@sys.local', 'user1@test.com'];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateLog(override = {}) {
  const event = override.event || randomChoice(events);
  const reason = override.reason || (event === 'LOGIN_FAILED' ? randomChoice(reasons.filter(Boolean)) : '');
  const timestamp = override.timestamp || new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000));
  
  const rawLog = {
    user: override.user || randomChoice(users),
    event,
    reason,
    ip: override.ip || randomChoice(ipAddresses),
    appId: 'auth_service_v1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/100.0',
    timestamp
  };

  return {
    ...rawLog,
    analyzed: analyze(rawLog)
  };
}

module.exports = async function seedDb() {
  console.log('[Seed] Wiping current collections...');
  await AuthLog.deleteMany({});
  await Alert.deleteMany({});
  await User.deleteMany({});
  
  // Create Default User
  const defaultUser = new User({ email: 'admin@authsentinel.local', passwordHash: 'password123', role: 'ADMIN' });
  defaultUser.passwordHash = 'password123'; 
  await defaultUser.save();

  console.log('[Seed] Admin user created: admin@authsentinel.local / password123');

  // Generate random logs
  const logs = [];
  for (let i = 0; i < 200; i++) {
    logs.push(generateLog());
  }

  // Force a brute force cluster
  const now = Date.now();
  for (let i = 0; i < 6; i++) {
    logs.push(generateLog({
      event: 'LOGIN_FAILED',
      reason: 'INVALID_PASSWORD',
      ip: '104.28.10.15',
      timestamp: new Date(now - (i * 10000)) // 6 attempts within 1 minute
    }));
  }

  // Insert logs
  for (const log of logs) {
    const inserted = await AuthLog.create(log);
    await runAlertEngine(inserted);
  }

  console.log(`[Seed] Injected ${logs.length} logs and generated alerts.`);
};
