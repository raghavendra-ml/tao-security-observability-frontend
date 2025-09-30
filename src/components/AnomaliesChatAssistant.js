import React, { useState, useEffect } from 'react';
import { MessageSquare, Settings, FileText, Send } from 'lucide-react';
import { apiService } from '../services/api';

const AnomaliesChatAssistant = ({ selectedAnomalies = [], anomalies = [], onAnomaliesUpdate, currentAnomalyId = null }) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [analystNotes, setAnalystNotes] = useState('');
  const [saveNotesLoading, setSaveNotesLoading] = useState(false);
  const [localAnomalies, setLocalAnomalies] = useState([]);
  const [localSelectedAnomalies, setLocalSelectedAnomalies] = useState([]);

  // Fetch anomalies data if not provided
  useEffect(() => {
    const fetchAnomaliesData = async () => {
      if (anomalies.length === 0) {
        try {
          const fetchedAnomalies = await apiService.getAllAnomalies();
          setLocalAnomalies(fetchedAnomalies);
        } catch (error) {
          console.error('Error fetching anomalies:', error);
        }
      }
    };

    fetchAnomaliesData();
  }, [anomalies]);

  // Use provided data or local data
  const effectiveAnomalies = anomalies.length > 0 ? anomalies : localAnomalies;
  const effectiveSelectedAnomalies = selectedAnomalies.length > 0 ? selectedAnomalies : localSelectedAnomalies;

  // Initialize with welcome message
  useEffect(() => {
    setChatMessages([
      {
        id: 1,
        type: 'assistant',
        text: '👋 Welcome! I can help you analyze anomalies and provide insights. Select anomalies from the table or ask me general questions about your security data.',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  }, []);

  const buildAnomaliesContext = () => {
    // Handle current anomaly ID case
    if (currentAnomalyId) {
      const currentAnomaly = effectiveAnomalies.find(a => a.anomaly_id === currentAnomalyId);
      if (currentAnomaly) {
        return `CURRENT ANOMALY ANALYSIS:

ANOMALY: ${currentAnomaly.anomaly_id}
User: ${currentAnomaly.user || 'Unknown'}
Type: ${currentAnomaly.anomaly_type || 'Unknown'} - ${currentAnomaly.anomaly_subtype || 'Unknown'}
Severity: ${currentAnomaly.severity || 'Medium'}
Status: ${currentAnomaly.status || 'Open'}
Source IP: ${currentAnomaly.source_ip || 'N/A'}
Destination IP: ${currentAnomaly.destination_ip || 'N/A'}
Summary: ${currentAnomaly.anomaly_summary || 'No summary available'}

ANALYST NOTES:
${analystNotes || 'No analyst notes available'}

Please provide detailed analysis for this specific anomaly.`;
      }
    }

    // Handle selected anomalies case
    const selectedAnomaliesData = effectiveAnomalies.filter(a => effectiveSelectedAnomalies.includes(a.anomaly_id));
    
    if (selectedAnomaliesData.length === 0) {
      return `ANOMALIES OVERVIEW:

Total Anomalies: ${effectiveAnomalies.length}
High Severity: ${effectiveAnomalies.filter(a => a.severity?.toLowerCase() === 'high').length}
Confirmed: ${effectiveAnomalies.filter(a => a.false_positive?.toLowerCase() === 'no').length}

ANALYST NOTES:
${analystNotes || 'No analyst notes available'}

Please provide analysis based on the current anomalies overview.`;
    }

    const anomaliesDetails = selectedAnomaliesData.map(a => 
      `${a.anomaly_id} - User: ${a.user || 'Unknown'} - Type: ${a.anomaly_type || 'Unknown'} - Severity: ${a.severity || 'Medium'} - Status: ${a.status || 'Open'}`
    ).join('\n  - ');

    return `SELECTED ANOMALIES ANALYSIS:

ANOMALIES SELECTED (${selectedAnomaliesData.length}):
  - ${anomaliesDetails}

ANALYST NOTES:
${analystNotes || 'No analyst notes available'}

Please provide comprehensive analysis based on these selected anomalies.`;
  };

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setChatLoading(true);

    try {
      const context = buildAnomaliesContext();
      const response = await apiService.sendChatMessage(messageText, null, context);
      
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        text: response.response || 'No response received',
        timestamp: new Date().toLocaleTimeString()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleMarkFalsePositive = async () => {
    const targetAnomalies = currentAnomalyId ? [currentAnomalyId] : effectiveSelectedAnomalies;
    
    if (targetAnomalies.length === 0) {
      alert('Please select anomalies to mark as false positive.');
      return;
    }
    
    try {
      await apiService.updateAnomaliesFalsePositive(targetAnomalies, true);
      alert(`✅ Marked ${targetAnomalies.length} anomalies as False Positive!`);
      if (onAnomaliesUpdate) onAnomaliesUpdate();
    } catch (error) {
      console.error('Error marking as False Positive:', error);
      alert('❌ Error marking anomalies. Please try again.');
    }
  };

  const handleChangeSeverity = async () => {
    const targetAnomalies = currentAnomalyId ? [currentAnomalyId] : effectiveSelectedAnomalies;
    
    if (targetAnomalies.length === 0) {
      alert('Please select anomalies to change severity.');
      return;
    }

    const newSeverity = prompt('Enter new severity (Low, Medium, High, Critical):', 'Medium');
    if (newSeverity && ['Low', 'Medium', 'High', 'Critical'].includes(newSeverity)) {
      try {
        await apiService.updateAnomaliesSeverity(targetAnomalies, newSeverity);
        alert(`✅ Updated severity to ${newSeverity} for ${targetAnomalies.length} anomalies!`);
        if (onAnomaliesUpdate) onAnomaliesUpdate();
      } catch (error) {
        console.error('Error changing severity:', error);
        alert('❌ Error updating severity. Please try again.');
      }
    } else if (newSeverity) {
      alert('Invalid severity level. Please use Low, Medium, High, or Critical.');
    }
  };

  const handleChangeStatus = async () => {
    const targetAnomalies = currentAnomalyId ? [currentAnomalyId] : effectiveSelectedAnomalies;
    
    if (targetAnomalies.length === 0) {
      alert('Please select anomalies to change status.');
      return;
    }

    const newStatus = prompt('Enter new status (Open, Closed, In Progress, Under Review):', 'Open');
    if (newStatus && ['Open', 'Closed', 'In Progress', 'Under Review'].includes(newStatus)) {
      try {
        await apiService.updateAnomaliesStatus(targetAnomalies, newStatus);
        alert(`✅ Updated status to ${newStatus} for ${targetAnomalies.length} anomalies!`);
        if (onAnomaliesUpdate) onAnomaliesUpdate();
      } catch (error) {
        console.error('Error changing status:', error);
        alert('❌ Error updating status. Please try again.');
      }
    } else if (newStatus) {
      alert('Invalid status. Please use Open, Closed, In Progress, or Under Review.');
    }
  };

  const handleSaveNotes = async () => {
    if (!analystNotes.trim()) {
      alert('Please enter some notes before saving.');
      return;
    }

    setSaveNotesLoading(true);
    try {
      await apiService.saveAnomaliesAnalystNotes(analystNotes);
      alert('✅ Analyst notes saved successfully!');
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('❌ Error saving notes. Please try again.');
    } finally {
      setSaveNotesLoading(false);
    }
  };

  return (
    <div className="anomalies-chat-assistant" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="chat-header">
        <h3>
          <MessageSquare size={20} />
          Anomalies Assistant
        </h3>
        <div className="selected-count">
          {effectiveSelectedAnomalies.length > 0 && (
            <span className="selected-badge">
              {effectiveSelectedAnomalies.length} selected
            </span>
          )}
        </div>
      </div>
      
      {/* Top Half: Chat Interface */}
      <div className="chat-section" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div className="chat-messages" style={{ flexGrow: 1, overflowY: 'auto' }}>
          {chatMessages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <p>{message.text}</p>
              <span className="timestamp">{message.timestamp}</span>
            </div>
          ))}
          {chatLoading && (
            <div className="message assistant loading">
              <p>🤔 Analyzing...</p>
            </div>
          )}
        </div>
        
        <div className="chat-input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about selected anomalies or general analysis..."
            className="chat-input"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || chatLoading}
            className="send-button"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Bottom Half: Management Actions */}
      <div className="management-section">
        {/* Management Actions */}
        <div className="management-actions">
          <div className="actions-header">
            <h4>
              <Settings size={16} />
              Management Actions
            </h4>
            <p className="actions-subtitle">
              {currentAnomalyId 
                ? `Managing current anomaly` 
                : effectiveSelectedAnomalies.length > 0 
                  ? `${effectiveSelectedAnomalies.length} anomalies selected`
                  : 'Select anomalies to perform actions'
              }
            </p>
          </div>
          <div className="actions-buttons">
            <button 
              onClick={handleMarkFalsePositive} 
              className="action-btn false-positive"
              disabled={!currentAnomalyId && effectiveSelectedAnomalies.length === 0}
            >
              Mark as False Positive
            </button>
            <button 
              onClick={handleChangeSeverity} 
              className="action-btn change-severity"
              disabled={!currentAnomalyId && effectiveSelectedAnomalies.length === 0}
            >
              Change Severity
            </button>
            <button 
              onClick={handleChangeStatus} 
              className="action-btn change-status"
              disabled={!currentAnomalyId && effectiveSelectedAnomalies.length === 0}
            >
              Change Status
            </button>
          </div>
        </div>

        {/* Analyst Notes */}
        <div className="analyst-notes-section">
          <div className="notes-header">
            <h4>
              <FileText size={16} />
              Analyst Notes
            </h4>
          </div>
          <div className="notes-content">
            <textarea
              value={analystNotes}
              onChange={(e) => setAnalystNotes(e.target.value)}
              placeholder="Add your analysis notes here..."
              className="notes-textarea"
              rows="3"
            />
            <button
              onClick={handleSaveNotes}
              disabled={!analystNotes.trim() || saveNotesLoading}
              className="save-notes-btn"
            >
              {saveNotesLoading ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnomaliesChatAssistant;
