import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronRight, Send } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../enhanced-runbooks.css';

const IncidentDetail = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    anomalies: false,
    events: false
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [suggestedRunbooks, setSuggestedRunbooks] = useState([]);
  const [showRunbookSuggestions, setShowRunbookSuggestions] = useState(false);
  const [correlatedAnomalies, setCorrelatedAnomalies] = useState([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [isAnomalyPopupOpen, setIsAnomalyPopupOpen] = useState(false);
  const [loadingAnomalyDetails, setLoadingAnomalyDetails] = useState(false);
  const [analystNotes, setAnalystNotes] = useState('');
  const [saveNotesLoading, setSaveNotesLoading] = useState(false);

  useEffect(() => {
    fetchIncidentDetail();
    fetchCorrelatedAnomalies();
  }, [id]);

  useEffect(() => {
    // Initialize chat with contextual suggestions and fetch runbooks once incident is loaded
    if (incident) {
      // Fetch suggested runbooks for this incident
      fetchSuggestedRunbooks();
      
      // Set contextual chat suggestions based on incident type
      const suggestions = [
        'What is root cause of this incident?',
        'Summarize the anomalies for this incident',
        'Suggest next steps',
        'Show related runbooks'
      ];
      
      setChatMessages([
        {
          id: 1,
          type: 'suggestion-group',
          suggestions: suggestions,
          timestamp: new Date()
        }
      ]);
    }
  }, [incident]);

  const fetchSuggestedRunbooks = async () => {
    try {
      console.log(`[DEBUG] Fetching suggested runbooks for incident: ${incident.id}`);
      const response = await apiService.getSuggestedRunbooks(incident.id);
      console.log('[DEBUG] Enhanced runbook suggestions response:', response);
      
      // Handle enhanced response format
      if (response && response.runbooks) {
        setSuggestedRunbooks(response.runbooks);
        console.log(`[SUCCESS] Found ${response.runbooks.length} suggested runbooks`);
        
        // Log search method and relevance info
        if (response.search_method) {
          console.log(`[INFO] Search method: ${response.search_method}`);
        }
        if (response.total_found) {
          console.log(`[INFO] Total relevant runbooks found: ${response.total_found}`);
        }
      } else {
        setSuggestedRunbooks([]);
      }
    } catch (error) {
      console.error('Error fetching suggested runbooks:', error);
      setSuggestedRunbooks([]);
    }
  };

  const fetchCorrelatedAnomalies = async () => {
    try {
      console.log(`[DEBUG] Fetching correlated anomalies for incident: ${id}`);
      const response = await apiService.getIncidentAnomalies(id);
      console.log('[DEBUG] Correlated anomalies API response:', response);
      console.log('[DEBUG] Number of anomalies found:', response?.anomalies?.length || 0);
      
      if (response && response.anomalies && response.anomalies.length > 0) {
        console.log('[DEBUG] Setting anomalies:', response.anomalies);
        setCorrelatedAnomalies(response.anomalies);
      } else {
        console.log('[DEBUG] No anomalies found in response');
        setCorrelatedAnomalies([]);
      }
    } catch (error) {
      console.error('[DEBUG] Error fetching correlated anomalies:', error);
      console.error('[DEBUG] Full error object:', error);
      setCorrelatedAnomalies([]);
    }
  };

  const fetchIncidentDetail = async () => {
    try {
      setLoading(true);
      console.log(`[DEBUG] Fetching incident detail for: ${id}`);
      
      // Fetch real incident data from API
      const incidentData = await apiService.getIncidentDetail(id);
      console.log('[DEBUG] Raw incident data received:', incidentData);
      console.log('[DEBUG] User in raw data:', incidentData?.user);
      console.log('[DEBUG] Scenario in raw data:', incidentData?.scenario);
      console.log('[DEBUG] Full incident data:', JSON.stringify(incidentData, null, 2));
      
      if (!incidentData) {
        console.error('[DEBUG] No incident data received from API');
        throw new Error('No incident data received');
      }
      
      // Transform API response to match expected format if needed
      const transformedIncident = {
        ...incidentData,
        // Ensure all required fields are present
        anomalies: incidentData.anomalies || [],
        events: incidentData.events || [],
        session: incidentData.session || `SESSION-${incidentData.id}`,
        assignee: incidentData.assignee || 'Security SOC',
        threat_context: incidentData.threat_context || 'Security incident under investigation',
        mitre_attack: incidentData.mitre_attack || 'None'
      };
      
      console.log('[DEBUG] Transformed incident data:', transformedIncident);
      console.log('[DEBUG] Setting incident state with user:', transformedIncident.user);
      setIncident(transformedIncident);
    } catch (error) {
      console.error('[DEBUG] Error fetching incident detail:', error);
      console.error('[DEBUG] API Base URL:', process.env.REACT_APP_API_URL || 'http://localhost:8000');
      
      // Minimal fallback - use the ID provided and show error state
      const errorIncident = {
        id: id,
        severity: 'Unknown',
        user: 'Unknown',
        scenario: 'Unable to load incident details',
        status: 'Unknown',
        creation_time: 'Unknown',
        category: 'Error',
        assignee: 'Unknown',
        source_ip: 'Unknown',
        description: `Error loading incident ${id}. Please check API connectivity. Error: ${error.message}`,
        session: 'Unknown',
        anomalies: [],
        events: [],
        threat_context: 'Unable to load threat context',
        mitre_attack: 'Unknown'
      };
      console.log('[DEBUG] Setting error incident:', errorIncident);
      setIncident(errorIncident);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'severity-high-text';
      case 'medium':
        return 'severity-medium-text';
      case 'low':
        return 'severity-low-text';
      default:
        return '';
    }
  };

  const buildIncidentContext = () => {
    if (!incident) return '';
    
    const anomalyDetails = correlatedAnomalies.length > 0 ? correlatedAnomalies.map(a => 
      `${a.time || 'N/A'} - Anomaly ID: ${a.anomaly_id || 'N/A'} - Category: ${a.category || 'Unknown'} - Type: ${a.type || 'Unknown'} - Severity: ${a.severity || 'Medium'}`
    ).join('\n  - ') : 'No correlated anomalies available';

    const eventDetails = incident.events ? incident.events.map(e => 
      `${e.timestamp || 'N/A'} - ${e.event_type || 'Unknown'}: ${e.details || 'No details'}`
    ).join('\n  - ') : 'No events available';

    const runbookInfo = suggestedRunbooks.length > 0 
      ? suggestedRunbooks.map(r => `${r.name}: ${r.description}`).join('\n  - ')
      : 'No relevant runbooks found';
    
    return `INCIDENT ANALYSIS FOR ${incident.id}:

INCIDENT DETAILS:
ID: ${incident.id}
Severity: ${incident.severity}
User: ${incident.user}
Scenario: ${incident.scenario}
Status: ${incident.status}
Creation Time: ${incident.creation_time}
Category: ${incident.category}
Assignee: ${incident.assignee}
Source IP: ${incident.source_ip || 'N/A'}
Session: ${incident.session || 'N/A'}
Threat Context: ${incident.threat_context || 'N/A'}
MITRE ATT&CK: ${incident.mitre_attack || 'N/A'}
Risk Score: ${incident.risk_score || 'N/A'}
Description: ${incident.description}

CORRELATED ANOMALIES FOR THIS INCIDENT:
  - ${anomalyDetails}

RELATED EVENTS FOR THIS INCIDENT:
  - ${eventDetails}

SUGGESTED RUNBOOKS FOR THIS INCIDENT:
  - ${runbookInfo}`;
  };

  const getContextualResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Root cause analysis
    if (lowerMessage.includes('root cause') || lowerMessage.includes('cause of this incident')) {
      const anomalyCount = correlatedAnomalies.length;
      const anomalyDetails = correlatedAnomalies.length > 0 ? correlatedAnomalies.map(a => 
        `• ${a.type} (Category: ${a.category}, Severity: ${a.severity})`
      ).join('\n') : 'No correlated anomalies found';
      
      let rootCauseAnalysis = `**Root Cause Analysis for ${incident.id}:**\n\n`;
      rootCauseAnalysis += `**Incident Summary:** ${incident.scenario}\n`;
      rootCauseAnalysis += `**Severity:** ${incident.severity}\n`;
      rootCauseAnalysis += `**User Involved:** ${incident.user}\n\n`;
      rootCauseAnalysis += `**Correlated Anomalies (${anomalyCount}):**\n${anomalyDetails}\n\n`;
      
      if (incident.threat_context) {
        rootCauseAnalysis += `**Threat Context:** ${incident.threat_context}\n\n`;
      }
      
      // Add runbook suggestions if available
      if (suggestedRunbooks.length > 0) {
        rootCauseAnalysis += `**Recommended Actions:**\n`;
        suggestedRunbooks.forEach(runbook => {
          rootCauseAnalysis += `• Run "${runbook.name}" playbook\n`;
        });
        setShowRunbookSuggestions(true);
      } else {
        rootCauseAnalysis += `**No specific runbooks found** for this incident type. Consider manual investigation.`;
      }
      
      return rootCauseAnalysis;
    }
    
    // Anomaly summary
    if (lowerMessage.includes('anomalies') && lowerMessage.includes('incident')) {
      const anomalyCount = correlatedAnomalies.length;
      let summary = `**Anomaly Summary for ${incident.id}:**\n\n`;
      
      if (anomalyCount > 0) {
        correlatedAnomalies.forEach((anomaly, index) => {
          summary += `**Anomaly ${index + 1}:**\n`;
          summary += `• Anomaly ID: ${anomaly.anomaly_id}\n`;
          summary += `• Time: ${anomaly.time}\n`;
          summary += `• Category: ${anomaly.category}\n`;
          summary += `• Type: ${anomaly.type}\n`;
          summary += `• Severity: ${anomaly.severity}\n`;
          summary += `• Status: ${anomaly.status}\n\n`;
        });
      } else {
        summary += `No correlated anomalies found for this incident.`;
      }
      
      return summary;
    }
    
    // Next steps
    if (lowerMessage.includes('next steps') || lowerMessage.includes('suggest')) {
      let nextSteps = `**Suggested Next Steps for ${incident.id}:**\n\n`;
      
      if (suggestedRunbooks.length > 0) {
        nextSteps += `**Available Runbooks:**\n`;
        suggestedRunbooks.forEach((runbook, index) => {
          nextSteps += `${index + 1}. **${runbook.name}**\n   ${runbook.description}\n\n`;
        });
        nextSteps += `Click "Run playbook" to execute the recommended procedures.`;
        setShowRunbookSuggestions(true);
      } else {
        nextSteps += `**Manual Investigation Recommended:**\n`;
        nextSteps += `• Verify user ${incident.user} activities\n`;
        nextSteps += `• Check source IP ${incident.source_ip} for suspicious patterns\n`;
        nextSteps += `• Review system logs for the time period\n`;
        nextSteps += `• Consider escalating to security team\n\n`;
        nextSteps += `**No automated runbooks found** for this incident type.`;
      }
      
      return nextSteps;
    }
    
    // Show runbooks
    if (lowerMessage.includes('runbook') || lowerMessage.includes('playbook')) {
      if (suggestedRunbooks.length > 0) {
        let runbookList = `**Available Runbooks for ${incident.id}:**\n\n`;
        suggestedRunbooks.forEach((runbook, index) => {
          runbookList += `**${index + 1}. ${runbook.name}**\n`;
          runbookList += `   Description: ${runbook.description}\n\n`;
        });
        setShowRunbookSuggestions(true);
        return runbookList;
      } else {
        return `**No runbooks found** for this incident type "${incident.scenario}". Manual investigation may be required.`;
      }
    }
    
    // Default response with context
    return `I can help you analyze incident ${incident.id}. Please ask about:\n• Root cause analysis\n• Anomaly details\n• Next steps\n• Available runbooks`;
  };

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || isLoadingChat) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoadingChat(true);

    try {
      const lowerMessage = messageText.toLowerCase();
      
      // Check if this is a root cause analysis request
      const isRootCauseRequest = lowerMessage.includes('root cause') || 
                                lowerMessage.includes('cause of this incident') ||
                                lowerMessage.includes('what is root cause');

      if (isRootCauseRequest && incident?.id) {
        console.log(`[CHAT] Sending root cause analysis request to backend for incident: ${incident.id}`);
        
        try {
          // Call backend API for comprehensive root cause analysis
          const response = await apiService.sendChatMessage(
            `What is the root cause of incident ${incident.id}? Please analyze the incident details, correlated anomalies, and correlation data.`,
            `incident-${incident.id}`,
            buildIncidentContext()
          );
          
          console.log('[CHAT] Root cause analysis response:', response);
          
          const assistantMessage = {
            id: Date.now() + 1,
            type: 'assistant',
            content: response.response || response.content || response.message || 'Unable to analyze incident at this time.',
            timestamp: new Date(),
            isRootCauseAnalysis: true
          };
          setChatMessages(prev => [...prev, assistantMessage]);
          
        } catch (apiError) {
          console.error('[CHAT] Backend API error, falling back to local analysis:', apiError);
          
          // Fallback to enhanced local analysis if backend fails
          const localResponse = getEnhancedLocalRootCause();
          const assistantMessage = {
            id: Date.now() + 1,
            type: 'assistant',
            content: localResponse,
            timestamp: new Date(),
            isRootCauseAnalysis: true,
            isFallback: true
          };
          setChatMessages(prev => [...prev, assistantMessage]);
        }
        
      } else {
        // For non-root cause requests, use local contextual response
        const contextualResponse = getContextualResponse(messageText);
        
        setTimeout(() => {
          const assistantMessage = {
            id: Date.now() + 1,
            type: 'assistant',
            content: contextualResponse,
            timestamp: new Date(),
            showRunbooks: showRunbookSuggestions && suggestedRunbooks.length > 0,
            runbooks: showRunbookSuggestions ? suggestedRunbooks : []
          };
          setChatMessages(prev => [...prev, assistantMessage]);
          
          // Add runbook suggestions if they should be shown
          if (showRunbookSuggestions && suggestedRunbooks.length > 0) {
            setTimeout(() => {
              const runbookMessage = {
                id: Date.now() + 2,
                type: 'runbook-suggestions',
                runbooks: suggestedRunbooks,
                timestamp: new Date()
              };
              setChatMessages(prev => [...prev, runbookMessage]);
              setShowRunbookSuggestions(false); // Reset flag
            }, 500);
          }
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'Sorry, I encountered an error while analyzing this incident. Please try again or contact your system administrator.',
        timestamp: new Date(),
        isError: true
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const getEnhancedLocalRootCause = () => {
    const anomalyCount = correlatedAnomalies.length;
    const anomalyDetails = correlatedAnomalies.length > 0 ? correlatedAnomalies.map(a => 
      `• ${a.type} (Category: ${a.category}, Severity: ${a.severity}, Time: ${a.time})`
    ).join('\n') : 'No correlated anomalies found';
    
    let analysis = `🔍 **ROOT CAUSE ANALYSIS - ${incident.id}**\n\n`;
    analysis += `**📋 INCIDENT SUMMARY:**\n`;
    analysis += `• Scenario: ${incident.scenario}\n`;
    analysis += `• Severity: ${incident.severity}\n`;
    analysis += `• User: ${incident.user}\n`;
    analysis += `• Source IP: ${incident.source_ip || 'Unknown'}\n`;
    analysis += `• Time: ${incident.creation_time}\n\n`;
    
    analysis += `**🚨 CORRELATED ANOMALIES (${anomalyCount}):**\n${anomalyDetails}\n\n`;
    
    if (incident.threat_context) {
      analysis += `**⚠️ THREAT CONTEXT:**\n${incident.threat_context}\n\n`;
    }
    
    analysis += `**🎯 PRELIMINARY ANALYSIS:**\n`;
    if (incident.scenario?.toLowerCase().includes('account creation')) {
      analysis += `• **Primary Threat**: Unauthorized account creation indicates potential privilege escalation\n`;
      analysis += `• **Risk**: High - Could lead to persistent access and lateral movement\n`;
      analysis += `• **Immediate Action**: Verify legitimacy of account creation and disable if unauthorized\n`;
    } else {
      analysis += `• **Assessment**: ${incident.severity} severity incident requiring investigation\n`;
      analysis += `• **Context**: Based on available data, manual analysis recommended\n`;
    }
    
    analysis += `\n**💡 NOTE**: This is a local analysis. For comprehensive root cause analysis with full correlation data, please ensure backend connectivity.`;
    
    return analysis;
  };

  const handleSuggestedClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleRunPlaybook = (runbookName) => {
    const playbookMessage = {
      id: Date.now(),
      type: 'user',
      content: `Execute "${runbookName}" playbook`,
      timestamp: new Date()
    };
    
    const playbookResponse = {
      id: Date.now() + 1,
      type: 'assistant',
      content: `**Executing "${runbookName}" playbook for incident ${incident.id}...**\n\n✅ Playbook initiated\n✅ Gathering incident context\n✅ Executing investigation steps\n✅ Documenting findings\n\n**Status:** Playbook execution started. Monitor progress in the incident timeline.`,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, playbookMessage, playbookResponse]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
      
      // Add success message to chat
      const successMessage = {
        id: Date.now(),
        type: 'system',
        content: '✅ Analyst notes saved successfully!',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, successMessage]);
      
    } catch (error) {
      console.error('Error saving notes:', error);
      
      // Add error message to chat
      const errorMessage = {
        id: Date.now(),
        type: 'system',
        content: '❌ Error saving notes. Please try again.',
        timestamp: new Date(),
        error: true
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setSaveNotesLoading(false);
    }
  };

  const handleAnomalyClick = async (anomaly) => {
    console.log('[DEBUG] Anomaly clicked:', anomaly);
    
    if (!anomaly.anomaly_id) {
      console.log('[DEBUG] No anomaly_id found, cannot fetch details');
      return;
    }

    setLoadingAnomalyDetails(true);
    setIsAnomalyPopupOpen(true);
    
    try {
      const anomalyDetails = await apiService.getAnomalyDetails(anomaly.anomaly_id);
      console.log('[DEBUG] Fetched anomaly details:', anomalyDetails);
      setSelectedAnomaly(anomalyDetails);
    } catch (error) {
      console.error('[DEBUG] Error fetching anomaly details:', error);
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

  if (loading) {
    return <div className="loading">Loading incident details...</div>;
  }

  if (!incident) {
    return <div className="error">Incident not found</div>;
  }

  return (
    <div className="incident-detail-page">
      <div className="incident-detail-header">
        <button onClick={() => navigate('/incidents')} className="back-btn">
          <ArrowLeft size={20} />
          Back to Incidents
        </button>
      </div>

      <div className="incident-detail-content">
        <div className="incident-main">
          <div className="incident-card">
            <div className="incident-header">
              <h1>Incident Detail <span className="incident-id">#{incident.id}</span></h1>
            </div>

            <div className="incident-summary">
              <div className="incident-info-row">
                <div className="info-section">
                  <div className="info-item">
                    <label>Status:</label>
                    <span className="status-open">{incident.status}</span>
                  </div>
                  <div className="info-item">
                    <label>User:</label>
                    <span>{incident.user}</span>
                  </div>
                </div>
                <div className="info-section">
                  <div className="info-item">
                    <label>Severity:</label>
                    <span className={`severity-value ${getSeverityClass(incident.severity)}`}>
                      {incident.severity}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Session:</label>
                    <span>{incident.session || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div className="scenario-info">
                <div className="scenario-title">
                  <label>Scenario:</label>
                  <span>{incident.scenario}</span>
                </div>
              </div>
            </div>

            <div className="description-section">
              <h3>Description</h3>
              <p>{incident.description}</p>
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
                  <p>No correlated anomalies found for this incident.</p>
                  <p><em>This may indicate a standalone incident or data correlation issue.</em></p>
                </div>
              )}
            </div>

            {/* Enhanced AI Runbook Suggestions Section */}
            {suggestedRunbooks && suggestedRunbooks.length > 0 && (
              <div className="suggested-runbooks-section">
                <div className="section-header">
                  <h3>🎯 AI-Suggested Runbooks</h3>
                  <div className="header-info">
                    <span className="runbook-count">
                      {suggestedRunbooks.length} intelligent matches found
                    </span>
                    <button 
                      className="toggle-btn"
                      onClick={() => setShowRunbookSuggestions(!showRunbookSuggestions)}
                    >
                      {showRunbookSuggestions ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                
                {showRunbookSuggestions && (
                  <div className="runbooks-enhanced-grid">
                    {suggestedRunbooks.map((runbook, index) => (
                      <div key={index} className="runbook-card-enhanced">
                        <div className="runbook-header">
                          <div className="runbook-title-section">
                            <h4>{runbook.name}</h4>
                            <span className={`runbook-type-badge ${runbook.runbook_type?.toLowerCase() || 'security'}`}>
                              {runbook.runbook_type || 'Security'}
                            </span>
                          </div>
                          <div className="relevance-section">
                            <div className="relevance-score">
                              <span className="percentage">{runbook.relevance_percentage || 0}%</span>
                              <div className="confidence-indicator">
                                <span className={`confidence-badge ${runbook.ai_confidence?.toLowerCase() || 'medium'}`}>
                                  {runbook.ai_confidence || 'Medium'} Confidence
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="relevance-bar">
                          <div 
                            className="relevance-fill" 
                            style={{
                              width: `${Math.min(runbook.relevance_percentage || 0, 100)}%`,
                              backgroundColor: 
                                (runbook.relevance_percentage || 0) >= 80 ? '#22c55e' :
                                (runbook.relevance_percentage || 0) >= 60 ? '#f59e0b' : 
                                (runbook.relevance_percentage || 0) >= 40 ? '#ef4444' : '#6b7280'
                            }}
                          ></div>
                        </div>
                        
                        <p className="runbook-description">{runbook.description}</p>
                        
                        {runbook.matching_factors && runbook.matching_factors.length > 0 && (
                          <div className="matching-factors">
                            <span className="factors-label">Why this matches:</span>
                            <ul className="factors-list">
                              {runbook.matching_factors.slice(0, 3).map((factor, idx) => (
                                <li key={idx} className="factor-item">• {factor}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="runbook-actions">
                          <button 
                            className="btn-primary"
                            onClick={() => {
                              // Create detailed runbook message for chat
                              const runbookDetails = {
                                id: Date.now() + index,
                                type: 'assistant',
                                content: `📋 **${runbook.name}** (${runbook.relevance_percentage}% match)\n\n**Description:**\n${runbook.description}\n\n**Investigation Steps:**\n${runbook.investigation_steps || 'Not specified'}\n\n**Response Actions:**\n${runbook.response_actions || 'Not specified'}\n\n**Matching Factors:**\n• ${runbook.matching_factors?.join('\n• ') || 'Standard incident response'}`,
                                timestamp: new Date()
                              };
                              setChatMessages(prev => [...prev, runbookDetails]);
                            }}
                          >
                            View Full Runbook
                          </button>
                          <button 
                            className="btn-secondary"
                            onClick={() => {
                              // Quick summary in chat
                              const quickSummary = {
                                id: Date.now() + index + 1000,
                                type: 'assistant',
                                content: `📋 **Quick Summary - ${runbook.name}**\n\nRelevance: ${runbook.relevance_percentage}% match\nConfidence: ${runbook.ai_confidence}\n\n${runbook.description}\n\nKey factors: ${runbook.matching_factors?.slice(0, 2).join(', ') || 'General security response'}`,
                                timestamp: new Date()
                              };
                              setChatMessages(prev => [...prev, quickSummary]);
                            }}
                          >
                            Quick Summary
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="incident-chat">
          <div className="chat-assistant">
            <div className="chat-header">
              <h3>Chat Assistant</h3>
            </div>
            
            <div className="chat-messages">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.type}`}
                >
                  <div className="message-content">
                    {message.type === 'suggestion-group' ? (
                      <div className="suggestion-group">
                        <ul className="suggestion-list">
                          {message.suggestions.map((suggestion, index) => (
                            <li key={index}>
                              <button 
                                className="suggestion-item-btn"
                                onClick={() => handleSuggestedClick(suggestion.replace('• ', ''))}
                              >
                                {suggestion}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : message.type === 'suggested-question' && message.clickable ? (
                      <button 
                        className="suggested-question-btn"
                        onClick={() => handleSuggestedClick(message.content)}
                      >
                        {message.content}
                      </button>
                    ) : message.type === 'suggestions' ? (
                      <div>
                        <p>{message.content}</p>
                        <ul>
                          {message.suggestions.map((suggestion, index) => (
                            <li key={index}>
                              <button 
                                className="suggestion-btn"
                                onClick={() => handleSuggestedClick(suggestion)}
                              >
                                {suggestion}
                              </button>
                            </li>
                          ))}
                        </ul>
                        <button 
                          className="run-playbook-btn"
                          onClick={() => handleSuggestedClick('Run Data Exfiltration playbook')}
                        >
                          Run playbook
                        </button>
                      </div>
                    ) : message.type === 'runbook-suggestions' ? (
                      <div className="runbook-suggestions">
                        <h4>Available Runbooks:</h4>
                        {message.runbooks.map((runbook, index) => (
                          <div key={index} className="runbook-item">
                            <div className="runbook-info">
                              <strong>{runbook.name}</strong>
                              <p>{runbook.description}</p>
                            </div>
                            <button 
                              className="run-playbook-btn"
                              onClick={() => handleRunPlaybook(runbook.name)}
                            >
                              Run playbook
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <p>{message.content}</p>
                        {message.showRunbooks && message.runbooks && message.runbooks.length > 0 && (
                          <div className="inline-runbooks">
                            <h5>Recommended Runbooks:</h5>
                            {message.runbooks.map((runbook, index) => (
                              <button 
                                key={index}
                                className="inline-runbook-btn"
                                onClick={() => handleRunPlaybook(runbook.name)}
                              >
                                {runbook.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              ))}
              
              {isLoadingChat && (
                <div className="message assistant loading">
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="analyst-notes-section">
              <div className="analyst-notes-header">
                <h4>Analyst Notes</h4>
                <span className="notes-help-text">Record your analysis and findings</span>
              </div>
              <div className="analyst-notes-content">
                <textarea
                  value={analystNotes}
                  onChange={(e) => setAnalystNotes(e.target.value)}
                  placeholder="Add your analysis notes here..."
                  className="notes-textarea"
                  rows="4"
                />
                <button 
                  onClick={handleSaveNotes}
                  className="save-notes-btn"
                  disabled={saveNotesLoading || !analystNotes.trim()}
                >
                  {saveNotesLoading ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>

            <div className="chat-input-container">
              <div className="chat-input">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your question or..."
                  disabled={isLoadingChat}
                  className="message-input"
                />
                <button 
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoadingChat}
                  className="send-button"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
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

export default IncidentDetail;
