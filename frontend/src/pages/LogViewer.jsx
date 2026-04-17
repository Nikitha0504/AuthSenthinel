import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import api from '../api/api';

const LogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ user: '', event: '', ip: '' });
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/logs?${query}`);
      setLogs(data.logs);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Log Viewer</h1>
          <p style={{ margin: 0 }}>Search and debug raw authentication events.</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Filter size={20} color="var(--text-muted)" />
        <input 
          type="text" name="user" placeholder="Filter by email..." 
          value={filters.user} onChange={handleFilterChange} 
          className="input-field" style={{ flex: 1, padding: '0.5rem', margin: 0 }} 
        />
        <input 
          type="text" name="event" placeholder="Event type (e.g. LOGIN_FAILED)" 
          value={filters.event} onChange={handleFilterChange} 
          className="input-field" style={{ flex: 1, padding: '0.5rem', margin: 0 }} 
        />
        <input 
          type="text" name="ip" placeholder="IP Address" 
          value={filters.ip} onChange={handleFilterChange} 
          className="input-field" style={{ flex: 1, padding: '0.5rem', margin: 0 }} 
        />
        <button className="btn btn-secondary" onClick={() => setFilters({ user: '', event: '', ip: '' })}>
          Clear
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {/* Table View */}
        <div className="glass-card" style={{ flex: selectedLog ? '0 0 60%' : '1', transition: 'all 0.3s' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading logs...</div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Event</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr 
                    key={log._id} 
                    onClick={() => setSelectedLog(log)}
                    style={{ cursor: 'pointer', background: selectedLog?._id === log._id ? 'rgba(0, 240, 255, 0.05)' : '' }}
                  >
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>{log.user}</td>
                    <td>
                      <span className={`badge ${log.event === 'LOGIN_SUCCESS' ? 'badge-success' : 'badge-error'}`}>
                        {log.event}
                      </span>
                    </td>
                    <td>{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail Drawer */}
        {selectedLog && (
          <div className="glass-card animate-fade-in" style={{ flex: '1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Event Details</h3>
              <button onClick={() => setSelectedLog(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Analyzer Conclusion</div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid var(--accent-cyan)` }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{selectedLog.analyzed?.title || 'Unknown'}</h4>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}><strong>Cause:</strong> {selectedLog.analyzed?.cause}</p>
                <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Suggested Fix:</strong> {selectedLog.analyzed?.suggestion}</p>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Raw Log Payload</div>
              <pre style={{ background: '#000', padding: '1rem', borderRadius: 'var(--radius-sm)', overflowX: 'auto', fontSize: '0.8rem', color: 'var(--status-success)' }}>
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogViewer;
