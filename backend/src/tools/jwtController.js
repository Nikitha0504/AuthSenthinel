// POST /api/tools/jwt/inspect
// Decodes and validates a JWT client-side style — never forwards to third-party services.
exports.inspectJWT = (req, res) => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'token field is required' });
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return res.status(400).json({ error: 'Not a valid JWT format (expected 3 parts)' });
    }

    const decodeBase64 = (str) => {
      const padded = str.replace(/-/g, '+').replace(/_/g, '/');
      const buff = Buffer.from(padded, 'base64');
      return JSON.parse(buff.toString('utf8'));
    };

    let header, payload;
    try { header  = decodeBase64(parts[0]); } catch { return res.status(400).json({ error: 'Failed to decode JWT header' }); }
    try { payload = decodeBase64(parts[1]); } catch { return res.status(400).json({ error: 'Failed to decode JWT payload' }); }

    const now = Math.floor(Date.now() / 1000);
    const issues = [];

    // Expiry status
    let expiryStatus = 'NO_EXP';
    let timeUntilExpiry = null;

    if (payload.exp) {
      const diff = payload.exp - now;
      if (diff < 0) {
        expiryStatus = 'EXPIRED';
        issues.push(`Token expired ${Math.abs(diff)} seconds ago`);
      } else if (diff < 300) {
        expiryStatus = 'EXPIRES_SOON';
        timeUntilExpiry = `Expires in ${diff} seconds`;
      } else {
        expiryStatus = 'VALID';
        const mins = Math.floor(diff / 60);
        const hrs  = Math.floor(mins / 60);
        timeUntilExpiry = hrs > 0 ? `Expires in ${hrs}h ${mins % 60}m` : `Expires in ${mins} minutes`;
      }
    } else {
      issues.push('Missing exp claim — token never expires');
    }

    // Other checks
    if (!payload.sub) issues.push('Missing sub (subject) claim');
    if (header.alg === 'none') issues.push('Algorithm is "none" — DANGEROUS: token is unsigned');
    if (payload.iat && payload.iat > now) issues.push('iat (issued-at) is in the future — clock skew or spoofing');

    res.json({
      header,
      payload,
      expiryStatus,
      timeUntilExpiry,
      issues,
      raw: { header: parts[0], payload: parts[1], signature: parts[2] }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
