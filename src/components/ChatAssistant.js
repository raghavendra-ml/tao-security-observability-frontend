import React, { useState, useRef, useEffect } from 'react';
import { apiService } from '../services/api';

const ChatAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Send initial chat query when component mounts  
    sendInitialQuery();
  }, []);

  const sendInitialQuery = async () => {
    try {
      setIsLoadingInitial(true);
      
      const initialQuery = "Can you provide me with current incident statistics including total count, breakdown by severity levels, and current status distribution?";
      
      // First try to get summary data directly for immediate response
      try {
        console.log('Fetching incidents summary...');
        const summaryResponse = await apiService.getIncidentsSummary();
        console.log('Summary response:', summaryResponse);
        
        if (summaryResponse && typeof summaryResponse === 'object') {
          const { total, severity, status } = summaryResponse;
          console.log('Extracted data:', { total, severity, status });
          
          // Format the response like the working version
          let formattedResponse = `• Total: ${total || 0} incidents (matches dashboard)\n• Severity: ${severity?.high || 0} High, ${severity?.medium || 0} Medium, ${severity?.low || 0} Low\n• Status: `;
          
          // Handle status with proper labels - filter out undefined/zero values
          const statusParts = [];
          if (status?.open > 0) statusParts.push(`${status.open} Open`);
          if (status?.closed > 0) statusParts.push(`${status.closed} Closed`);
          if (status?.new > 0) statusParts.push(`${status.new} New`);
          if (status?.in_progress > 0) statusParts.push(`${status.in_progress} In Progress`);
          if (status?.resolved > 0) statusParts.push(`${status.resolved} Resolved`);
          
          // If no specific status found, show what we have
          if (statusParts.length === 0) {
            Object.entries(status || {}).forEach(([key, value]) => {
              if (value > 0) {
                statusParts.push(`${value} ${key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}`);
              }
            });
          }
          
          formattedResponse += statusParts.length > 0 ? statusParts.join(', ') : 'No status data available';
          
          const initialMessages = [
            {
              id: 1,
              type: 'user',
              content: initialQuery,
              timestamp: new Date()
            },
            {
              id: 2,
              type: 'assistant',
              content: formattedResponse,
              timestamp: new Date()
            }
          ];

          setMessages(initialMessages);
          return;
        }
      } catch (summaryError) {
        console.error('Summary endpoint failed, trying chat endpoint:', summaryError);
      }
      
      // Fallback to chat endpoint
      const response = await apiService.sendChatMessage(initialQuery, sessionId);
      console.log('[Chat] Initial query response:', response);
      
      // Store session ID if returned
      if (response.session_id) {
        console.log('[Chat] Setting session ID from initial response:', response.session_id);
        setSessionId(response.session_id);
      }
      
      const initialMessages = [
        {
          id: 1,
          type: 'user',
          content: initialQuery,
          timestamp: new Date()
        },
        {
          id: 2,
          type: 'assistant',
          content: response.response || 'Unable to fetch incident statistics at this time.',
          timestamp: new Date()
        }
      ];

      setMessages(initialMessages);
    } catch (error) {
      console.error('Error sending initial query:', error);
      
      const fallbackMessages = [
        {
          id: 1,
          type: 'user',
          content: 'Can you provide me with current incident statistics including total count, breakdown by severity levels, and current status distribution?',
          timestamp: new Date()
        },
        {
          id: 2,
          type: 'assistant',
          content: 'Unable to fetch incident statistics at this time.',
          timestamp: new Date()
        }
      ];

      setMessages(fallbackMessages);
    } finally {
      setIsLoadingInitial(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('[Chat] Sending message to backend:', inputMessage.trim());
      console.log('[Chat] Current session ID:', sessionId);
      const response = await apiService.sendChatMessage(inputMessage.trim(), sessionId);
      console.log('[Chat] Received response from backend:', response);
      console.log('[Chat] Response type:', typeof response);
      console.log('[Chat] Response.response:', response.response);
      
      // Store session ID if returned (new session created or updated)
      if (response.session_id && response.session_id !== sessionId) {
        console.log('[Chat] Updating session ID:', response.session_id);
        setSessionId(response.session_id);
      }
      
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response.response || 'I received your message but couldn\'t generate a response. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-assistant">
      <div className="chat-header">
        <h3>Chat Assistant</h3>
      </div>
      
      <div className="chat-messages">
        {isLoadingInitial ? (
          <div className="message assistant">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-content">
                <p>{message.content}</p>
              </div>
            </div>
          ))
        )}
        
        {isLoading && !isLoadingInitial && (
          <div className="message assistant">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="chat-input">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question or..."
            disabled={isLoading || isLoadingInitial}
            className="message-input"
            rows="1"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || isLoadingInitial}
            className="send-button"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
