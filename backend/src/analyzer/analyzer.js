const errorMap = require('./errorMap');

/**
 * Enriches a raw log event with human-readable diagnostics.
 * Checks reason first (more specific), then falls back to event type.
 * @param {Object} log - Raw log: { event, reason }
 * @returns {{ title, cause, suggestion, severity }}
 */
function analyze(log) {
  const key = log.reason || log.event || 'UNKNOWN';
  const mapping = errorMap[key] || errorMap['UNKNOWN'];
  return {
    title: mapping.title,
    cause: mapping.cause,
    suggestion: mapping.suggestion,
    severity: mapping.severity
  };
}

module.exports = { analyze };
