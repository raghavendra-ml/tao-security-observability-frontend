import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const SecuritySettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSecuritySettings();
      setSettings(response.settings);
      setLastUpdated(response.last_updated);
      setError(null);
    } catch (error) {
      console.error('Error fetching security settings:', error);
      setError('Failed to load security settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage('');

      const response = await apiService.updateSecuritySettings(settings);
      setSuccessMessage('Security settings updated successfully!');
      setLastUpdated(response.updated_at);
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating security settings:', error);
      setError('Failed to update settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="settings-loading">
          <div className="loading-spinner"></div>
          <p>Loading security settings...</p>
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
          <h1>🔒 Security Configuration</h1>
          <p>Manage authentication, access controls, and security policies</p>
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

      {successMessage && (
        <div className="settings-success">
          <span className="success-icon">✅</span>
          <span>{successMessage}</span>
        </div>
      )}

      <div className="settings-form">
        <div className="settings-section">
          <h2>Authentication Settings</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <label htmlFor="session_timeout">Session Timeout (seconds)</label>
              <input
                type="number"
                id="session_timeout"
                value={settings.session_timeout || 3600}
                onChange={(e) => handleInputChange('session_timeout', parseInt(e.target.value))}
                min="300"
                max="86400"
              />
              <span className="setting-description">How long before user sessions expire</span>
            </div>

            <div className="setting-item">
              <label htmlFor="max_login_attempts">Max Login Attempts</label>
              <input
                type="number"
                id="max_login_attempts"
                value={settings.max_login_attempts || 5}
                onChange={(e) => handleInputChange('max_login_attempts', parseInt(e.target.value))}
                min="3"
                max="10"
              />
              <span className="setting-description">Maximum failed login attempts before lockout</span>
            </div>

            <div className="setting-item">
              <label htmlFor="failed_login_lockout">Lockout Duration (seconds)</label>
              <input
                type="number"
                id="failed_login_lockout"
                value={settings.failed_login_lockout || 900}
                onChange={(e) => handleInputChange('failed_login_lockout', parseInt(e.target.value))}
                min="300"
                max="3600"
              />
              <span className="setting-description">How long to lock accounts after failed attempts</span>
            </div>

            <div className="setting-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.enable_mfa || false}
                  onChange={(e) => handleInputChange('enable_mfa', e.target.checked)}
                />
                <span className="checkmark"></span>
                Enable Multi-Factor Authentication
              </label>
              <span className="setting-description">Require additional authentication factors for login</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Password Policy</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <label htmlFor="password_expiry_days">Password Expiry (days)</label>
              <input
                type="number"
                id="password_expiry_days"
                value={settings.password_expiry_days || 90}
                onChange={(e) => handleInputChange('password_expiry_days', parseInt(e.target.value))}
                min="30"
                max="365"
              />
              <span className="setting-description">How often users must change passwords</span>
            </div>

            <div className="setting-item">
              <label htmlFor="encryption_level">Encryption Level</label>
              <select
                id="encryption_level"
                value={settings.encryption_level || 'AES-256'}
                onChange={(e) => handleInputChange('encryption_level', e.target.value)}
              >
                <option value="AES-128">AES-128 - Standard encryption</option>
                <option value="AES-256">AES-256 - High security encryption</option>
                <option value="AES-512">AES-512 - Maximum security encryption</option>
              </select>
              <span className="setting-description">Encryption standard for sensitive data</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Access Control</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <label htmlFor="allowed_ip_ranges">Allowed IP Ranges</label>
              <textarea
                id="allowed_ip_ranges"
                value={settings.allowed_ip_ranges || '0.0.0.0/0'}
                onChange={(e) => handleInputChange('allowed_ip_ranges', e.target.value)}
                placeholder="0.0.0.0/0 (allow all) or specific IP ranges like 192.168.1.0/24"
                rows="3"
              />
              <span className="setting-description">IP address ranges allowed to access the system</span>
            </div>

            <div className="setting-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.audit_logging || false}
                  onChange={(e) => handleInputChange('audit_logging', e.target.checked)}
                />
                <span className="checkmark"></span>
                Enable Audit Logging
              </label>
              <span className="setting-description">Log all security-related events and user actions</span>
            </div>
          </div>
        </div>

        <div className="security-warning">
          <div className="warning-icon">⚠️</div>
          <div className="warning-content">
            <h3>Security Notice</h3>
            <p>Changes to security settings will affect all users. Please ensure you understand the implications before applying changes. Some settings may require users to re-authenticate.</p>
          </div>
        </div>

        <div className="settings-actions">
          <button 
            className="save-settings-btn" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Security Settings'}
          </button>
          <button 
            className="cancel-settings-btn" 
            onClick={() => navigate('/settings')}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;

