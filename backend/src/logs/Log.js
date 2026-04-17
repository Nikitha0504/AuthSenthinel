const mongoose = require('mongoose');

const authLogSchema = new mongoose.Schema(
  {
    user:      { type: String, required: true, index: true },
    event:     { type: String, required: true, index: true,
                 enum: ['LOGIN_SUCCESS','LOGIN_FAILED','TOKEN_EXPIRED','TOKEN_INVALID',
                        'TOKEN_REVOKED','PASSWORD_RESET_INITIATED','ACCOUNT_LOCKED','MFA_FAILED'] },
    reason:    { type: String, default: '' },
    ip:        { type: String, default: '', index: true },
    appId:     { type: String, default: 'unknown' },
    userAgent: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now, index: true },
    analyzed: {
      title:      { type: String },
      cause:      { type: String },
      suggestion: { type: String },
      severity:   { type: String, enum: ['INFO','LOW','MEDIUM','HIGH','CRITICAL'], default: 'LOW' }
    }
  },
  { timestamps: false }
);

module.exports = mongoose.model('AuthLog', authLogSchema);
