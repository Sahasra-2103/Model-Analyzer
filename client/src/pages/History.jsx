import React, { useState, useEffect } from 'react';
import { getHistory } from '../services/api';
import ResultCard from '../components/ResultCard';
import { Clock, FileText, Search, ChevronRight, Inbox } from 'lucide-react';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getHistory();
        if (res.success) {
          setHistory(res.data);
          if (res.data.length > 0) {
            setSelectedDoc(res.data[0]); // Auto-select first item
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="loader-container" style={{ height: '70vh' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading archive...</p>
      </div>
    );
  }

  const filteredHistory = history.filter(doc => 
    doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-slide-up" style={{ height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.75rem', background: 'var(--primary-gradient)', borderRadius: '12px', color: 'white' }}>
          <Clock size={28} />
        </div>
        <h1 className="text-gradient" style={{ margin: 0, fontSize: '2.5rem' }}>Document Archive</h1>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
        Review past analyses, extractions, and AI insights.
      </p>
      
      {history.length === 0 ? (
        <div className="glass-card empty-state" style={{ marginTop: '2rem' }}>
          <Inbox size={64} className="empty-icon" />
          <h2 style={{ marginBottom: '1rem' }}>Your Archive is Empty</h2>
          <p>You haven't processed any documents yet. Head over to the Dashboard to upload your first file.</p>
        </div>
      ) : (
        <div className="history-layout">
          {/* Sidebar list */}
          <div className="history-sidebar">
            <div style={{ position: 'sticky', top: 0, background: 'var(--bg-color)', zIndex: 10, paddingBottom: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search files..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '0.875rem 1rem 0.875rem 2.5rem', 
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--card-bg)',
                    color: 'var(--text-color)',
                    outline: 'none',
                    boxShadow: 'var(--glass-shadow)'
                  }} 
                />
              </div>
            </div>

            {filteredHistory.map(item => (
              <div 
                key={item._id} 
                className={`history-item ${selectedDoc?._id === item._id ? 'active' : ''}`}
                onClick={() => setSelectedDoc(item)}
              >
                <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: 'var(--primary-color)' }}>
                  <FileText size={20} />
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.95rem' }}>
                    {item.fileName}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    {new Date(item.uploadedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--border-color)', alignSelf: 'center' }} />
              </div>
            ))}
            
            {filteredHistory.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No files match your search.
              </div>
            )}
          </div>

          {/* Details Main Area */}
          <div className="history-main">
            {selectedDoc ? (
              <div className="animate-slide-up" key={selectedDoc._id}>
                <div className="glass-card" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{selectedDoc.fileName}</h2>
                    <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                      Type: {selectedDoc.fileType?.split('/')[1]?.toUpperCase() || 'Unknown'} • Processed on {new Date(selectedDoc.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)', padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: '600' }}>
                    Analyzed
                  </div>
                </div>
                
                {selectedDoc.analysis ? (
                  <ResultCard result={selectedDoc.analysis} docId={selectedDoc._id} />
                ) : (
                  <div className="glass-card empty-state" style={{ padding: '3rem' }}>
                    <p>No analysis data was saved for this document.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card empty-state">
                <p>Select a document from the sidebar to view its full analysis.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
