import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { apiService } from '../services/api';

const AddModel = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    model_name: '',
    description: '',
    model_type: 'Anomaly Detection',
    source_data: 'Cisco ASA Logs',
    detection_category: 'VPN',
    time_window: '1hr',
    threshold: '0.70',
    sensitivity: 0.5,
    notify_on: 'score > 0.70',
    linked_runbook: '',
    status: 'Enabled'
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' || type === 'range' ? parseFloat(value) : value
    }));
  };

  const handleThresholdChange = (value) => {
    setFormData(prev => ({
      ...prev,
      threshold: value,
      notify_on: `score > ${value}`
    }));
  };

  const handleTestModel = () => {
    console.log('Testing model:', formData);
    alert('Model test functionality would be implemented here');
  };

  const handleSaveAndDeploy = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call API to save and deploy the model
      await apiService.createModel(formData);
      
      alert('Model saved and deployed successfully!');
      navigate('/models');
    } catch (error) {
      console.error('Error saving model:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Error saving model. Please try again.';
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };



  const handleCancel = () => {
    navigate('/models');
  };

  return (
    <div className="add-model-modal">
      <div className="modal-overlay" onClick={handleCancel}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add Model</h2>
          <button onClick={handleCancel} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSaveAndDeploy} className="model-form">
          {/* Model Name */}
          <div className="form-group">
            <label htmlFor="model_name">
              Model Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="model_name"
              name="model_name"
              value={formData.model_name}
              onChange={handleInputChange}
              required
              placeholder="Unusual VPN Behavior"
              className="form-input"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Optional"
              className="form-input"
            />
          </div>

          {/* Model Type */}
          <div className="form-group">
            <label htmlFor="model_type">Model Type</label>
            <select
              id="model_type"
              name="model_type"
              value={formData.model_type}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="Anomaly Detection">Anomaly Detection</option>
              <option value="Correlation">Correlation</option>
              <option value="Classifier">Classifier</option>
            </select>
          </div>

          {/* Data Source and Detection Category Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="source_data">Data Source</label>
              <select
                id="source_data"
                name="source_data"
                value={formData.source_data}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="Cisco ASA Logs">Cisco ASA Logs</option>
                <option value="Windows Event Logs">Windows Event Logs</option>
                <option value="Network Traffic">Network Traffic</option>
                <option value="Application Logs">Application Logs</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="detection_category">Detection Category</label>
              <select
                id="detection_category"
                name="detection_category"
                value={formData.detection_category}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="VPN">VPN</option>
                <option value="Authentication">Authentication</option>
                <option value="Data Exfiltration">Data Exfiltration</option>
                <option value="Lateral Movement">Lateral Movement</option>
              </select>
            </div>
          </div>

          {/* Time Window */}
          <div className="form-group">
            <label htmlFor="time_window">Time Window</label>
            <select
              id="time_window"
              name="time_window"
              value={formData.time_window}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="5min">5 minutes</option>
              <option value="15min">15 minutes</option>
              <option value="30min">30 minutes</option>
              <option value="1hr">1 hour</option>
              <option value="2hr">2 hours</option>
              <option value="6hr">6 hours</option>
              <option value="24hr">24 hours</option>
            </select>
          </div>

          {/* Threshold and Sensitivity Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="threshold">Threshold</label>
              <input
                type="number"
                id="threshold"
                name="threshold"
                value={formData.threshold}
                onChange={(e) => {
                  handleInputChange(e);
                  handleThresholdChange(e.target.value);
                }}
                step="0.01"
                min="0"
                max="1"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sensitivity">Sensitivity</label>
              <div className="sensitivity-container">
                <input
                  type="range"
                  id="sensitivity"
                  name="sensitivity"
                  value={formData.sensitivity}
                  onChange={handleInputChange}
                  min="0"
                  max="1"
                  step="0.1"
                  className="sensitivity-slider"
                />
                <div className="sensitivity-labels">
                  <span>0</span>
                  <span>1</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notify On */}
          <div className="form-group">
            <label htmlFor="notify_on">Notify On</label>
            <select
              id="notify_on"
              name="notify_on"
              value={formData.notify_on}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value={`score > ${formData.threshold}`}>score &gt; {formData.threshold}</option>
              <option value={`score >= ${formData.threshold}`}>score &gt;= {formData.threshold}</option>
              <option value={`score < ${formData.threshold}`}>score &lt; {formData.threshold}</option>
            </select>
          </div>

          {/* Linked Runbook */}
          <div className="form-group">
            <label htmlFor="linked_runbook">Linked Runbook</label>
            <input
              type="text"
              id="linked_runbook"
              name="linked_runbook"
              value={formData.linked_runbook}
              onChange={handleInputChange}
              placeholder="Data Exfiltration Playbook"
              className="form-input"
            />
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleTestModel}
              className="test-btn"
              disabled={loading}
            >
              Test Model
            </button>
            
            <button
              type="submit"
              className="save-deploy-btn"
              disabled={loading || !formData.model_name.trim()}
            >
              {loading ? 'Saving...' : 'Save & Deploy'}
            </button>
            
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddModel;
