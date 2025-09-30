import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { apiService } from '../services/api';

const EditModel = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    model_name: '',
    description: '',
    model_type: 'Anomaly Detection',
    source_data: 'Cisco ASA Logs',
    detection_category: 'VPN',
    time_window: '1 hour',
    threshold: '0.75',
    sensitivity: 0.5,
    notify_on: 'score > 0.75',
    linked_runbook: 'Data Exfil Playbook',
    status: 'Enabled'
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchModelData();
  }, [id]);

  const fetchModelData = async () => {
    try {
      setInitialLoading(true);
      
      // Convert URL slug back to model name - handle both dashed and non-dashed slugs
      let modelName;
      
      if (id.includes('-')) {
        // Handle dashed slugs like "data-exfiltration-ml" -> "Data Exfiltration ML"
        modelName = id.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      } else {
        // Handle non-dashed slugs like "dataexfilmodel" -> try various approaches
        // First try direct database lookup with exact slug
        try {
          const directData = await apiService.getModelByName(id);
          if (directData && directData.model_name) {
            setFormData({
              model_name: directData.model_name || '',
              description: directData.description || '',
              model_type: directData.model_type || 'Anomaly Detection',
              source_data: directData.source_data || 'Cisco ASA Logs',
              detection_category: directData.detection_category || 'VPN',
              time_window: directData.time_window || '1 hour',
              threshold: directData.threshold ? directData.threshold.toString() : '0.75',
              sensitivity: directData.sensitivity || 0.5,
              notify_on: directData.notify_on || 'score > 0.75',
              linked_runbook: directData.linked_runbook || 'Data Exfil Playbook',
              status: directData.status || 'Enabled'
            });
            setInitialLoading(false);
            return;
          }
        } catch (e) {
          // Continue to other methods if direct lookup fails
        }
        
        // Try common database model name patterns
        const possibleNames = [
          id, // exact slug
          id.charAt(0).toUpperCase() + id.slice(1), // Capitalize first letter
          // Try to split camelCase/PascalCase: "dataexfilmodel" -> "Data Exfil Model"
          id.replace(/([a-z])([A-Z])/g, '$1 $2')
             .split(' ')
             .map(word => word.charAt(0).toUpperCase() + word.slice(1))
             .join(' '),
          // Try known patterns
          id === 'dataexfilmodel' ? 'DataExfilModel' : null,
          id === 'bruteforcedetector' ? 'BruteForceDetector' : null,
          id === 'authrejectmodel' ? 'AuthRejectModel' : null,
          id === 'vpnspikedetector' ? 'VPNSpikeDetector' : null,
          id === 'lockoutalertmodel' ? 'LockoutAlertModel' : null,
          id === 'policychangetracker' ? 'PolicyChangeTracker' : null,
          id === 'accountcreationwatcher' ? 'AccountCreationWatcher' : null
        ].filter(name => name !== null);
        
        // Try each possible name
        for (const name of possibleNames) {
          try {
            const testData = await apiService.getModelByName(name);
            if (testData && testData.model_name) {
              modelName = name;
              break;
            }
          } catch (e) {
            // Continue trying other names
          }
        }
        
        // If nothing works, use the slug as is and let the backend handle it
        if (!modelName) {
          modelName = id;
        }
      }
      
      const modelData = await apiService.getModelByName(modelName);
      setFormData({
        model_name: modelData.model_name || '',
        description: modelData.description || '',
        model_type: modelData.model_type || 'Anomaly Detection',
        source_data: modelData.source_data || 'Cisco ASA Logs',
        detection_category: modelData.detection_category || 'VPN',
        time_window: modelData.time_window || '1 hour',
        threshold: modelData.threshold ? modelData.threshold.toString() : '0.75',
        sensitivity: modelData.sensitivity || 0.5,
        notify_on: modelData.notify_on || 'score > 0.75',
        linked_runbook: modelData.linked_runbook || 'Data Exfil Playbook',
        status: modelData.status || 'Enabled'
      });
    } catch (error) {
      console.error('Error fetching model data:', error);
      // Convert URL slug back to model name for fallback
      const modelName = id.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      // Provide basic fallback data based on the model name in URL
      setFormData({
        model_name: modelName,
        description: 'Model data could not be loaded from server',
        model_type: 'Anomaly Detection',
        source_data: 'Cisco ASA Logs',
        detection_category: 'VPN',
        time_window: '1 hour',
        threshold: '0.75',
        sensitivity: 0.6,
        notify_on: 'score > 0.75',
        linked_runbook: 'Data Exfiltration Playbook',
        status: 'Enabled'
      });
    } finally {
      setInitialLoading(false);
    }
  };

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

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert form data to match API expectations
      const apiFormData = {
        ...formData,
        threshold: parseFloat(formData.threshold),
        sensitivity: parseFloat(formData.sensitivity)
      };
      
      // Call API to save changes
      await apiService.updateModel(apiFormData);
      
      alert('Model updated successfully!');
      navigate('/models');
    } catch (error) {
      console.error('Error saving model changes:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Error saving changes. Please try again.';
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

  const handleDisableModel = async () => {
    const confirmed = window.confirm('Are you sure you want to disable this model?');
    if (!confirmed) return;

    try {
      setLoading(true);
      // Call API to disable model
      console.log('Disabling model:', formData.model_name);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/models');
    } catch (error) {
      console.error('Error disabling model:', error);
      alert('Error disabling model. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrainingDataAction = () => {
    alert('Training data management functionality would be implemented here');
  };

  const handleCancel = () => {
    navigate('/models');
  };

  if (initialLoading) {
    return (
      <div className="add-model-modal">
        <div className="modal-content">
          <div className="loading">Loading model data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-model-modal">
      <div className="modal-overlay" onClick={handleCancel}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Model: {formData.model_name}</h2>
          <button onClick={handleCancel} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSaveChanges} className="model-form">
          {/* Model Name */}
          <div className="form-group">
            <label htmlFor="model_name">Model Name</label>
            <input
              type="text"
              id="model_name"
              name="model_name"
              value={formData.model_name}
              onChange={handleInputChange}
              required
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

          {/* Model Type and Data Source Row */}
          <div className="form-row">
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
          </div>

          {/* Detection Category and Time Window Row */}
          <div className="form-row">
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

            <div className="form-group">
              <label htmlFor="time_window">Time Window</label>
              <select
                id="time_window"
                name="time_window"
                value={formData.time_window}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="15 min">15 min</option>
                <option value="30 min">30 min</option>
                <option value="1 hour">1 hour</option>
                <option value="2 hours">2 hours</option>
                <option value="6 hours">6 hours</option>
              </select>
            </div>
          </div>

          {/* Training Data */}
          <div className="form-group">
            <label>Training Data</label>
            <button
              type="button"
              onClick={handleTrainingDataAction}
              className="training-data-btn"
            >
              View / Upload / Change
            </button>
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
            <input
              type="text"
              id="notify_on"
              name="notify_on"
              value={formData.notify_on}
              onChange={handleInputChange}
              className="form-input"
              readOnly
            />
          </div>

          {/* Linked Runbook */}
          <div className="form-group">
            <label htmlFor="linked_runbook">Linked Runbook</label>
            <select
              id="linked_runbook"
              name="linked_runbook"
              value={formData.linked_runbook}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="Data Exfil Playbook">Data Exfil Playbook</option>
              <option value="Authentication Playbook">Authentication Playbook</option>
              <option value="VPN Incident Playbook">VPN Incident Playbook</option>
            </select>
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
              className="save-changes-btn"
              disabled={loading || !formData.model_name.trim()}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            
            <button
              type="button"
              onClick={handleDisableModel}
              className="disable-btn"
              disabled={loading}
            >
              Disable
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModel;
