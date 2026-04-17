import React from 'react';

const MetricCard = ({ title, value, subtext, trend, icon }) => {
  return (
    <div className="glass-card animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500, margin: 0 }}>{title}</h3>
        {icon && <div style={{ color: 'var(--accent-cyan)' }}>{icon}</div>}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</span>
        {trend && (
          <span style={{ 
            fontSize: '0.85rem', 
            color: trend.startsWith('+') ? 'var(--status-error)' : 'var(--status-success)' // If trend is failure rate, + is bad
          }}>
            {trend}
          </span>
        )}
      </div>
      
      {subtext && (
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{subtext}</p>
      )}
    </div>
  );
};

export default MetricCard;
