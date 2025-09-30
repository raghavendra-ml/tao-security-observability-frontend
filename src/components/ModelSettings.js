import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const ModelSettings = () => {
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
      const response = await apiService.getModelSettings();
      setSettings(response.settings);
      setLastUpdated(response.last_updated);
      setError(null);
    } catch (error) {
      console.error('Error fetching model settings:', error);
      setError('Failed to load model settings');
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

      const response = await apiService.updateModelSettings(settings);
      setSuccessMessage('Model settings updated successfully!');
      setLastUpdated(response.updated_at);
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating model settings:', error);
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
          <p>Loading model settings...</p>
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
          <h1>🤖 Model Configuration</h1>
          <p>Configure ML model settings, retraining schedules, and performance thresholds</p>
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
          <h2>Training & Retraining</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.auto_retrain || false}
                  onChange={(e) => handleInputChange('auto_retrain', e.target.checked)}
                />
                <span className="checkmark"></span>
                Enable Auto-Retraining
              </label>
              <span className="setting-description">Automatically retrain models based on schedule</span>
            </div>

            <div className="setting-item">
              <label htmlFor="retrain_frequency">Retraining Frequency (days)</label>
              <input
                type="number"
                id="retrain_frequency"
                value={settings.retrain_frequency || 7}
                onChange={(e) => handleInputChange('retrain_frequency', parseInt(e.target.value))}
                min="1"
                max="365"
                disabled={!settings.auto_retrain}
              />
              <span className="setting-description">How often to retrain models automatically</span>
            </div>

            <div className="setting-item">
              <label htmlFor="cross_validation_folds">Cross-Validation Folds</label>
              <input
                type="number"
                id="cross_validation_folds"
                value={settings.cross_validation_folds || 5}
                onChange={(e) => handleInputChange('cross_validation_folds', parseInt(e.target.value))}
                min="3"
                max="10"
              />
              <span className="setting-description">Number of folds for model validation</span>
            </div>

            <div className="setting-item">
              <label htmlFor="feature_selection">Feature Selection</label>
              <select
                id="feature_selection"
                value={settings.feature_selection || 'auto'}
                onChange={(e) => handleInputChange('feature_selection', e.target.value)}
              >
                <option value="auto">Auto - Automatic feature selection</option>
                <option value="manual">Manual - Use predefined features</option>
                <option value="pca">PCA - Principal Component Analysis</option>
                <option value="recursive">Recursive - Recursive feature elimination</option>
              </select>
              <span className="setting-description">Method for selecting model features</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Performance Monitoring</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <label htmlFor="performance_threshold">Performance Threshold</label>
              <input
                type="number"
                id="performance_threshold"
                value={settings.performance_threshold || 0.85}
                onChange={(e) => handleInputChange('performance_threshold', parseFloat(e.target.value))}
                min="0.1"
                max="1.0"
                step="0.01"
              />
              <span className="setting-description">Minimum acceptable model performance (F1 score)</span>
            </div>

            <div className="setting-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.alert_on_drift || false}
                  onChange={(e) => handleInputChange('alert_on_drift', e.target.checked)}
                />
                <span className="checkmark"></span>
                Alert on Model Drift
              </label>
              <span className="setting-description">Send alerts when model performance degrades</span>
            </div>

            <div className="setting-item">
              <label htmlFor="max_anomaly_score">Maximum Anomaly Score</label>
              <input
                type="number"
                id="max_anomaly_score"
                value={settings.max_anomaly_score || 1.0}
                onChange={(e) => handleInputChange('max_anomaly_score', parseFloat(e.target.value))}
                min="0.1"
                max="10.0"
                step="0.1"
              />
              <span className="setting-description">Maximum allowed anomaly score for detection</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Processing Settings</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <label htmlFor="batch_size">Batch Size</label>
              <input
                type="number"
                id="batch_size"
                value={settings.batch_size || 1000}
                onChange={(e) => handleInputChange('batch_size', parseInt(e.target.value))}
                min="100"
                max="10000"
                step="100"
              />
              <span className="setting-description">Number of records to process in each batch</span>
            </div>
          </div>
        </div>

        <div className="model-performance-summary">
          <h3>Current Model Status</h3>
          <div className="performance-metrics">
            <div className="metric">
              <span className="metric-label">Auto-Retraining:</span>
              <span className={`metric-value ${settings.auto_retrain ? 'enabled' : 'disabled'}`}>
                {settings.auto_retrain ? '✅ Enabled' : '❌ Disabled'}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Performance Threshold:</span>
              <span className="metric-value">{(settings.performance_threshold || 0.85) * 100}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Drift Detection:</span>
              <span className={`metric-value ${settings.alert_on_drift ? 'enabled' : 'disabled'}`}>
                {settings.alert_on_drift ? '✅ Active' : '❌ Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="model-warning">
          <div className="warning-icon">⚠️</div>
          <div className="warning-content">
            <h3>Model Configuration Notice</h3>
            <p>Changes to model settings will affect all active ML models. Performance threshold changes may impact detection sensitivity. Auto-retraining requires sufficient historical data.</p>
          </div>
        </div>

        <div className="settings-actions">
          <button 
            className="save-settings-btn" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Model Settings'}
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

export default ModelSettings;

