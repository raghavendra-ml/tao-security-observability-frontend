import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const IntegrationSettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getIntegrationSettings();
      setSettings(response.settings);
      setLastUpdated(response.last_updated);
      setError(null);
    } catch (error) {
      console.error('Error fetching integration settings:', error);
      setError('Failed to load integration settings');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = (integration) => {
    // Simulate connection test
    alert(`Testing connection to ${integration}...`);
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="settings-loading">
          <div className="loading-spinner"></div>
          <p>Loading integration settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <button className="back-btn" onClick={() => navigate('/settings')}>
          ← Back to Settings
        </button>
        <div className="settings-title-section">
          <h1>🔗 Integration Settings</h1>
          <p>Configure external integrations, SIEM connections, and data sources</p>
          {lastUpdated && (
            <div className="settings-timestamp">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="settings-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="settings-form">
        <div className="settings-section">
          <h2>SIEM Integration</h2>
          <div className="integration-card">
            <div className="integration-header">
              <h3>Security Information & Event Management</h3>
              <div className={`status-indicator ${settings.siem_enabled ? 'connected' : 'disconnected'}`}>
                {settings.siem_enabled ? '🟢 Connected' : '🔴 Disconnected'}
              </div>
            </div>
            <div className="integration-details">
              <div className="detail-item">
                <span className="label">Endpoint:</span>
                <span className="value">{settings.siem_endpoint || 'Not configured'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Status:</span>
                <span className="value">{settings.siem_enabled ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Last Sync:</span>
                <span className="value">2 minutes ago</span>
              </div>
            </div>
            <div className="integration-actions">
              <button 
                className="test-connection-btn"
                onClick={() => testConnection('SIEM')}
                disabled={!settings.siem_enabled}
              >
                Test Connection
              </button>
              <button className="configure-integration-btn">
                Configure SIEM
              </button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Log Sources</h2>
          <div className="log-sources-grid">
            {(settings.log_sources || []).map((source, index) => (
              <div key={index} className="log-source-card">
                <div className="source-icon">
                  {source === 'Windows Event Log' && '🪟'}
                  {source === 'Syslog' && '📋'}
                  {source === 'Cloud Trail' && '☁️'}
                  {!['Windows Event Log', 'Syslog', 'Cloud Trail'].includes(source) && '📊'}
                </div>
                <div className="source-info">
                  <h4>{source}</h4>
                  <span className="source-status">🟢 Active</span>
                </div>
                <button 
                  className="configure-source-btn"
                  onClick={() => testConnection(source)}
                >
                  Configure
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <h2>External Threat Feeds</h2>
          <div className="threat-feeds-grid">
            {(settings.external_feeds || []).map((feed, index) => (
              <div key={index} className="threat-feed-card">
                <div className="feed-icon">
                  {feed === 'MITRE ATT&CK' && '⚔️'}
                  {feed === 'Threat Intel' && '🛡️'}
                  {!['MITRE ATT&CK', 'Threat Intel'].includes(feed) && '🔍'}
                </div>
                <div className="feed-info">
                  <h4>{feed}</h4>
                  <span className="feed-status">🟢 Active</span>
                  <span className="last-update">Updated 1 hour ago</span>
                </div>
                <button 
                  className="refresh-feed-btn"
                  onClick={() => testConnection(feed)}
                >
                  Refresh Feed
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <h2>System Integration</h2>
          <div className="system-settings-grid">
            <div className="setting-item">
              <label>API Key Expiry (days)</label>
              <div className="setting-value">{settings.api_key_expiry || 365} days</div>
              <span className="setting-description">How long API keys remain valid</span>
            </div>

            <div className="setting-item">
              <label>Webhook Timeout</label>
              <div className="setting-value">{settings.webhook_timeout || 30} seconds</div>
              <span className="setting-description">Timeout for webhook requests</span>
            </div>

            <div className="setting-item">
              <label>Sync Frequency</label>
              <div className="setting-value">{settings.sync_frequency || 60} minutes</div>
              <span className="setting-description">How often to sync with external systems</span>
            </div>

            <div className="setting-item">
              <label>Backup Location</label>
              <div className="setting-value">{settings.backup_location || 'Not configured'}</div>
              <span className="setting-description">Location for system backups</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Integration Health</h2>
          <div className="health-dashboard">
            <div className="health-metric">
              <div className="metric-icon">📊</div>
              <div className="metric-info">
                <h4>Data Ingestion Rate</h4>
                <span className="metric-value">1,245 events/min</span>
              </div>
              <div className="health-status good">🟢</div>
            </div>

            <div className="health-metric">
              <div className="metric-icon">🔄</div>
              <div className="metric-info">
                <h4>Sync Status</h4>
                <span className="metric-value">All systems synchronized</span>
              </div>
              <div className="health-status good">🟢</div>
            </div>

            <div className="health-metric">
              <div className="metric-icon">⚡</div>
              <div className="metric-info">
                <h4>API Response Time</h4>
                <span className="metric-value">142ms average</span>
              </div>
              <div className="health-status good">🟢</div>
            </div>

            <div className="health-metric">
              <div className="metric-icon">💾</div>
              <div className="metric-info">
                <h4>Storage Usage</h4>
                <span className="metric-value">67% of allocated space</span>
              </div>
              <div className="health-status warning">🟡</div>
            </div>
          </div>
        </div>

        <div className="integration-warning">
          <div className="warning-icon">ℹ️</div>
          <div className="warning-content">
            <h3>Integration Status</h3>
            <p>Integration settings are read-only in this view. Use the individual integration configuration pages to modify connection settings and credentials.</p>
          </div>
        </div>

        <div className="settings-actions">
          <button 
            className="refresh-settings-btn" 
            onClick={fetchSettings}
          >
            Refresh Status
          </button>
          <button 
            className="cancel-settings-btn" 
            onClick={() => navigate('/settings')}
          >
            Back to Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationSettings;

