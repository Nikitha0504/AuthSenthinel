import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle } from 'lucide-react';
import api from '../api/api';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const { data } = await api.get('/alerts?resolved=false');
      setAlerts(data.alerts);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const resolveAlert = async (id) => {
    try {
      await api.patch(`/alerts/${id}/resolve`);
      setAlerts(alerts.filter(a => a._id !== id));
    } catch (err) {
      console.error('Failed to resolve alert', err);
    }
  };

  const severityColor = {
    LOW: 'var(--status-info)',
    MEDIUM: 'var(--status-warning)',
    HIGH: 'var(--status-error)',
    CRITICAL: '#ff003c' // pure bright red
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Active Alerts</h1>
          <p style={{ margin: 0 }}>Anomalies and threat detections from the rules engine.</p>
        </div>
      </div>

      {loading ? (
        <div>Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <ShieldAlert size={48} color="var(--status-success)" style={{ marginBottom: '1rem' }} />
          <h2>All Clear</h2>
          <p>No active security or anomaly alerts detected.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {alerts.map(alert => (
            <div key={alert._id} className="glass-card animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${severityColor[alert.severity]}` }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{alert.rule.replace(/_/g, ' ')}</h3>
                  <span className="badge" style={{ background: `${severityColor[alert.severity]}22`, color: severityColor[alert.severity], border: `1px solid ${severityColor[alert.severity]}55` }}>
                    {alert.severity}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(alert.triggeredAt).toLocaleString()}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>{alert.message}</p>
                {alert.affectedUser && (
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Target: {alert.affectedUser}</p>
                )}
              </div>
              <button className="btn btn-secondary" onClick={() => resolveAlert(alert._id)}>
                <CheckCircle size={16} /> Resolve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;
