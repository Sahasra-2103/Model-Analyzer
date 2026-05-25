import { useState, useEffect } from 'react';
import { getAnalytics } from '../services/api';
import { BarChart3, FileText, Globe, Layers, Activity } from 'lucide-react';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getAnalytics();
        if (res.success) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="loader-container" style={{ height: '70vh' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading platform insights...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="glass-card empty-state" style={{ marginTop: '4rem' }}>
        <Activity size={64} className="empty-icon" />
        <h2 style={{ marginBottom: '1rem' }}>No Analytics Data</h2>
        <p>Upload and analyze some documents to generate insights.</p>
      </div>
    );
  }

  // Calculate percentages for progress bars
  const totalDocs = analytics.totalDocuments || 1; 

  return (
    <div className="animate-slide-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.75rem', background: 'var(--primary-gradient)', borderRadius: '12px', color: 'white' }}>
          <BarChart3 size={28} />
        </div>
        <h1 className="text-gradient" style={{ margin: 0, fontSize: '2.5rem' }}>Platform Intelligence</h1>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
        Deep insights and usage metrics across your document workspace.
      </p>
      
      <div className="analytics-grid">
        {/* Total Documents Card */}
        <div className="glass-card stat-card" style={{ gridColumn: '1 / -1', md: { gridColumn: 'span 1' } }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
            <FileText size={20} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Processed</h3>
          </div>
          <div className="stat-value text-gradient">
            {analytics.totalDocuments || 0}
          </div>
          <p style={{ color: 'var(--success-color)', fontWeight: '500', fontSize: '0.9rem' }}>
            +100% active system uptime
          </p>
        </div>
        
        {/* Document Types Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: 'var(--primary-color)' }}>
              <Layers size={20} />
            </div>
            <h3 style={{ margin: 0 }}>Format Distribution</h3>
          </div>
          
          <ul className="dist-list">
            {analytics.documentTypes && Object.entries(analytics.documentTypes).map(([type, count], i) => {
              const percentage = Math.round((count / totalDocs) * 100);
              return (
                <li key={type} className="dist-item" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-color)', maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {type.split('/')[1]?.toUpperCase() || type}
                      </span>
                      <strong style={{ color: 'var(--primary-color)' }}>{count} ({percentage}%)</strong>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Language Distribution Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px', color: '#a855f7' }}>
              <Globe size={20} />
            </div>
            <h3 style={{ margin: 0 }}>Language Matrix</h3>
          </div>
          
          <ul className="dist-list">
            {analytics.languageDistribution && Object.entries(analytics.languageDistribution).map(([lang, count], i) => {
               const percentage = Math.round((count / totalDocs) * 100);
               return (
                <li key={lang} className="dist-item" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-color)', textTransform: 'capitalize' }}>
                        {lang}
                      </span>
                      <strong style={{ color: '#a855f7' }}>{count} ({percentage}%)</strong>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${percentage}%`, background: 'linear-gradient(90deg, #a855f7, #ec4899)' }}></div>
                    </div>
                  </div>
                </li>
               );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
