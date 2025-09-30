import React, { useState, useRef, useEffect } from 'react';
import { apiService } from '../services/api';
import { Send } from 'lucide-react';

const RunbookChatAssistant = ({ className = '' }) => {
  const [messages, setMessages] = useState([]);
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
    // Welcome message with vector similarity search capabilities
    setMessages([{
      id: 1,
      type: 'assistant',
      content: "👋 **Runbook Assistant** (AI-Powered Vector Search)\n\nI can help you find relevant runbooks using similarity matching! Try:\n• 🔍 **Smart Search**: Find similar runbooks based on meaning\n• 📋 List available runbooks\n• ❓ How to create a runbook\n• 🎯 Get steps for specific scenarios\n\n**Vector Search** finds runbooks by semantic similarity, not just keywords!",
      timestamp: new Date(),
      suggestions: [
        "Find authentication runbooks",
        "Find data breach runbooks", 
        "Find malware response runbooks",
        "Show all runbooks",
        "How to create a runbook"
      ]
    }]);
  }, []);

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleSendMessage = async (messageText = null) => {
    const messageToSend = messageText || inputMessage.trim();
    if (!messageToSend || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Check if this is a vector similarity search request
      if (messageToSend.toLowerCase().includes('find authentication runbooks') || 
          messageToSend.toLowerCase().includes('authentication runbooks') ||
          (messageToSend.toLowerCase().includes('find') && messageToSend.toLowerCase().includes('authentication'))) {
        
        console.log('[RunbookChat] Using vector search for authentication runbooks');
        
        // Use vector similarity search for authentication-related queries
        const searchResponse = await apiService.findSimilarRunbooks('authentication security incident login credential access', 6);
        
        let assistantContent = "🔍 **Found Similar Authentication Runbooks** (Vector Similarity Search)\n\n";
        
        if (searchResponse.similar_runbooks && searchResponse.similar_runbooks.length > 0) {
          assistantContent += `Found ${searchResponse.total_found} runbooks ranked by similarity:\n\n`;
          
          searchResponse.similar_runbooks.forEach((runbook, index) => {
            const similarityPercent = (runbook.similarity_score * 100).toFixed(1);
            assistantContent += `**${index + 1}. ${runbook.name}** (${similarityPercent}% similarity)\n`;
            assistantContent += `📋 Type: ${runbook.runbook_type}\n`;
            assistantContent += `📝 ${runbook.description}\n`;
            
            if (runbook.investigation_steps_preview) {
              assistantContent += `🔍 Investigation: ${runbook.investigation_steps_preview}\n`;
            }
            
            if (runbook.response_actions_preview) {
              assistantContent += `⚡ Response: ${runbook.response_actions_preview}\n`;
            }
            
            assistantContent += "\n---\n\n";
          });
          
          assistantContent += "💡 Click on any runbook name in the Runbooks section to view full details!";
        } else {
          assistantContent += "No authentication-related runbooks found. You might want to:\n";
          assistantContent += "• Create authentication failure runbooks\n";
          assistantContent += "• Add login security procedures\n";
          assistantContent += "• Build credential compromise response plans";
        }
        
        const assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: assistantContent,
          timestamp: new Date(),
          searchResults: searchResponse.similar_runbooks || []
        };

        setMessages(prev => [...prev, assistantMessage]);
        
      } else if (messageToSend.toLowerCase().includes('find') && 
                 (messageToSend.toLowerCase().includes('runbooks') || messageToSend.toLowerCase().includes('runbook'))) {
        
        // Extract search terms for other types of runbook searches
        const searchTerms = messageToSend.toLowerCase()
          .replace(/find|runbooks?|for|about|related to/g, '')
          .trim();
          
        if (searchTerms.length > 2) {
          console.log(`[RunbookChat] Using vector search for: "${searchTerms}"`);
          
          const searchResponse = await apiService.findSimilarRunbooks(searchTerms, 5);
          
          let assistantContent = `🔍 **Found Similar Runbooks for "${searchTerms}"**\n\n`;
          
          if (searchResponse.similar_runbooks && searchResponse.similar_runbooks.length > 0) {
            assistantContent += `Found ${searchResponse.total_found} runbooks ranked by similarity:\n\n`;
            
            searchResponse.similar_runbooks.forEach((runbook, index) => {
              const similarityPercent = (runbook.similarity_score * 100).toFixed(1);
              assistantContent += `**${index + 1}. ${runbook.name}** (${similarityPercent}% similarity)\n`;
              assistantContent += `📋 Type: ${runbook.runbook_type}\n`;
              assistantContent += `📝 ${runbook.description}\n\n`;
            });
            
            assistantContent += "💡 Click on any runbook name to view full details!";
          } else {
            assistantContent += `No runbooks found matching "${searchTerms}". Try different keywords or create a new runbook.`;
          }
          
          const assistantMessage = {
            id: Date.now() + 1,
            type: 'assistant', 
            content: assistantContent,
            timestamp: new Date(),
            searchResults: searchResponse.similar_runbooks || []
          };

          setMessages(prev => [...prev, assistantMessage]);
        } else {
          // Fallback to regular chat for unclear search terms
          await handleRegularChatMessage(messageToSend);
        }
        
      } else {
        // Use regular chat for other messages
        await handleRegularChatMessage(messageToSend);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'Sorry, I encountered an error while searching. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegularChatMessage = async (messageToSend) => {
    const response = await apiService.sendChatMessage(messageToSend, sessionId);
    
    // Update session ID if changed
    if (response.session_id && response.session_id !== sessionId) {
      setSessionId(response.session_id);
    }
    
    const assistantMessage = {
      id: Date.now() + 1,
      type: 'assistant',
      content: response.response || 'I received your message but couldn\'t generate a response. Please try again.',
      timestamp: new Date()
    };

    // Handle interactive responses
    if (response.interactive_response) {
      assistantMessage.interactive_response = response.interactive_response;
    }

    setMessages(prev => [...prev, assistantMessage]);
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
    <div className={`runbook-chat-assistant ${className}`}>
      <div className="chat-header">
        <h3>Runbook Assistant</h3>
        <div className="chat-context-indicator">📚 Runbooks</div>
      </div>
      
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-content">
              <div style={{ whiteSpace: 'pre-line' }}>{message.content}</div>
              
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="chat-suggestions">
                  <p className="suggestions-label">💡 Quick actions:</p>
                  <div className="suggestions-list">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="suggestion-button"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {message.interactive_response && message.interactive_response.runbooks && (
                <div className="interactive-response">
                  <h4>📋 Suggested Runbooks:</h4>
                  {message.interactive_response.runbooks.map((runbook, index) => (
                    <div key={index} className="runbook-suggestion-item">
                      <strong>{runbook.name}</strong> ({runbook.relevance_score?.toFixed(1)}% match)
                      <p>{runbook.description}</p>
                    </div>
                  ))}
                </div>
              )}
              
              <span className="message-time">{formatTime(message.timestamp)}</span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message assistant">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
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
            placeholder="Ask about runbooks..."
            disabled={isLoading}
            className="message-input"
            rows="1"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="send-button"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RunbookChatAssistant;
