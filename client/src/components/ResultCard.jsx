import { useState, useEffect, useRef } from 'react';
import { Copy, MessageSquare, Send } from 'lucide-react';
import { chatWithDocument } from '../services/api';

const ResultCard = ({ result, docId }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, chatLoading]);

  if (!result) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  const handleChat = async () => {
    if (!message.trim()) return;
    setChatLoading(true);
    setChatHistory([...chatHistory, { role: 'user', content: message }]);
    const currentMessage = message;
    setMessage('');
    
    try {
      const res = await chatWithDocument(docId, currentMessage);
      setChatHistory(prev => [...prev, { role: 'ai', content: res.data.response }]);
    } catch (e) {
      console.error(e);
      setChatHistory(prev => [...prev, { role: 'ai', content: 'Error getting response.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="card-title">
          <h3>Summary</h3>
          <div>
            <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', marginRight: '0.5rem' }} onClick={() => copyToClipboard(result.summary)}>
              <Copy size={16} />
            </button>
          </div>
        </div>
        <p>{result.summary}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <h3 className="card-title">Insights</h3>
          <p><strong>Category:</strong> {result.category}</p>
          <p><strong>Sentiment:</strong> {result.sentiment}</p>
          <p><strong>Language:</strong> {result.language}</p>
        </div>

        <div className="card">
          <h3 className="card-title">Keywords</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            {result.keywords?.map((kw, i) => (
              <span key={i} style={{ 
                display: 'inline-block',
                padding: '0.6rem 1rem',
                borderRadius: '16px',
                backgroundColor: 'var(--primary-color)',
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: '500',
                whiteSpace: 'nowrap'
              }}>
                {kw}
              </span>
            ))}
          </div>
        </div>
        
        <div className="card">
          <h3 className="card-title">Recommendations</h3>
          <ul>
            {result.recommendations?.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="card chat-card">
        <h3 className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>💬 Document Chat</span>
          <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => setChatOpen(!chatOpen)}>
            <MessageSquare size={16} style={{ marginRight: '0.5rem' }} /> {chatOpen ? 'Close' : 'Open'}
          </button>
        </h3>
        
        {chatOpen && (
          <div className="chat-container-enhanced">
            <div className="chat-messages-enhanced">
              {chatHistory.length === 0 && (
                <div className="chat-empty-state">
                  <MessageSquare size={32} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p>Ask anything about the document!</p>
                  <p style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '0.5rem' }}>I'm here to help analyze and answer questions</p>
                </div>
              )}
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`chat-message-bubble ${msg.role}`}>
                  <div className="chat-bubble-header">
                    <span className="chat-sender-badge">{msg.role === 'user' ? '👤 You' : '🤖 AI Assistant'}</span>
                  </div>
                  <div className="chat-bubble-content">{msg.content}</div>
                </div>
              ))}
              {chatLoading && (
                <div className="chat-message-bubble ai">
                  <div className="chat-bubble-header">
                    <span className="chat-sender-badge">🤖 AI Assistant</span>
                  </div>
                  <div className="chat-bubble-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-section">
              <div className="chat-input-group">
                <input 
                  type="text" 
                  className="chat-input"
                  placeholder="Ask a question about the document..." 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !chatLoading && handleChat()}
                  disabled={chatLoading}
                />
                <button 
                  className="chat-send-btn" 
                  onClick={handleChat}
                  disabled={chatLoading || !message.trim()}
                  title="Send message (Enter)"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ResultCard;
