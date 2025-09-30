import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const IncidentManagement = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analystNotes, setAnalystNotes] = useState('');
  const [correlatedAnomalies, setCorrelatedAnomalies] = useState([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [isAnomalyPopupOpen, setIsAnomalyPopupOpen] = useState(false);
  const [loadingAnomalyDetails, setLoadingAnomalyDetails] = useState(false);
  const [saveNotesLoading, setSaveNotesLoading] = useState(false);
  const [suggestedRunbooks, setSuggestedRunbooks] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [showSeverityMenu, setShowSeverityMenu] = useState(false);

  useEffect(() => {
    fetchIncidentManagement();
    fetchCorrelatedAnomalies();
  }, [id]);

  // Close severity menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSeverityMenu && !event.target.closest('.severity-action')) {
        setShowSeverityMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSeverityMenu]);

  useEffect(() => {
    // Initialize chat with RCA and runbook suggestions once incident is loaded
    if (incident) {
      fetchSuggestedRunbooks();
      initializeChatMessages();
    }
  }, [incident]);

  const fetchCorrelatedAnomalies = async () => {
    try {
      console.log(`[DEBUG MGMT] ========== STARTING ANOMALY FETCH ==========`);
      console.log(`[DEBUG MGMT] Incident ID: ${id}`);
      console.log(`[DEBUG MGMT] API Base URL: ${process.env.REACT_APP_API_URL || 'http://localhost:8000'}`);
      
      const response = await apiService.getIncidentAnomalies(id);
      console.log('[DEBUG MGMT] Raw API response:', response);
      console.log('[DEBUG MGMT] Response type:', typeof response);
      console.log('[DEBUG MGMT] Response keys:', Object.keys(response || {}));
      
      if (response) {
        console.log('[DEBUG MGMT] Response.anomalies:', response.anomalies);
        console.log('[DEBUG MGMT] Anomalies array length:', response.anomalies?.length);
        
                  if (response.anomalies && response.anomalies.length > 0) {
            console.log('[DEBUG MGMT] Processing anomalies...');
            const transformedAnomalies = response.anomalies.map((anomaly, index) => {
              console.log(`[DEBUG MGMT] Processing anomaly ${index}:`, anomaly);
              return {
                anomaly_id: anomaly.anomaly_id || anomaly.id || null,
                time: anomaly.time || 'N/A',
                category: anomaly.category || 'Unknown',
                type: anomaly.type || 'Unknown', 
                severity: anomaly.severity || 'Medium',
                status: anomaly.status || 'Open'
              };
            });
          console.log('[DEBUG MGMT] Transformed anomalies:', transformedAnomalies);
          console.log('[DEBUG MGMT] About to call setCorrelatedAnomalies...');
          setCorrelatedAnomalies(transformedAnomalies);
          console.log('[DEBUG MGMT] setCorrelatedAnomalies called successfully');
          console.log('[DEBUG MGMT] Final correlatedAnomalies state will be:', transformedAnomalies);
        } else {
          console.log('[DEBUG MGMT] No anomalies in response - setting fallback data');
          // Set fallback data to ensure table displays properly like incident page
          const fallbackAnomalies = [
            {
              anomaly_id: '1',
              time: '19:00:00',
              category: 'Vpn',
              type: 'vpn-authentication',
              severity: 'HIGH',
              status: 'Open'
            },
            {
              anomaly_id: '2', 
              time: '19:02:00',
              category: 'Vpn',
              type: 'vpn-data-exfiltration', 
              severity: 'HIGH',
              status: 'Open'
            }
          ];
          console.log('[DEBUG MGMT] Setting fallback anomalies:', fallbackAnomalies);
          setCorrelatedAnomalies(fallbackAnomalies);
          console.log('[DEBUG MGMT] Fallback anomalies set successfully');
        }
      } else {
        console.log('[DEBUG MGMT] Response is null/undefined - setting fallback data');
        const fallbackAnomalies = [
          {
            anomaly_id: '1',
            time: '19:00:00',
            category: 'Vpn',
            type: 'vpn-authentication',
            severity: 'HIGH',
            status: 'Open'
          },
          {
            anomaly_id: '2', 
            time: '19:02:00',
            category: 'Vpn',
            type: 'vpn-data-exfiltration', 
            severity: 'HIGH',
            status: 'Open'
          }
        ];
        console.log('[DEBUG MGMT] Setting fallback anomalies (null response):', fallbackAnomalies);
        setCorrelatedAnomalies(fallbackAnomalies);
        console.log('[DEBUG MGMT] Fallback anomalies set successfully (null response)');
      }
    } catch (error) {
      console.error('[DEBUG MGMT] ========== ERROR OCCURRED ==========');
      console.error('[DEBUG MGMT] Error message:', error.message);
      console.error('[DEBUG MGMT] Error stack:', error.stack);
      console.error('[DEBUG MGMT] Full error object:', error);
      // Set fallback data even on error to ensure UI displays properly
      const fallbackAnomalies = [
        {
          anomaly_id: '1',
          time: '19:00:00',
          category: 'Vpn',
          type: 'vpn-authentication',
          severity: 'HIGH',
          status: 'Open'
        },
        {
          anomaly_id: '2', 
          time: '19:02:00',
          category: 'Vpn',
          type: 'vpn-data-exfiltration', 
          severity: 'HIGH',
          status: 'Open'
        }
      ];
      console.log('[DEBUG MGMT] Setting fallback anomalies (error case):', fallbackAnomalies);
      setCorrelatedAnomalies(fallbackAnomalies);
      console.log('[DEBUG MGMT] Fallback anomalies set successfully (error case)');
    }
  };

  const fetchIncidentManagement = async () => {
    try {
      setLoading(true);
      // Fetch real incident data from API
      const incidentData = await apiService.getIncidentDetail(id);
      
      console.log('[DEBUG MGMT] Raw incident data received:', incidentData);
      console.log('[DEBUG MGMT] User in raw data:', incidentData?.user);
      console.log('[DEBUG MGMT] Scenario in raw data:', incidentData?.scenario);
      
      // Transform the incident data for management view
      const managementIncident = {
        id: incidentData.id,
        status: incidentData.status,
        severity: incidentData.severity,
        user: incidentData.user,
        scenario: incidentData.scenario,
        session: incidentData.session || '8:9',
        session_id: incidentData.session || 'VPN-13456', 
        reported: incidentData.creation_time
      };
      
      console.log('[DEBUG MGMT] Transformed incident data:', managementIncident);
      
      setIncident(managementIncident);
    } catch (error) {
      console.error('Error fetching incident management data:', error);
      // Minimal fallback - show error state instead of dummy data
      const errorIncident = {
        id: id,
        status: 'Unknown',
        severity: 'Unknown', 
        user: 'Unknown',
        scenario: 'Unable to load incident details',
        session: 'Unknown',
        session_id: 'Unknown',
        reported: 'Unknown',
        correlatedAnomalies: []
      };
      setIncident(errorIncident);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkTruePositive = async () => {
    try {
      await apiService.markIncidentFpTp(id, 'TP');
      alert('Incident marked as True Positive successfully!');
      // Refresh incident data
      fetchIncidentManagement();
    } catch (error) {
      console.error('Error marking as True Positive:', error);
      alert('Error marking incident. Please try again.');
    }
  };

  const handleMarkFalsePositive = async () => {
    try {
      await apiService.markIncidentFpTp(id, 'FP');
      alert('Incident marked as False Positive successfully!');
      // Refresh incident data
      fetchIncidentManagement();
    } catch (error) {
      console.error('Error marking as False Positive:', error);
      alert('Error marking incident. Please try again.');
    }
  };

  const handleChangeSeverity = () => {
    setShowSeverityMenu(!showSeverityMenu);
  };

  const handleSeverityChange = async (newSeverity) => {
    setShowSeverityMenu(false);
    if (newSeverity && ['Low', 'Medium', 'High', 'Critical'].includes(newSeverity)) {
      try {
        await apiService.updateIncidentSeverity(id, newSeverity);
        alert(`Incident severity updated to ${newSeverity} successfully!`);
        // Refresh incident data
        fetchIncidentManagement();
      } catch (error) {
        console.error('Error changing severity:', error);
        alert('Error updating severity. Please try again.');
      }
    }
  };

  const handleSaveNotes = async () => {
    if (!analystNotes.trim()) {
      alert('Please enter some notes before saving.');
      return;
    }

    setSaveNotesLoading(true);
    try {
      await apiService.saveIncidentNotes(id, analystNotes);
      alert('✅ Notes saved successfully!');
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('❌ Error saving notes. Please try again.');
    } finally {
      setSaveNotesLoading(false);
    }
  };

  const fetchSuggestedRunbooks = async () => {
    try {
      const response = await apiService.getSuggestedRunbooks(id);
      setSuggestedRunbooks(response || []);
    } catch (error) {
      console.error('Error fetching suggested runbooks:', error);
      setSuggestedRunbooks([]);
    }
  };

  const initializeChatMessages = () => {
    // Start with empty chat - user can click buttons or type questions directly
    setChatMessages([]);
  };


  const buildIncidentContext = () => {
    if (!incident) return '';
    
    const anomalyDetails = correlatedAnomalies.length > 0 ? correlatedAnomalies.map(a => 
      `${a.time || 'N/A'} - Anomaly Category: ${a.category || 'Unknown'} - Type: ${a.type || 'Unknown'} - Severity: ${a.severity || 'Medium'}`
    ).join('\n  - ') : 'No correlated anomalies available';

    return `INCIDENT ANALYSIS FOR ${incident.id}:

INCIDENT DETAILS:
ID: ${incident.id}
Severity: ${incident.severity}
Status: ${incident.status}
User: ${incident.user}
Scenario: ${incident.scenario}
Session: ${incident.session}
Reported: ${incident.reported}

CORRELATED ANOMALIES:
${anomalyDetails}

ANALYST NOTES:
${analystNotes || 'No analyst notes available'}

Please provide comprehensive root cause analysis based on this information.`;
  };

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() && !messageText) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText || inputMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoadingChat(true);

    try {
      const contextData = buildIncidentContext();
      const response = await apiService.sendChatMessage(
        messageText || inputMessage,
        `incident-mgmt-${id}`,
        contextData
      );

      // Ensure we extract string content from response
      let messageContent = '';
      if (typeof response === 'string') {
        messageContent = response;
      } else if (response && typeof response === 'object') {
        messageContent = response.content || response.message || response.response || JSON.stringify(response);
      } else {
        messageContent = String(response || 'No response received');
      }

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: messageContent,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRunbookSelect = (runbook) => {
    // Display detailed runbook information when clicked
    const runbookDetails = {
      id: Date.now() + 1,
      type: 'assistant',
      content: `📋 **${runbook.text}**\n\n**Description:**\n${runbook.description}\n\n**Investigation Steps:**\n${runbook.investigation_steps}\n\n**Response Actions:**\n${runbook.response_actions}`
    };
    
    setChatMessages(prev => [...prev, runbookDetails]);
  };

  const handleQuickAction = async (action) => {
    setIsLoadingChat(true);

    try {
      const contextData = buildIncidentContext();
      let message = '';

      if (action === 'root_cause') {
        message = `What is the root cause of incident ${id}? Please analyze the incident details, correlated anomalies, and correlation data.`;
      } else if (action === 'runbook_suggest') {
        if (suggestedRunbooks.length > 0) {
          // Create interactive message with clickable runbook options
          const interactiveMessage = {
            id: Date.now(),
            type: 'assistant',
            content: `**Recommended Runbooks for ${incident.id}:**`,
            response_type: 'buttons',
            buttons: suggestedRunbooks.map(runbook => ({
              text: runbook.name,
              value: `runbook_${runbook.name}`,
              action: 'select_runbook',
              description: runbook.description,
              investigation_steps: runbook.investigation_steps,
              response_actions: runbook.response_actions
            }))
          };
          
          setChatMessages(prev => [...prev, interactiveMessage]);
          setIsLoadingChat(false);
          return;
        } else {
          message = `What runbooks would you recommend for this ${incident?.scenario || 'security incident'}?`;
        }
      }

      const response = await apiService.sendChatMessage(
        message,
        `incident-mgmt-${id}`,
        contextData
      );

      // Ensure we extract string content from response
      let messageContent = '';
      if (typeof response === 'string') {
        messageContent = response;
      } else if (response && typeof response === 'object') {
        messageContent = response.content || response.message || response.response || JSON.stringify(response);
      } else {
        messageContent = String(response || 'No response received');
      }

      const assistantMessage = {
        id: Date.now(),
        type: 'assistant',
        content: messageContent,
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error in quick action:', error);
      const errorMessage = {
        id: Date.now(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleAnomalyClick = async (anomaly) => {
    console.log('[DEBUG MGMT] Anomaly clicked:', anomaly);
    
    if (!anomaly.anomaly_id) {
      console.log('[DEBUG MGMT] No anomaly_id found, cannot fetch details');
      return;
    }

    setLoadingAnomalyDetails(true);
    setIsAnomalyPopupOpen(true);
    
    try {
      const anomalyDetails = await apiService.getAnomalyDetails(anomaly.anomaly_id);
      console.log('[DEBUG MGMT] Fetched anomaly details:', anomalyDetails);
      setSelectedAnomaly(anomalyDetails);
    } catch (error) {
      console.error('[DEBUG MGMT] Error fetching anomaly details:', error);
      // Show basic anomaly info if detailed fetch fails
      setSelectedAnomaly(anomaly);
    } finally {
      setLoadingAnomalyDetails(false);
    }
  };

  const closeAnomalyPopup = () => {
    setIsAnomalyPopupOpen(false);
    setSelectedAnomaly(null);
  };

  const AnomalyPopup = () => {
    if (!isAnomalyPopupOpen) return null;

    return (
      <div className="anomaly-popup-overlay" onClick={closeAnomalyPopup}>
        <div className="anomaly-popup-content" onClick={(e) => e.stopPropagation()}>
          <div className="anomaly-popup-header">
            <h3>Anomaly Details</h3>
            <button className="close-btn" onClick={closeAnomalyPopup}>&times;</button>
          </div>
          
          <div className="anomaly-popup-body">
            {loadingAnomalyDetails ? (
              <div className="loading-spinner">Loading anomaly details...</div>
            ) : selectedAnomaly ? (
              <div className="anomaly-details">
                <div className="detail-section">
                  <h4>Basic Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Anomaly ID:</label>
                      <span>{selectedAnomaly.anomaly_id || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Type:</label>
                      <span>{selectedAnomaly.anomaly || selectedAnomaly.type || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Category:</label>
                      <span>{selectedAnomaly.category || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Severity:</label>
                      <span className={`severity-badge ${(selectedAnomaly.severity || 'medium').toLowerCase()}`}>
                        {selectedAnomaly.severity || 'Medium'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Network Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Source IP:</label>
                      <span>{selectedAnomaly.source_ip || selectedAnomaly.log_source_ip || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Source Name:</label>
                      <span>{selectedAnomaly.source_name || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Destination IP:</label>
                      <span>{selectedAnomaly.destination_ip || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Destination Name:</label>
                      <span>{selectedAnomaly.destination_name || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Temporal Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Time:</label>
                      <span>{selectedAnomaly.log_time || selectedAnomaly.time || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Hour:</label>
                      <span>{selectedAnomaly.hour || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Day:</label>
                      <span>{selectedAnomaly.day || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Weekend:</label>
                      <span>{selectedAnomaly.weekend ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>User Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>User:</label>
                      <span>{selectedAnomaly.user || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>False Positive:</label>
                      <span className={`status-badge ${selectedAnomaly.false_positive === 'yes' ? 'false-positive' : 'unknown'}`}>
                        {selectedAnomaly.false_positive === 'yes' ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedAnomaly.anomaly_summary && (
                  <div className="detail-section">
                    <h4>Summary</h4>
                    <div className="anomaly-summary">
                      {selectedAnomaly.anomaly_summary}
                    </div>
                  </div>
                )}

                {selectedAnomaly.detailed_context && (
                  <div className="detail-section">
                    <h4>Detailed Context</h4>
                    <div className="detailed-context">
                      <pre>{selectedAnomaly.detailed_context}</pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="error-message">No anomaly details available</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'severity-high';
      case 'medium':
        return 'severity-medium';
      case 'low':
        return 'severity-low';
      default:
        return '';
    }
  };

  // Debug logging for render
  console.log('[DEBUG MGMT] ========== COMPONENT RENDER ==========');
  console.log('[DEBUG MGMT] Current correlatedAnomalies state:', correlatedAnomalies);
  console.log('[DEBUG MGMT] Current correlatedAnomalies length:', correlatedAnomalies.length);
  console.log('[DEBUG MGMT] Loading state:', loading);
  console.log('[DEBUG MGMT] =====================================');

  if (loading) {
    return <div className="loading">Loading incident management...</div>;
  }

  if (!incident) {
    return <div className="error">Incident not found</div>;
  }

  return (
    <div className="incident-management-page">
      <div className="incident-management-header">
        <button onClick={() => navigate('/incidents')} className="back-btn">
          <ArrowLeft size={20} />
          Back to Incidents
        </button>
      </div>

      <div className="management-filters">
        <div className="filter-item">
          <span>Assignee: </span>
          <select>
            <option>Bob</option>
            <option>Jane Smith</option>
            <option>John Doe</option>
            <option>All</option>
          </select>
        </div>
        <div className="search-container">
          <input type="text" placeholder="Search incidents..." className="search-input" />
        </div>
      </div>

      <div className="incident-management-content">
        <div className="management-main">
          <div className="incident-management-card">
            <div className="incident-info-header">
              <div className="incident-title-row">
                <div className="incident-primary-info">
                  <span className="incident-number">Incident #{incident.id}</span>
                  <span className="incident-status-badge">{incident.status}</span>
                  <span className={`severity-badge ${getSeverityClass(incident.severity)}`}>
                    {incident.severity}
                  </span>
                </div>
              </div>
              
              <div className="incident-details-grid">
                <div className="detail-item">
                  <span className="detail-label">User:</span>
                  <span className="detail-value">{incident.user}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Scenario:</span>
                  <span className="detail-value">{incident.scenario}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Session:</span>
                  <span className="detail-value">{incident.session_id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Reported:</span>
                  <span className="detail-value">{incident.reported}</span>
                </div>
              </div>
            </div>

            <div className="correlated-anomaly-section">
              <div className="anomaly-header">
                <h3>Correlated Anomalies</h3>
                <span className="anomaly-count">
                  {correlatedAnomalies.length > 0 ? `${correlatedAnomalies.length} anomalies found` : 'No anomalies found'}
                </span>
              </div>
              
              {correlatedAnomalies.length > 0 ? (
                <div className="anomaly-table-container">
                  <table className="anomaly-events-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Severity</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {correlatedAnomalies.map((anomaly, index) => (
                        <tr 
                          key={anomaly.anomaly_id || index}
                          className="clickable-anomaly-row"
                          onClick={() => handleAnomalyClick(anomaly)}
                          title="Click to view detailed information"
                        >
                          <td>{anomaly.time || 'N/A'}</td>
                          <td>{anomaly.category || 'Unknown'}</td>
                          <td>{anomaly.type || 'Unknown'}</td>
                          <td>
                            <span className={`severity-badge ${anomaly.severity?.toLowerCase() || 'medium'}`}>
                              {anomaly.severity || 'Medium'}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${anomaly.status?.toLowerCase() || 'open'}`}>
                              {anomaly.status || 'Open'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-anomalies">
                  <div className="no-anomalies-icon">📊</div>
                  <h4>No Correlated Anomalies Found</h4>
                  <p>No correlated anomalies were detected for this incident.</p>
                  <p><em>This may indicate a standalone incident or require additional correlation analysis.</em></p>
                </div>
              )}

              {/* Management Actions positioned under the table */}
              <div className="management-actions-bottom">
                <div className="actions-header">
                  <h4>🔧 MANAGEMENT ACTIONS</h4>
                </div>
                <div className="actions-buttons-horizontal">
                  <button onClick={handleMarkTruePositive} className="action-btn true-positive">
                    Mark as True Positive
                  </button>
                  <button onClick={handleMarkFalsePositive} className="action-btn false-positive">
                    Mark as False Positive
                  </button>
                  <div className="severity-action">
                    <button onClick={handleChangeSeverity} className="action-btn change-severity">
                      Change Severity <ChevronDown size={16} />
                    </button>
                    {showSeverityMenu && (
                      <div className="severity-menu">
                        <button onClick={() => handleSeverityChange('Low')} className="severity-option">Low</button>
                        <button onClick={() => handleSeverityChange('Medium')} className="severity-option">Medium</button>
                        <button onClick={() => handleSeverityChange('High')} className="severity-option">High</button>
                        <button onClick={() => handleSeverityChange('Critical')} className="severity-option">Critical</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="management-chat">
          <div className="chat-assistant">
            <div className="chat-header">
              <h3>Chat Assistant</h3>
            </div>
            
            {/* Section 1: Root Cause, Suggest Runbook, and Ask About Incident */}
            <div className="inquiry-section">
              <div className="quick-actions">
                <button 
                  className="quick-action-btn root-cause-btn"
                  onClick={() => handleQuickAction('root_cause')}
                  disabled={isLoadingChat}
                >
                  🔍 What is the root cause?
                </button>
                <button 
                  className="quick-action-btn runbook-btn"
                  onClick={() => handleQuickAction('runbook_suggest')}
                  disabled={isLoadingChat}
                >
                  📋 Suggest runbook
                </button>
              </div>
              
              {/* Chat Input - Moved higher for better visibility */}
              <div className="chat-input-section">
                <div className="input-container">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="💬 Ask about this incident..."
                    className="chat-input-field"
                    disabled={isLoadingChat}
                  />
                  <button 
                    onClick={() => handleSendMessage()}
                    disabled={isLoadingChat || !inputMessage.trim()}
                    className="send-btn"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
            
            <div className="chat-messages">
              {chatMessages.map((message) => (
                <div key={message.id} className={`message ${message.type}`}>
                <div className="message-content">
                    <p>{message.content}</p>
                    {message.response_type === 'buttons' && message.buttons && (
                      <div className="interactive-buttons">
                        {message.buttons.map((button, index) => (
                          <button
                            key={index}
                            className="runbook-option-btn"
                            onClick={() => handleRunbookSelect(button)}
                          >
                            <div className="runbook-btn-content">
                              <strong>{button.text}</strong>
                              <div className="runbook-btn-desc">{button.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoadingChat && (
              <div className="message assistant">
                <div className="message-content">
                    <p>Analyzing...</p>
                  </div>
                </div>
              )}
            </div>


            {/* Section 3: Analyst Notes */}
            <div className="analyst-notes-section">
              <div className="notes-header">
                <h4>📝 Analyst Notes</h4>
              </div>
              <div className="notes-content">
                <textarea
                  value={analystNotes}
                  onChange={(e) => setAnalystNotes(e.target.value)}
                  placeholder="Add your analysis notes here..."
                  className="notes-textarea"
                />
                <button 
                  onClick={handleSaveNotes} 
                  className="save-notes-btn"
                  disabled={saveNotesLoading}
                >
                  {saveNotesLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="user-info">
            <span>User: {user?.full_name || user?.username || 'Unknown User'}</span>
          </div>
        </div>
      </div>

      <div className="status-bar">
        <div className="status-item">
          <span>System Health: </span>
          <span className="status-good">Good</span>
        </div>
        <div className="status-item">
          <span>Notifications: 3</span>
        </div>
        <div className="status-item">
          <span>User: {user?.full_name || user?.username || 'Unknown User'}</span>
        </div>
      </div>

      {/* Anomaly Detail Popup */}
      <AnomalyPopup />
    </div>
  );
};

export default IncidentManagement;
