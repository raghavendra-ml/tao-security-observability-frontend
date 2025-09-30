import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const SystemSettings = () => {
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
      const response = await apiService.getSystemSettings();
      setSettings(response.settings);
      setLastUpdated(response.last_updated);
      setError(null);
    } catch (error) {
      console.error('Error fetching system settings:', error);
      setError('Failed to load system settings');
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

      const response = await apiService.updateSystemSettings(settings);
      setSuccessMessage('Settings updated successfully!');
      setLastUpdated(response.updated_at);
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating system settings:', error);
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
          <p>Loading system settings...</p>
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
          <h1>⚙️ System Configuration</h1>
          <p>Configure system-wide settings and operational parameters</p>
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
          <h2>Performance Settings</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <label htmlFor="refresh_interval">Dashboard Refresh Interval (seconds)</label>
              <input
                type="number"
                id="refresh_interval"
                value={settings.refresh_interval || 30}
                onChange={(e) => handleInputChange('refresh_interval', parseInt(e.target.value))}
                min="5"
                max="300"
              />
              <span className="setting-description">How often the dashboard updates automatically</span>
            </div>

            <div className="setting-item">
              <label htmlFor="max_concurrent_scans">Max Concurrent Scans</label>
              <input
                type="number"
                id="max_concurrent_scans"
                value={settings.max_concurrent_scans || 10}
                onChange={(e) => handleInputChange('max_concurrent_scans', parseInt(e.target.value))}
                min="1"
                max="50"
              />
              <span className="setting-description">Maximum number of simultaneous security scans</span>
            </div>

            <div className="setting-item">
              <label htmlFor="api_timeout">API Timeout (seconds)</label>
              <input
                type="number"
                id="api_timeout"
                value={settings.api_timeout || 30}
                onChange={(e) => handleInputChange('api_timeout', parseInt(e.target.value))}
                min="10"
                max="120"
              />
              <span className="setting-description">Timeout for API requests</span>
            </div>

            <div className="setting-item">
              <label htmlFor="database_connection_pool">Database Connection Pool Size</label>
              <input
                type="number"
                id="database_connection_pool"
                value={settings.database_connection_pool || 10}
                onChange={(e) => handleInputChange('database_connection_pool', parseInt(e.target.value))}
                min="5"
                max="100"
              />
              <span className="setting-description">Number of database connections to maintain</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Data Management</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <label htmlFor="data_retention_days">Data Retention Period (days)</label>
              <input
                type="number"
                id="data_retention_days"
                value={settings.data_retention_days || 90}
                onChange={(e) => handleInputChange('data_retention_days', parseInt(e.target.value))}
                min="30"
                max="365"
              />
              <span className="setting-description">How long to keep historical data</span>
            </div>

            <div className="setting-item">
              <label htmlFor="cache_expiry">Cache Expiry (seconds)</label>
              <input
                type="number"
                id="cache_expiry"
                value={settings.cache_expiry || 300}
                onChange={(e) => handleInputChange('cache_expiry', parseInt(e.target.value))}
                min="60"
                max="3600"
              />
              <span className="setting-description">How long to cache frequently accessed data</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Logging & Debug</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <label htmlFor="log_level">Log Level</label>
              <select
                id="log_level"
                value={settings.log_level || 'INFO'}
                onChange={(e) => handleInputChange('log_level', e.target.value)}
              >
                <option value="DEBUG">DEBUG - Detailed diagnostic information</option>
                <option value="INFO">INFO - General informational messages</option>
                <option value="WARNING">WARNING - Warning messages only</option>
                <option value="ERROR">ERROR - Error messages only</option>
              </select>
              <span className="setting-description">Level of detail for system logs</span>
            </div>

            <div className="setting-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.enable_debug || false}
                  onChange={(e) => handleInputChange('enable_debug', e.target.checked)}
                />
                <span className="checkmark"></span>
                Enable Debug Mode
              </label>
              <span className="setting-description">Enable detailed debugging information (impacts performance)</span>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button 
            className="save-settings-btn" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
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

export default SystemSettings;

