import React, { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { apiService } from '../services/api';

const AnomaliesListChatAssistant = () => {
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [anomalies, setAnomalies] = useState([]);

  // Initialize with anomalies summary and default messages
  useEffect(() => {
    console.log('[DEBUG] AnomaliesListChatAssistant useEffect triggered');
    console.trace('[DEBUG] Stack trace for useEffect trigger:');
    
    const initializeChat = async () => {
      let summaryText = 'Loading anomalies summary...';
      
      try {
        console.log('[DEBUG] About to call getAllAnomalies API');
        const anomaliesData = await apiService.getAllAnomalies();
        console.log('[DEBUG] Raw anomaliesData from API:', anomaliesData);
        
        // Check if anomaliesData is an array, otherwise, assume it's an object with an 'anomalies' key
        const actualAnomalies = Array.isArray(anomaliesData) ? anomaliesData : anomaliesData?.anomalies || [];
        
        setAnomalies(actualAnomalies);
        console.log('[DEBUG] getAllAnomalies API call completed', actualAnomalies.length, 'anomalies');
        
        const totalAnomalies = actualAnomalies.length;
        const highSeverity = actualAnomalies.filter(a => a.severity?.toLowerCase() === 'high').length;
        const mediumSeverity = actualAnomalies.filter(a => a.severity?.toLowerCase() === 'medium').length;
        const lowSeverity = actualAnomalies.filter(a => a.severity?.toLowerCase() === 'low').length;
        const criticalSeverity = actualAnomalies.filter(a => a.severity?.toLowerCase() === 'critical').length;
        const confirmedAnomalies = actualAnomalies.filter(a => a.false_positive?.toLowerCase() === 'no').length;
        const openAnomalies = actualAnomalies.filter(a => a.status?.toLowerCase() === 'open').length;
        
        summaryText = `📊 **Current Anomalies Overview:**\n\n• **Total Anomalies:** ${totalAnomalies}\n• **Status:** ${openAnomalies} Open, ${totalAnomalies - openAnomalies} Closed\n• **Confirmed:** ${confirmedAnomalies} anomalies\n\n**Severity Breakdown:**\n• 🔴 **Critical:** ${criticalSeverity}\n• 🟠 **High:** ${highSeverity}  \n• 🟡 **Medium:** ${mediumSeverity}\n• 🟢 **Low:** ${lowSeverity}\n\n**Key Insights:**\n• ${totalAnomalies > 0 ? ((highSeverity + criticalSeverity) / totalAnomalies * 100).toFixed(1) : 0}% are high/critical severity\n• ${totalAnomalies > 0 ? (confirmedAnomalies / totalAnomalies * 100).toFixed(1) : 0}% are confirmed threats\n• ${totalAnomalies > 0 ? (openAnomalies / totalAnomalies * 100).toFixed(1) : 0}% require immediate attention`;
        
      } catch (error) {
        console.error('Error fetching anomalies for summary:', error);
        summaryText = `❌ Unable to fetch anomalies summary: ${error.message || 'Unknown error'}. Please check your connection.`;
      }

      setChatMessages([
        {
          id: 1,
          type: 'user',
          text: 'What\'s the current anomalies overview and severity breakdown?',
          timestamp: new Date().toLocaleTimeString()
        },
        {
          id: 2,
          type: 'assistant',
          text: summaryText,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    };

    initializeChat();
  }, []);

  const buildAnomaliesContext = () => {
    const totalAnomalies = anomalies.length;
    const highSeverity = anomalies.filter(a => a.severity?.toLowerCase() === 'high').length;
    const mediumSeverity = anomalies.filter(a => a.severity?.toLowerCase() === 'medium').length;
    const lowSeverity = anomalies.filter(a => a.severity?.toLowerCase() === 'low').length;
    const criticalSeverity = anomalies.filter(a => a.severity?.toLowerCase() === 'critical').length;
    const confirmedAnomalies = anomalies.filter(a => a.false_positive?.toLowerCase() === 'no').length;
    const openAnomalies = anomalies.filter(a => a.status?.toLowerCase() === 'open').length;

    return `ANOMALIES OVERVIEW:

Total Anomalies: ${totalAnomalies}
Critical Severity: ${criticalSeverity}
High Severity: ${highSeverity}
Medium Severity: ${mediumSeverity}
Low Severity: ${lowSeverity}
Confirmed: ${confirmedAnomalies}
Open Status: ${openAnomalies}

Please provide analysis based on the current anomalies overview and trends.`;
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

  return (
    <div className="anomalies-chat-assistant">
      <div className="chat-header">
        <h3>
          <MessageSquare size={20} />
          🤖 Anomalies AI Assistant
        </h3>
      </div>
      
      <div className="chat-messages">
        {chatMessages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <p style={{ whiteSpace: 'pre-line' }}>{message.text}</p>
            <span className="timestamp">{message.timestamp}</span>
          </div>
        ))}
        {chatLoading && (
          <div className="message assistant loading">
            <p>🤔 Analyzing anomalies data...</p>
          </div>
        )}
      </div>
      
      <div className="chat-input-container">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your question or ask about anomalies..."
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
  );
};

export default AnomaliesListChatAssistant;

