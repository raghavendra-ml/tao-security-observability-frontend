import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Get all incidents with optional filtering
  getIncidents: async (severity = 'All', anomalyType = 'All', anomalySubtype = 'All') => {
    try {
      const params = {
        severity: severity,
        anomaly_type: anomalyType,
        anomaly_subtype: anomalySubtype
      };
      const response = await api.get('/incidents', { params });
      return response.data.incidents;
    } catch (error) {
      console.error('Error fetching incidents:', error);
      throw error;
    }
  },

  // Get incidents summary for dashboard stats
  getIncidentsSummary: async () => {
    try {
      const response = await api.get('/incidents/summary');
      return response.data.summary;
    } catch (error) {
      console.error('Error fetching incidents summary:', error);
      throw error;
    }
  },

  // Get specific incident by ID
  getIncidentDetail: async (incidentId) => {
    try {
      const response = await api.get(`/incidents/${incidentId}`);
      return response.data.incident;
    } catch (error) {
      console.error('Error fetching incident detail:', error);
      throw error;
    }
  },

  // Mark incident as False Positive or True Positive
  markIncidentFpTp: async (incidentId, classification) => {
    try {
      const response = await api.put(`/incidents/${incidentId}/mark_fp_tp?classification=${classification}`);
      return response.data;
    } catch (error) {
      console.error('Error marking incident:', error);
      throw error;
    }
  },

  // Update incident severity
  updateIncidentSeverity: async (incidentId, newSeverity) => {
    try {
      const response = await api.put(`/incidents/${incidentId}/severity?new_severity=${encodeURIComponent(newSeverity)}`);
      return response.data;
    } catch (error) {
      console.error('Error updating incident severity:', error);
      throw error;
    }
  },

  // Assign incident to analyst
  assignIncident: async (incidentId, assignee) => {
    try {
      const response = await api.put(`/incidents/${incidentId}/assign?assignee=${encodeURIComponent(assignee)}`);
      return response.data;
    } catch (error) {
      console.error('Error assigning incident:', error);
      throw error;
    }
  },

  // Get correlated anomalies for incident
  getIncidentAnomalies: async (incidentId) => {
    try {
      console.log(`[DEBUG API] Fetching anomalies for incident: ${incidentId}`);
      const response = await api.get(`/incidents/${incidentId}/anomalies`);
      console.log('[DEBUG API] Full response:', response);
      console.log('[DEBUG API] Response.data:', response.data);
      return response.data; // Return full response, not just anomalies array
    } catch (error) {
      console.error('Error fetching incident anomalies:', error);
      throw error;
    }
  },

  // Get incident severity counts
  getSeverityCounts: async () => {
    try {
      const response = await api.get('/incident/severity_counts');
      return response.data.severity_counts;
    } catch (error) {
      console.error('Error fetching severity counts:', error);
      throw error;
    }
  },

  // Get anomaly subtype distribution
  getAnomalySubtypeDistribution: async () => {
    try {
      const response = await api.get('/anomalies/subtype_distribution');
      return response.data.subtype_distribution;
    } catch (error) {
      console.error('Error fetching anomaly subtype distribution:', error);
      throw error;
    }
  },

  // Get incident summary for chat
  getIncidentsSummary: async () => {
    try {
      const response = await api.get('/incidents/summary');
      return response.data.summary;
    } catch (error) {
      console.error('Error fetching incidents summary:', error);
      throw error;
    }
  },



  // Get model information
  getModels: async () => {
    try {
      const response = await api.get('/model');
      return response.data.models;
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  },

  // Get specific model by name
  getModelByName: async (modelName) => {
    try {
      const response = await api.get(`/model/${encodeURIComponent(modelName)}`);
      return response.data.model;
    } catch (error) {
      console.error('Error fetching model:', error);
      throw error;
    }
  },

  // Create new model
  createModel: async (modelData) => {
    try {
      const response = await api.post('/model/add', modelData);
      return response.data;
    } catch (error) {
      console.error('Error creating model:', error);
      throw error;
    }
  },

  // Update existing model
  updateModel: async (modelData) => {
    try {
      const response = await api.put('/model/update', modelData);
      return response.data;
    } catch (error) {
      console.error('Error updating model:', error);
      throw error;
    }
  },

  // Send chat message
  sendChatMessage: async (message, sessionId = null) => {
    try {
      const payload = { 
        message,
        session_id: sessionId
      };
      console.log('[API] Sending chat message with session ID:', payload);
      const response = await api.post('/chat', payload);
      console.log('[API] Chat response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  },

  // Get all runbooks
  getAllRunbooks: async () => {
    try {
      const response = await api.get('/runbook/all');
      return response.data.runbooks || [];
    } catch (error) {
      console.error('Error fetching runbooks:', error);
      throw error;
    }
  },

  // Get runbook by name
  getRunbookByName: async (name) => {
    try {
      const response = await api.get(`/runbook/${encodeURIComponent(name)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching runbook by name:', error);
      throw error;
    }
  },

  // Create new runbook
  createRunbook: async (runbookData) => {
    try {
      const response = await api.post('/runbook/add', runbookData);
      return response.data;
    } catch (error) {
      console.error('Error creating runbook:', error);
      throw error;
    }
  },

  // Find similar runbooks using vector similarity search
  findSimilarRunbooks: async (query, limit = 5) => {
    try {
      const response = await api.post('/runbook/find-similar', {
        query: query,
        limit: limit
      });
      return response.data;
    } catch (error) {
      console.error('Error finding similar runbooks:', error);
      throw error;
    }
  },

  // Get runbook details by name
  getRunbookDetail: async (name) => {
    try {
      const response = await api.get(`/runbook/${encodeURIComponent(name)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching runbook detail:', error);
      throw error;
    }
  },

  // Get all anomalies
  getAllAnomalies: async () => {
    try {
      const response = await api.get('/anomalies');
      return response.data.anomalies || [];
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      if (error.response && error.response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment before retrying.');
      }
      throw error;
    }
  },

  // Get anomaly details by ID
  getAnomalyDetail: async (anomalyId) => {
    try {
      const response = await api.get(`/anomalies/${anomalyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching anomaly detail:', error);
      throw error;
    }
  },

  // Update anomalies false positive status
  updateAnomaliesFalsePositive: async (anomalyIds, isFalsePositive = true) => {
    try {
      const response = await api.put('/anomalies/false-positive', {
        anomaly_ids: anomalyIds,
        is_false_positive: isFalsePositive
      });
      return response.data;
    } catch (error) {
      console.error('Error updating false positive status:', error);
      throw error;
    }
  },

  // Update anomalies severity
  updateAnomaliesSeverity: async (anomalyIds, severity) => {
    try {
      const response = await api.put('/anomalies/severity', {
        anomaly_ids: anomalyIds,
        severity: severity
      });
      return response.data;
    } catch (error) {
      console.error('Error updating severity:', error);
      throw error;
    }
  },

  // Update anomalies status
  updateAnomaliesStatus: async (anomalyIds, status) => {
    try {
      const response = await api.put('/anomalies/status', {
        anomaly_ids: anomalyIds,
        status: status
      });
      return response.data;
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  },

  // Save analyst notes
  saveAnomaliesAnalystNotes: async (notes) => {
    try {
      const response = await api.post('/anomalies/analyst-notes', {
        notes: notes
      });
      return response.data;
    } catch (error) {
      console.error('Error saving analyst notes:', error);
      throw error;
    }
  },

  // Get suggested runbooks for an incident
  getSuggestedRunbooks: async (incidentId) => {
    try {
      const response = await api.get(`/runbooks/suggest/${incidentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching suggested runbooks:', error);
      throw error;
    }
  },

  // Get detailed anomaly information
  getAnomalyDetails: async (anomalyId) => {
    try {
      const response = await api.get(`/anomalies/${anomalyId}/details`);
      return response.data.anomaly;
    } catch (error) {
      console.error('Error fetching anomaly details:', error);
      throw error;
    }
  },

  // Save incident analyst notes
  saveIncidentNotes: async (incidentId, notes) => {
    try {
      const response = await api.post(`/incidents/${incidentId}/notes`, { notes });
      return response.data;
    } catch (error) {
      console.error('Error saving incident notes:', error);
      throw error;
    }
  },

  // Get suggested runbooks for an incident
  getSuggestedRunbooks: async (incidentId) => {
    try {
      const response = await api.get(`/incidents/${incidentId}/suggested-runbooks`);
      return response.data.runbooks;
    } catch (error) {
      console.error('Error fetching suggested runbooks:', error);
      throw error;
    }
  },

  // Get root endpoint (health check)
  getHealth: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  },

  // Reports endpoints
  getIncidentSummaryReport: async () => {
    try {
      const response = await api.get('/reports/incident-summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching incident summary report:', error);
      throw error;
    }
  },

  getModelPerformanceReport: async () => {
    try {
      const response = await api.get('/reports/model-performance');
      return response.data;
    } catch (error) {
      console.error('Error fetching model performance report:', error);
      throw error;
    }
  },

  getExecutiveDashboard: async () => {
    try {
      const response = await api.get('/reports/executive-dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching executive dashboard:', error);
      throw error;
    }
  },

  // Settings API
  getSystemSettings: async () => {
    try {
      const response = await api.get('/settings/system');
      return response.data;
    } catch (error) {
      console.error('Error fetching system settings:', error);
      throw error;
    }
  },

  updateSystemSettings: async (settings) => {
    try {
      const response = await api.post('/settings/system', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  },

  getSecuritySettings: async () => {
    try {
      const response = await api.get('/settings/security');
      return response.data;
    } catch (error) {
      console.error('Error fetching security settings:', error);
      throw error;
    }
  },

  updateSecuritySettings: async (settings) => {
    try {
      const response = await api.post('/settings/security', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating security settings:', error);
      throw error;
    }
  },

  getNotificationSettings: async () => {
    try {
      const response = await api.get('/settings/notifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      throw error;
    }
  },

  updateNotificationSettings: async (settings) => {
    try {
      const response = await api.post('/settings/notifications', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  },

  getModelSettings: async () => {
    try {
      const response = await api.get('/settings/models');
      return response.data;
    } catch (error) {
      console.error('Error fetching model settings:', error);
      throw error;
    }
  },

  updateModelSettings: async (settings) => {
    try {
      const response = await api.post('/settings/models', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating model settings:', error);
      throw error;
    }
  },

  getIntegrationSettings: async () => {
    try {
      const response = await api.get('/settings/integrations');
      return response.data;
    } catch (error) {
      console.error('Error fetching integration settings:', error);
      throw error;
    }
  },

  // Authentication endpoints
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', {
        username,
        password
      });
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  signup: async (username, password, email, fullName) => {
    try {
      const response = await api.post('/auth/signup', {
        username,
        password,
        email,
        full_name: fullName
      });
      return response.data;
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
    }
  },

  validateSession: async (sessionId) => {
    try {
      const response = await api.post('/auth/validate-session', {
        session_id: sessionId
      });
      return response.data;
    } catch (error) {
      console.error('Error validating session:', error);
      throw error;
    }
  },

  logout: async (sessionId) => {
    try {
      const response = await api.post('/auth/logout', {
        session_id: sessionId
      });
      return response.data;
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  },

  getUserInfo: async (sessionId) => {
    try {
      const response = await api.get(`/auth/user-info/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  },

  // Dashboard with filtering
  getFilteredDashboardData: async (timeRange = 'Last 24 Hours', severity = 'All', assignee = 'All') => {
    try {
      const response = await api.get('/dashboard/filtered-data', {
        params: { time_range: timeRange, severity: severity, assignee: assignee }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting filtered dashboard data:', error);
      throw error;
    }
  },

  // MITRE ATT&CK distribution
  getMitreAttackDistribution: async () => {
    try {
      const response = await api.get('/mitre-attack/distribution');
      return response.data;
    } catch (error) {
      console.error('Error getting MITRE ATT&CK distribution:', error);
      throw error;
    }
  },

  // Available assignees for filtering
  getAvailableAssignees: async () => {
    try {
      const response = await api.get('/dashboard/available-assignees');
      return response.data;
    } catch (error) {
      console.error('Error getting available assignees:', error);
      throw error;
    }
  },

  // Available anomaly types for incidents filtering
  getAvailableAnomalyTypes: async () => {
    try {
      const response = await api.get('/incidents/available-anomaly-types');
      return response.data;
    } catch (error) {
      console.error('Error getting available anomaly types:', error);
      throw error;
    }
  },

  // Available anomaly subtypes for incidents filtering
  getAvailableAnomalySubtypes: async () => {
    try {
      const response = await api.get('/incidents/available-anomaly-subtypes');
      return response.data;
    } catch (error) {
      console.error('Error getting available anomaly subtypes:', error);
      throw error;
    }
  }
};

export default apiService;
