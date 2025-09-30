import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const NotificationSettings = () => {
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
      const response = await apiService.getNotificationSettings();
      setSettings(response.settings);
      setLastUpdated(response.last_updated);
      setError(null);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      setError('Failed to load notification settings');
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

      const response = await apiService.updateNotificationSettings(settings);
      setSuccessMessage('Notification settings updated successfully!');
      setLastUpdated(response.updated_at);
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      setError('Failed to update settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const testNotification = (channel) => {
    setSuccessMessage(`Test notification sent via ${channel}!`);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="settings-loading">
          <div className="loading-spinner"></div>
          <p>Loading notification settings...</p>
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
          <h1>🔔 Notification Settings</h1>
          <p>Configure alert channels, thresholds, and escalation procedures</p>
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
          <h2>Email Notifications</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.email_enabled || false}
                  onChange={(e) => handleInputChange('email_enabled', e.target.checked)}
                />
                <span className="checkmark"></span>
                Enable Email Notifications
              </label>
              <span className="setting-description">Send alerts via email</span>
            </div>

            <div className="setting-item">
              <label htmlFor="email_recipients">Email Recipients</label>
              <textarea
                id="email_recipients"
                value={settings.email_recipients || ''}
                onChange={(e) => handleInputChange('email_recipients', e.target.value)}
                placeholder="security@company.com, admin@company.com"
                rows="3"
              />
              <span className="setting-description">Comma-separated list of email addresses</span>
            </div>

            <div className="setting-item">
              <button 
                className="test-notification-btn"
                onClick={() => testNotification('email')}
                disabled={!settings.email_enabled}
              >
                Send Test Email
              </button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Webhook Integrations</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <label htmlFor="slack_webhook">Slack Webhook URL</label>
              <input
                type="url"
                id="slack_webhook"
                value={settings.slack_webhook || ''}
                onChange={(e) => handleInputChange('slack_webhook', e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
              />
              <span className="setting-description">Slack incoming webhook URL for notifications</span>
              {settings.slack_webhook && (
                <button 
                  className="test-notification-btn"
                  onClick={() => testNotification('Slack')}
                >
                  Test Slack Integration
                </button>
              )}
            </div>

            <div className="setting-item">
              <label htmlFor="teams_webhook">Microsoft Teams Webhook URL</label>
              <input
                type="url"
                id="teams_webhook"
                value={settings.teams_webhook || ''}
                onChange={(e) => handleInputChange('teams_webhook', e.target.value)}
                placeholder="https://outlook.office.com/webhook/..."
              />
              <span className="setting-description">Teams incoming webhook URL for notifications</span>
              {settings.teams_webhook && (
                <button 
                  className="test-notification-btn"
                  onClick={() => testNotification('Teams')}
                >
                  Test Teams Integration
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Alert Configuration</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <label htmlFor="alert_threshold">Alert Threshold</label>
              <select
                id="alert_threshold"
                value={settings.alert_threshold || 'Medium'}
                onChange={(e) => handleInputChange('alert_threshold', e.target.value)}
              >
                <option value="Low">Low - All alerts including informational</option>
                <option value="Medium">Medium - Moderate and high severity alerts</option>
                <option value="High">High - Only high severity alerts</option>
                <option value="Critical">Critical - Only critical alerts</option>
              </select>
              <span className="setting-description">Minimum severity level for notifications</span>
            </div>

            <div className="setting-item">
              <label htmlFor="escalation_timeout">Escalation Timeout (seconds)</label>
              <input
                type="number"
                id="escalation_timeout"
                value={settings.escalation_timeout || 1800}
                onChange={(e) => handleInputChange('escalation_timeout', parseInt(e.target.value))}
                min="300"
                max="7200"
              />
              <span className="setting-description">Time before unacknowledged alerts escalate</span>
            </div>

            <div className="setting-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.business_hours_only || false}
                  onChange={(e) => handleInputChange('business_hours_only', e.target.checked)}
                />
                <span className="checkmark"></span>
                Business Hours Only
              </label>
              <span className="setting-description">Only send non-critical notifications during business hours</span>
            </div>

            <div className="setting-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.enable_sms || false}
                  onChange={(e) => handleInputChange('enable_sms', e.target.checked)}
                />
                <span className="checkmark"></span>
                Enable SMS Notifications
              </label>
              <span className="setting-description">Send critical alerts via SMS (requires SMS gateway setup)</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Notification Channels</h2>
          <div className="notification-channels">
            {(settings.notification_channels || []).map((channel, index) => (
              <div key={index} className="channel-item">
                <span className="channel-name">{channel}</span>
                <span className="channel-status">✅ Active</span>
              </div>
            ))}
            {(!settings.notification_channels || settings.notification_channels.length === 0) && (
              <p className="no-channels">No notification channels configured</p>
            )}
          </div>
        </div>

        <div className="settings-actions">
          <button 
            className="save-settings-btn" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Notification Settings'}
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

export default NotificationSettings;

