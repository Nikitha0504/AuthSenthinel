import React, { useState } from 'react';
import { Key } from 'lucide-react';
import api from '../api/api';

const TokenInspector = () => {
  const [tokenInput, setTokenInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInspect = async () => {
    if (!tokenInput) return;
    setError(null);
    setResult(null);
    try {
      const { data } = await api.post('/tools/jwt/inspect', { token: tokenInput });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to inspect token');
    }
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>JWT Inspector</h1>
        <p style={{ margin: 0 }}>Paste a JSON Web Token below to decode and analyze its claims locally.</p>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <textarea 
          className="input-field" 
          rows="5" 
          placeholder="Paste eyJhbGciOiJIUzI1NiIsInR5cCI..."
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          style={{ fontFamily: 'monospace', resize: 'vertical' }}
        ></textarea>
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleInspect}>
          <Key size={18} /> Decode Token
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(255, 23, 68, 0.1)', border: '1px solid var(--status-error)', padding: '1rem', borderRadius: 'var(--radius-sm)', color: 'var(--status-error)' }}>
          {error}
        </div>
      )}

      {result && (
        <div className="dashboard-grid">
          <div className="col-span-8">
            <div className="glass-card">
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Payload Data</h3>
              <pre style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace', fontSize: '0.9rem', marginBottom: 0 }}>
                {JSON.stringify(result.payload, null, 2)}
              </pre>
            </div>
            
            <div className="glass-card" style={{ marginTop: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Header</h3>
              <pre style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.9rem', marginBottom: 0 }}>
                {JSON.stringify(result.header, null, 2)}
              </pre>
            </div>
          </div>

          <div className="col-span-4">
            <div className="glass-card">
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Analysis & Issues</h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <span className="input-label" style={{ display: 'block', marginBottom: '0.25rem' }}>Status</span>
                <span className={`badge ${result.expiryStatus === 'VALID' ? 'badge-success' : result.expiryStatus === 'EXPIRED' ? 'badge-error' : 'badge-warning'}`}>
                  {result.expiryStatus}
                </span>
                {result.timeUntilExpiry && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{result.timeUntilExpiry}</div>}
              </div>

              <div>
                <span className="input-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Security Warnings</span>
                {result.issues.length === 0 ? (
                  <div style={{ color: 'var(--status-success)', fontSize: '0.9rem' }}>No issues detected. Token looks healthy.</div>
                ) : (
                  <ul style={{ paddingLeft: '1.2rem', color: 'var(--status-warning)', fontSize: '0.9rem', margin: 0 }}>
                    {result.issues.map((issue, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenInspector;
