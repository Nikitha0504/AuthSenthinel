const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    rule:         { type: String, required: true },
    severity:     { type: String, enum: ['LOW','MEDIUM','HIGH','CRITICAL'], default: 'HIGH' },
    message:      { type: String, required: true },
    affectedUser: { type: String, default: '' },
    relatedLogs:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'AuthLog' }],
    triggeredAt:  { type: Date, default: Date.now },
    resolved:     { type: Boolean, default: false },
    resolvedAt:   { type: Date }
  },
  { timestamps: false }
);

module.exports = mongoose.model('Alert', alertSchema);
