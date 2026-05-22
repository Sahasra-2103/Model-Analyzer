import React, { useState } from 'react';
import UploadArea from '../components/UploadArea';
import ResultCard from '../components/ResultCard';
import { uploadFiles, analyzeDocument } from '../services/api';
import { Sparkles, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleUpload = async (files) => {
    setLoading(true);
    setError('');
    
    try {
      // 1. Upload files
      const uploadRes = await uploadFiles(files);
      if (!uploadRes.success) throw new Error('Upload failed');
      
      const newResults = [];
      
      // 2. Analyze each uploaded document
      for (const doc of uploadRes.data) {
        const analyzeRes = await analyzeDocument(doc._id);
        if (analyzeRes.success) {
          newResults.push({
            docId: doc._id,
            fileName: doc.fileName,
            analysis: analyzeRes.data
          });
        }
      }
      
      setResults(prev => [...newResults, ...prev]);
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data?.error || err.message || 'Unknown error occurred';
      setError(`Processing Error: ${serverMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up">
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)', padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '0.875rem', fontWeight: '600', marginBottom: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <Sparkles size={16} /> Powered by Multimodal AI
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', lineHeight: '1.1' }}>
          Unify Your <span className="text-gradient">Knowledge Base</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto' }}>
          Instantly extract insights, generate summaries, and interact with your documents, images, and raw data using advanced AI models.
        </p>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <UploadArea onUpload={handleUpload} />

        {loading && (
          <div className="glass-card animate-slide-up" style={{ marginTop: '2rem', textAlign: 'center', padding: '3rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1.5rem' }}></div>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Processing Documents...</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>The AI is currently analyzing and extracting intelligent insights.</p>
          </div>
        )}

        {error && (
          <div className="glass-card animate-slide-up" style={{ marginTop: '2rem', border: '1px solid var(--danger-color)', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <AlertCircle color="var(--danger-color)" size={28} />
            <div style={{ color: 'var(--danger-color)' }}>
              <strong>Analysis Failed</strong>
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div style={{ marginTop: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', margin: 0 }}>Analysis Results</h2>
              <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)', padding: '0.5rem 1rem', borderRadius: '99px', fontWeight: '600' }}>
                {results.length} Document{results.length !== 1 ? 's' : ''} Processed
              </span>
            </div>
            
            {results.map((result, idx) => (
              <div key={idx} className="animate-slide-up" style={{ marginBottom: '3rem', animationDelay: `${idx * 0.1}s` }}>
                <h3 style={{ paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)' }}></div>
                  {result.fileName}
                </h3>
                <ResultCard result={result.analysis} docId={result.docId} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
