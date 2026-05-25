import { NavLink } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { Moon, Sun, BrainCircuit } from 'lucide-react';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar" style={{ position: 'sticky' }}>
      {/* LEFT CORNER: Logo */}
      <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
        <div style={{ background: 'var(--primary-gradient)', padding: '0.5rem', borderRadius: '10px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' }}>
          <BrainCircuit size={24} />
        </div>
        <span className="text-gradient" style={{ fontSize: '1.25rem', fontFamily: 'Outfit, sans-serif', fontWeight: '700' }}>Nexus AI</span>
      </div>

      {/* CENTER: Navigation Links */}
      <div className="nav-links" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flex: 1 }}>
        <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Workspace</NavLink>
        <NavLink to="/history" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Archive</NavLink>
        <NavLink to="/analytics" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Intelligence</NavLink>
      </div>

      {/* RIGHT CORNER: Theme Toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flex: 1 }}>
        <button 
          onClick={toggleTheme} 
          className="theme-toggle" 
          aria-label="Toggle Theme"
          style={{
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-color)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: 'var(--glass-shadow)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'rotate(15deg) scale(1.1)';
            e.currentTarget.style.borderColor = 'var(--primary-color)';
            e.currentTarget.style.color = 'var(--primary-color)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = 'var(--text-color)';
          }}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
