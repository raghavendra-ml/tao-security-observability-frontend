import React from 'react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();

  const settingCategories = [
    {
      id: 'system',
      title: 'System Configuration',
      description: 'Configure system-wide settings, performance parameters, and operational thresholds',
      features: [
        'Refresh intervals and timeouts',
        'Data retention policies', 
        'Performance optimization',
        'Logging and debug settings'
      ],
      icon: '⚙️',
      path: '/settings/system'
    },
    {
      id: 'security',
      title: 'Security Settings',
      description: 'Manage authentication, access controls, and security policies',
      features: [
        'Session management',
        'Multi-factor authentication',
        'IP restrictions and encryption',
        'Password and audit policies'
      ],
      icon: '🔒',
      path: '/settings/security'
    },
    {
      id: 'notifications',
      title: 'Notification Settings',
      description: 'Configure alert channels, thresholds, and escalation procedures',
      features: [
        'Email and webhook notifications',
        'Slack and Teams integration',
        'Alert threshold configuration',
        'Escalation and business hours'
      ],
      icon: '🔔',
      path: '/settings/notifications'
    },
    {
      id: 'models',
      title: 'Model Configuration',
      description: 'Configure ML model settings, retraining schedules, and performance thresholds',
      features: [
        'Auto-retraining schedules',
        'Performance thresholds',
        'Batch processing settings',
        'Model drift detection'
      ],
      icon: '🤖',
      path: '/settings/models'
    },
    {
      id: 'integrations',
      title: 'Integration Settings',
      description: 'Configure external integrations, SIEM connections, and data sources',
      features: [
        'SIEM and log source integration',
        'External threat feeds',
        'API configurations',
        'Backup and sync settings'
      ],
      icon: '🔗',
      path: '/settings/integrations'
    }
  ];

  const handleCategoryClick = (path) => {
    navigate(path);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>System Settings</h1>
        <p>Configure and manage system-wide settings, security policies, and integrations</p>
      </div>

      <div className="settings-tiles-grid">
        {settingCategories.map((category) => (
          <div key={category.id} className="settings-tile">
            <div className="settings-icon">{category.icon}</div>
            <div className="settings-info">
              <h3>{category.title}</h3>
              <p className="settings-description">{category.description}</p>
              <ul className="settings-features">
                {category.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            <button 
              className="configure-settings-btn"
              onClick={() => handleCategoryClick(category.path)}
            >
              Configure Settings
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;

