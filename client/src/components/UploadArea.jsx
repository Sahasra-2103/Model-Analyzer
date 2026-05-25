import { useState, useRef } from 'react';
import { UploadCloud, X, FileText, FileImage, FileCode, CheckCircle2 } from 'lucide-react';

const UploadArea = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);

  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = function(e) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (newFiles) => {
    const filesArray = Array.from(newFiles);
    setFiles((prev) => [...prev, ...filesArray]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setFiles([]);
  };

  const submitUpload = () => {
    if (files.length > 0) {
      onUpload(files);
      clearFiles();
    }
  };

  const getFileIcon = (type) => {
    if (type.includes('image')) return <FileImage size={24} />;
    if (type.includes('pdf')) return <FileText size={24} />;
    return <FileCode size={24} />;
  };

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div 
        className={`upload-area ${dragActive ? "drag-active" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        style={{
          border: `2px dashed ${dragActive ? 'var(--primary-color)' : 'var(--border-color)'}`,
          backgroundColor: dragActive ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255, 255, 255, 0.02)',
          borderRadius: '16px',
          padding: '4rem 2rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          transform: dragActive ? 'scale(0.99)' : 'scale(1)'
        }}
      >
        <input 
          ref={inputRef} 
          type="file" 
          multiple 
          onChange={handleChange} 
          style={{ display: 'none' }} 
        />
        <div style={{ 
          background: 'var(--primary-gradient)', 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 1.5rem',
          color: 'white',
          boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)'
        }}>
          <UploadCloud size={40} />
        </div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Drag & Drop your knowledge base here</h3>
        <p style={{ color: 'var(--text-muted)' }}>or click to browse from your device</p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <span className="tag" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)' }}>PDF</span>
          <span className="tag" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>Images</span>
          <span className="tag" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)' }}>DOCX</span>
          <span className="tag" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning-color)' }}>CSV</span>
        </div>
      </div>

      {files.length > 0 && (
        <div className="animate-slide-up" style={{ marginTop: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Ready to analyze ({files.length})</h3>
          </div>
          
          <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
            {files.map((file, index) => (
              <div key={index} className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ color: 'var(--primary-color)', background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '10px' }}>
                    {getFileIcon(file.type)}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0' }}>{file.name}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
                <button 
                  onClick={() => removeFile(index)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }}
                  onMouseOver={(e) => { e.currentTarget.style.color = 'var(--danger-color)'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={clearFiles} style={{ background: 'transparent', color: 'var(--text-color)', border: '1px solid var(--border-color)' }}>
              Clear All
            </button>
            <button className="btn btn-primary" onClick={submitUpload} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={20} /> Execute AI Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadArea;
