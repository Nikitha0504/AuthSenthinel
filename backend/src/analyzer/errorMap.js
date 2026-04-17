/**
 * AuthSentinel Error Analyzer Map
 * Each key is an event type or reason code.
 * Returns: { title, cause, suggestion, severity }
 */
const errorMap = {
  // ── Token Errors ──────────────────────────────────────────────
  TOKEN_EXPIRED: {
    title: 'Session Expired',
    cause: 'JWT presented after its exp timestamp.',
    suggestion: 'Prompt user to re-login. Implement a refresh token endpoint.',
    severity: 'MEDIUM'
  },
  TOKEN_INVALID: {
    title: 'Token Tampered or Malformed',
    cause: 'JWT signature does not match server secret, or structure is broken.',
    suggestion: 'Investigate token origin. Rotate signing secret if widespread.',
    severity: 'HIGH'
  },
  TOKEN_REVOKED: {
    title: 'Token Revoked',
    cause: 'Token exists in the deny-list / has been explicitly invalidated.',
    suggestion: 'Redirect user to login. Check if logout flow is firing correctly.',
    severity: 'HIGH'
  },
  INVALID_SIGNATURE: {
    title: 'Invalid Signature',
    cause: 'JWT signature verification failed — possible tampering.',
    suggestion: 'Investigate token origin. Rotate signing secret immediately.',
    severity: 'CRITICAL'
  },

  // ── Login Failures ────────────────────────────────────────────
  LOGIN_FAILED: {
    title: 'Login Attempt Failed',
    cause: 'Authentication returned false — could be wrong password, locked account, etc.',
    suggestion: 'Check the reason code for specifics. Consider lockout after 5 attempts.',
    severity: 'LOW'
  },
  INVALID_PASSWORD: {
    title: 'Wrong Password',
    cause: 'bcrypt comparison returned false for the supplied password.',
    suggestion: 'Show a forgot-password link. Consider lockout after 5+ attempts.',
    severity: 'LOW'
  },
  USER_NOT_FOUND: {
    title: 'User Not Found',
    cause: 'No account exists for the supplied email address.',
    suggestion: 'Return a generic "Invalid credentials" message to avoid user enumeration.',
    severity: 'LOW'
  },
  ACCOUNT_DISABLED: {
    title: 'Account Disabled',
    cause: 'Admin has deactivated this account.',
    suggestion: 'Direct user to contact support. Log the attempt for audit.',
    severity: 'MEDIUM'
  },
  ACCOUNT_NOT_VERIFIED: {
    title: 'Email Not Verified',
    cause: 'User registered but has not completed email verification.',
    suggestion: 'Resend the verification email. Block login until verified.',
    severity: 'LOW'
  },

  // ── Account Status ────────────────────────────────────────────
  ACCOUNT_LOCKED: {
    title: 'Account Locked',
    cause: 'Failed login threshold exceeded — automatic lockout triggered.',
    suggestion: 'Trigger unlock via email. Alert security team if widespread.',
    severity: 'HIGH'
  },

  // ── MFA ───────────────────────────────────────────────────────
  MFA_FAILED: {
    title: 'MFA Challenge Failed',
    cause: 'OTP/TOTP code was incorrect or expired.',
    suggestion: 'Prompt user to retry. Check clock skew if systematic failure.',
    severity: 'MEDIUM'
  },

  // ── Password Reset ────────────────────────────────────────────
  PASSWORD_RESET_INITIATED: {
    title: 'Password Reset Requested',
    cause: 'User triggered the forgot-password flow.',
    suggestion: 'Ensure reset link expires in 15 minutes. Rate-limit reset requests.',
    severity: 'LOW'
  },

  // ── General Success ───────────────────────────────────────────
  LOGIN_SUCCESS: {
    title: 'Successful Login',
    cause: 'User authenticated successfully.',
    suggestion: 'No action required.',
    severity: 'INFO'
  },

  // ── Fallback ──────────────────────────────────────────────────
  UNKNOWN: {
    title: 'Unknown Event',
    cause: 'Event or reason code not recognized by the analyzer.',
    suggestion: 'Add this code to the errorMap for future enrichment.',
    severity: 'LOW'
  }
};

module.exports = errorMap;
