import React, { useEffect, useState } from 'react';
import { Activity, Users, AlertOctagon, TrendingUp } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import api from '../api/api';
import { io } from 'socket.io-client';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [alertCount, setAlertCount] = useState(0);
  const [liveLogs, setLiveLogs] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [sumRes, alertRes] = await Promise.all([
          api.get('/analytics/summary?period=24h'),
          api.get('/alerts/count')
        ]);
        setSummary(sumRes.data);
        setAlertCount(alertRes.data.total);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    };
    fetchDashboardData();

    // Socket.io for live logs
    const socket = io('http://localhost:5000');
    socket.on('new_log', (log) => {
      setLiveLogs(prev => [log, ...prev].slice(0, 10)); // Keep last 10
    });

    return () => socket.disconnect();
  }, []);

  if (!summary) return <div>Loading...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Dashboard</h1>
          <p style={{ margin: 0 }}>Real-time overview of authentication events.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="status-dot pulsing"></div>
          <span style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>Live Updates Active</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="col-span-3">
          <MetricCard 
            title="Auth Attempts (24h)" 
            value={summary.totalAttempts.toLocaleString()} 
            icon={<Activity size={20} />} 
          />
        </div>
        <div className="col-span-3">
          <MetricCard 
            title="Failure Rate" 
            value={`${summary.failureRate}%`} 
            trend={summary.failureRate > summary.prevFailureRate ? `+${(summary.failureRate - summary.prevFailureRate).toFixed(1)}%` : `${(summary.failureRate - summary.prevFailureRate).toFixed(1)}%`}
            icon={<TrendingUp size={20} />} 
          />
        </div>
        <div className="col-span-3">
          <MetricCard 
            title="Unique Users Affected" 
            value={summary.uniqueUsersAffected.toLocaleString()} 
            icon={<Users size={20} />} 
          />
        </div>
        <div className="col-span-3">
          <MetricCard 
            title="Active Alerts" 
            value={alertCount} 
            icon={<AlertOctagon size={20} />} 
            trend={alertCount > 0 ? 'Requires attention' : 'All clear'}
          />
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Top Errors Ring (Simplistic representation) */}
        <div className="col-span-4 glass-card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Top Errors (24h)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {summary.topErrors.map(err => {
              const perc = ((err.count / Math.max(1, summary.totalAttempts)) * 100).toFixed(1);
              return (
                <div key={err.code}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span>{err.code}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{err.count} ({perc}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${perc}%`, height: '100%', background: 'var(--accent-magenta)', borderRadius: '3px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Feed */}
        <div className="col-span-8 glass-card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Live Log Feed</h3>
          {liveLogs.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Waiting for new authentication events...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {liveLogs.map((log, i) => (
                <div key={log._id || i} className="animate-fade-in" style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255,255,255,0.02)', borderLeft: `3px solid ${log.event === 'LOGIN_SUCCESS' ? 'var(--status-success)' : 'var(--status-error)'}`
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 500 }}>{log.user}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(log.timestamp).toLocaleTimeString()} • {log.ip}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${log.event === 'LOGIN_SUCCESS' ? 'badge-success' : 'badge-error'}`}>
                      {log.event}
                    </span>
                    {log.reason && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{log.reason}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
