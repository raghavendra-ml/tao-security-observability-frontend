import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HelpCircle, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Incidents', path: '/incidents' },
    { name: 'Anomalies', path: '/anomalies' },
    { name: 'Rules/Models', path: '/models' },
    { name: 'Runbooks', path: '/runbooks' },
    { name: 'Reports', path: '/reports' },
    { name: 'Observability', path: '/observability' },
    { name: 'User Behaviour', path: '/user-behaviour' },
    { name: 'Settings', path: '/settings', isIcon: true }
  ];

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to="/" className="logo-link">
            <img 
              src="/tao-digital-logo.png" 
              alt="TAO DIGITAL" 
              className="tao-logo-image"
              onError={(e) => {
                // Fallback to text if image fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span className="logo-text-fallback" style={{display: 'none'}}>TAO DIGITAL</span>
          </Link>
        </div>
        
        <nav className="nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.isIcon ? <Settings size={20} /> : item.name}
            </Link>
          ))}
        </nav>
        
        <div className="header-actions">
          <button className="help-button">
            <HelpCircle size={20} />
          </button>
          <div className="user-section">
            <span className="user-info">
              {user?.full_name || user?.username || 'User'}
            </span>
            <button className="logout-button" onClick={handleLogout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
