import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Check, AlertTriangle, PlayCircle, MessageSquare, ChevronRight } from 'lucide-react';
import { apiService } from '../services/api';
import './AddRunbook.css';

const AddRunbook = () => {
  const navigate = useNavigate();
  const [runbookName, setRunbookName] = useState('');
  const [steps, setSteps] = useState([]);
  const [activeStepType, setActiveStepType] = useState('investigation');
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // Generate contextual suggestions based on runbook name and type
  const getContextualSuggestions = (name) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('threat hunting') || lowerName.includes('hunting')) {
      return {
        investigation: [
          'Analyze network traffic for suspicious patterns',
          'Hunt for persistence mechanisms',
          'Check for lateral movement indicators',
          'Review DNS queries for C2 communication'
        ],
        response: [
          'Isolate suspicious hosts',
          'Preserve evidence and memory dumps',
          'Block malicious domains/IPs',
          'Initiate incident response procedures'
        ]
      };
    } else if (lowerName.includes('login') || lowerName.includes('authentication')) {
      return {
        investigation: [
          'Analyze login attempts for brute force',
          'Check sign-in location for unusual IPs',
          'Determine user account status',
          'Review authentication logs'
        ],
        response: [
          'Disable compromised accounts',
          'Force password reset',
          'Block suspicious IP addresses',
          'Enable additional monitoring'
        ]
      };
    } else if (lowerName.includes('malware') || lowerName.includes('virus')) {
      return {
        investigation: [
          'Analyze file hashes and signatures',
          'Check process execution chains',
          'Review network connections',
          'Scan for additional indicators'
        ],
        response: [
          'Quarantine infected systems',
          'Clean malware artifacts',
          'Update antivirus signatures',
          'Notify security team'
        ]
      };
    } else {
      return {
        investigation: [
          'Gather initial evidence',
          'Identify affected systems',
          'Analyze log data',
          'Document timeline'
        ],
        response: [
          'Contain the incident',
          'Preserve evidence',
          'Notify stakeholders',
          'Begin remediation'
        ]
      };
    }
  };

  // Update chat messages when runbook name changes
  React.useEffect(() => {
    if (runbookName.trim()) {
      const suggestions = getContextualSuggestions(runbookName);
      setChatMessages([
        {
          type: 'assistant',
          content: `Great! I'm helping you build a "${runbookName}" runbook. What steps would you like to include?`
        },
        {
          type: 'recommendation',
          title: 'Recommended Investigation Steps',
          items: suggestions.investigation,
          stepType: 'investigation'
        },
        {
          type: 'recommendation',
          title: 'Recommended Response Actions',
          items: suggestions.response,
          stepType: 'response'
        },
        {
          type: 'question',
          content: 'Would you like me to suggest more specific steps based on your scenario?'
        }
      ]);
    } else {
      setChatMessages([
        {
          type: 'assistant',
          content: 'Enter a runbook name to get started. I\'ll provide contextual suggestions based on your security scenario.'
        }
      ]);
    }
  }, [runbookName]);

  // Update suggestions when steps are added/modified
  React.useEffect(() => {
    if (runbookName.trim() && steps.length > 0) {
      const hasInvestigation = steps.some(step => step.type === 'investigation');
      const hasResponse = steps.some(step => step.type === 'response');
      
      let newSuggestions = [];
      
      if (!hasInvestigation) {
        newSuggestions.push({
          type: 'suggestion',
          content: '💡 Consider adding Investigation steps to gather evidence first'
        });
      }
      
      if (!hasResponse) {
        newSuggestions.push({
          type: 'suggestion',
          content: '💡 Don\'t forget Response steps to handle the incident'
        });
      }
      
      if (steps.length >= 3 && !steps.some(step => step.type === 'end')) {
        newSuggestions.push({
          type: 'suggestion',
          content: '💡 Add an End step to wrap up your runbook'
        });
      }
      
      if (newSuggestions.length > 0) {
        setChatMessages(prev => [...prev.slice(0, 4), ...newSuggestions]);
      }
    }
  }, [steps, runbookName]);

  const stepTypes = [
    { key: 'investigation', label: 'Investigation', icon: AlertTriangle, color: '#1e40af' },
    { key: 'response', label: 'Response', icon: PlayCircle, color: '#dc2626' },
    { key: 'conditional', label: 'Conditional', icon: ChevronRight, color: '#7c2d12' },
    { key: 'end', label: 'End', icon: Check, color: '#166534' }
  ];

  const defaultStepContent = {
    investigation: {
      title: 'Gather Evidence',
      items: [
        'Check for Brute Force',
        'Failed logins > 50',
        'Over 15 min period',
        'Severity ≥ Medium'
      ]
    },
    response: {
      title: 'Immediate Response',
      items: [
        'Isolate affected systems',
        'Preserve evidence',
        'Notify stakeholders',
        'Begin containment'
      ]
    },
    conditional: {
      title: 'Decision Point',
      items: [
        'If severity is High',
        'Escalate to incident commander',
        'Otherwise continue investigation',
        'Document decision rationale'
      ]
    },
    end: {
      title: 'Resolution',
      items: [
        'Document lessons learned',
        'Update procedures',
        'Close incident',
        'Report to management'
      ]
    }
  };

  const addStep = (type) => {
    const newStep = {
      id: Date.now(),
      type: type,
      title: defaultStepContent[type].title,
      items: [...defaultStepContent[type].items],
      isEditing: false
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (stepId) => {
    setSteps(steps.filter(step => step.id !== stepId));
  };

  const updateStepTitle = (stepId, newTitle) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, title: newTitle } : step
    ));
  };

  const updateStepItem = (stepId, itemIndex, newValue) => {
    setSteps(steps.map(step => {
      if (step.id === stepId) {
        const newItems = [...step.items];
        newItems[itemIndex] = newValue;
        return { ...step, items: newItems };
      }
      return step;
    }));
  };

  const addStepItem = (stepId) => {
    setSteps(steps.map(step => {
      if (step.id === stepId) {
        return { ...step, items: [...step.items, 'New item'] };
      }
      return step;
    }));
  };

  const removeStepItem = (stepId, itemIndex) => {
    setSteps(steps.map(step => {
      if (step.id === stepId) {
        const newItems = step.items.filter((_, index) => index !== itemIndex);
        return { ...step, items: newItems };
      }
      return step;
    }));
  };

  const formatStepsForDatabase = () => {
    // Convert steps array to formatted strings for database storage
    let investigationSteps = '';
    let responseActions = '';
    
    steps.forEach((step) => {
      let stepText = `**${step.title}**\n`;
      step.items.forEach((item) => {
        stepText += `• ${item}\n`;
      });
      stepText += '\n';
      
      if (step.type === 'investigation' || step.type === 'conditional') {
        investigationSteps += stepText;
      } else if (step.type === 'response' || step.type === 'end') {
        responseActions += stepText;
      }
    });
    
    return {
      investigation_steps: investigationSteps.trim(),
      response_actions: responseActions.trim()
    };
  };

  const handleSave = async (includeRecommendations = false) => {
    if (!runbookName.trim()) {
      alert('Please enter a runbook name');
      return;
    }

    // Auto-add recommendation steps if requested
    if (includeRecommendations && steps.length === 0) {
      const suggestions = getContextualSuggestions(runbookName);
      
      // Add investigation steps
      const investigationStep = {
        id: Date.now(),
        type: 'investigation',
        title: 'Investigation Procedures',
        items: suggestions.investigation,
        isEditing: false
      };
      
      // Add response steps
      const responseStep = {
        id: Date.now() + 1,
        type: 'response', 
        title: 'Response Actions',
        items: suggestions.response,
        isEditing: false
      };
      
      setSteps([investigationStep, responseStep]);
      
      // Add confirmation message
      setChatMessages(prev => [...prev, {
        type: 'assistant',
        content: '✅ Auto-added recommended steps to your runbook! You can edit them before saving.'
      }]);
      
      return; // Let user review the auto-added steps before saving
    }

    if (steps.length === 0) {
      alert('Please add at least one step. Click "Save with Recommendations" to auto-add suggested steps.');
      return;
    }

    setLoading(true);
    try {
      const formattedSteps = formatStepsForDatabase();
      const runbookData = {
        name: runbookName,
        description: `Interactive runbook: ${runbookName}`,
        investigation_steps: formattedSteps.investigation_steps,
        response_actions: formattedSteps.response_actions,
        runbook_type: 'Security',
        automation_possible: false
      };

      console.log('Sending runbook data:', runbookData); // Debug log

      await apiService.createRunbook(runbookData);
      
      // Success message with details
      const stepCount = steps.length;
      const investigationCount = steps.filter(s => s.type === 'investigation').length;
      const responseCount = steps.filter(s => s.type === 'response').length;
      
      alert(`Runbook "${runbookName}" created successfully!\n\nIncluded ${stepCount} steps:\n• ${investigationCount} Investigation steps\n• ${responseCount} Response actions`);
      navigate('/runbooks');
    } catch (error) {
      console.error('Error saving runbook:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Error saving runbook. Please try again.';
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

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, {
      type: 'user',
      content: userMessage
    }]);

    const originalInput = chatInput;
    setChatInput('');

    try {
      // Use the actual backend chat API for runbook assistance
      const response = await apiService.sendChatMessage(userMessage, null);
      
      let assistantResponse = {
        type: 'assistant',
        content: response.response || 'I received your message but couldn\'t generate a response. Please try again.'
      };

      // If it's a successful runbook response, format it nicely
      if (response.response && response.response.length > 100) {
        assistantResponse.content = response.response;
      } else {
        // Fallback to local processing for specific UI actions
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('add') || lowerMessage.includes('suggest') || lowerMessage.includes('include')) {
          const suggestions = getContextualSuggestions(runbookName || 'general');
          assistantResponse = {
            type: 'assistant',
            content: 'Here are some specific steps I recommend for your runbook:'
          };
          
          setChatMessages(prev => [...prev, assistantResponse, {
            type: 'recommendation',
            title: 'Click any item to add it as a step',
            items: [...suggestions.investigation, ...suggestions.response],
            clickable: true
          }]);
          return;
        } else if (lowerMessage.includes('help') || lowerMessage.includes('guide')) {
          assistantResponse = {
            type: 'assistant',
            content: '🔧 To build your runbook:\n1. Enter a descriptive name\n2. Click Investigation/Response buttons to add steps\n3. Edit step details by clicking on them\n4. Save when complete!'
          };
        } else if (lowerMessage.includes('save') || lowerMessage.includes('complete')) {
          assistantResponse = {
            type: 'assistant',
            content: steps.length > 0 ? 
              'Your runbook looks good! Click the Save button to store it.' :
              'Add some steps first, then you can save your runbook.'
          };
        }
      }

      setChatMessages(prev => [...prev, assistantResponse]);

    } catch (error) {
      console.error('Chat API error:', error);
      
      // Fallback to enhanced local processing if API fails
      const lowerMessage = userMessage.toLowerCase();
      let response = {};
      
      if (lowerMessage.includes('add') || lowerMessage.includes('suggest') || lowerMessage.includes('include')) {
        const suggestions = getContextualSuggestions(runbookName || 'general');
        response = {
          type: 'assistant',
          content: 'Here are some specific steps I recommend for your runbook:'
        };
        
        setChatMessages(prev => [...prev, response, {
          type: 'recommendation',
          title: 'Click any item to add it as a step',
          items: [...suggestions.investigation, ...suggestions.response],
          clickable: true
        }]);
      } else if (lowerMessage.includes('help') || lowerMessage.includes('guide')) {
        response = {
          type: 'assistant',
          content: '🔧 To build your runbook:\n1. Enter a descriptive name\n2. Click Investigation/Response buttons to add steps\n3. Edit step details by clicking on them\n4. Save when complete!\n\nI can also provide complete guidance for security incidents - try asking "Help with data breach response" or similar!'
        };
        setChatMessages(prev => [...prev, response]);
      } else if (lowerMessage.includes('save') || lowerMessage.includes('create') || lowerMessage.includes('build')) {
        const hasSteps = steps.length > 0;
        const hasName = runbookName.trim().length > 0;
        
        if (hasName && hasSteps) {
          response = {
            type: 'assistant',
            content: '✅ Your runbook looks ready! Click the "Save" button to store it with your current steps.'
          };
        } else if (hasName && !hasSteps) {
          response = {
            type: 'assistant',
            content: `🚀 Ready to build "${runbookName}"! You can:\n\n1. Click "Save with Recommendations" to auto-add suggested steps\n2. Or manually add steps using the buttons on the left\n\nWant me to suggest specific steps?`
          };
        } else {
          response = {
            type: 'assistant',
            content: '📝 To save a runbook:\n1. Enter a runbook name first\n2. Add steps (or I can suggest them)\n3. Click Save\n\nWhat should we call this runbook?'
          };
        }
        setChatMessages(prev => [...prev, response]);
      } else {
        // Enhanced default response with examples and context
        const hasName = runbookName.trim().length > 0;
        let responseContent = '🎯 I can provide complete runbook guidance! Try:\n\n';
        responseContent += '• "Help with data breach response"\n';
        responseContent += '• "Authentication failure steps"\n';
        responseContent += '• "Malware incident procedures"\n';
        responseContent += '• "Network intrusion response"\n\n';
        
        if (hasName) {
          responseContent += `Or ask me to help specifically with "${runbookName}" procedures!`;
        } else {
          responseContent += 'Or tell me what type of runbook you want to build!';
        }
        
        response = {
          type: 'assistant',
          content: responseContent
        };
        setChatMessages(prev => [...prev, response]);
      }
    }
  };

  // Handle clicking on recommendation items to add them as steps
  const handleRecommendationClick = (item, stepType = 'investigation') => {
    // Auto-detect step type based on content if not specified
    let detectedType = stepType;
    const lowerItem = item.toLowerCase();
    
    if (lowerItem.includes('disable') || lowerItem.includes('block') || lowerItem.includes('isolate') || 
        lowerItem.includes('reset') || lowerItem.includes('force') || lowerItem.includes('enable') ||
        lowerItem.includes('alert') || lowerItem.includes('notify') || lowerItem.includes('revoke')) {
      detectedType = 'response';
    } else if (lowerItem.includes('analyze') || lowerItem.includes('check') || lowerItem.includes('review') ||
               lowerItem.includes('determine') || lowerItem.includes('identify') || lowerItem.includes('verify')) {
      detectedType = 'investigation';
    }

    // Check if we already have a step of this type, if so add to existing
    const existingStep = steps.find(s => s.type === detectedType);
    
    if (existingStep && !existingStep.items.includes(item)) {
      // Add to existing step
      setSteps(prev => prev.map(step => 
        step.id === existingStep.id 
          ? { ...step, items: [...step.items, item] }
          : step
      ));
    } else if (!existingStep) {
      // Create new step
      const newStep = {
        id: Date.now(),
        type: detectedType,
        title: detectedType === 'investigation' ? 'Investigation Procedures' : 'Response Actions', 
        items: [item],
        isEditing: false
      };
      setSteps(prev => [...prev, newStep]);
    }
    
    // Add confirmation message
    setChatMessages(prev => [...prev, {
      type: 'assistant',
      content: `✅ Added "${item}" as a ${detectedType} step! ${existingStep ? 'Added to existing step.' : 'Created new step.'}`
    }]);
  };

  const StepTypeIcon = ({ type }) => {
    const stepType = stepTypes.find(st => st.key === type);
    const IconComponent = stepType?.icon || AlertTriangle;
    return <IconComponent size={16} style={{ color: stepType?.color || '#666' }} />;
  };

  return (
    <div className="add-runbook-page">
      {/* Left Sidebar */}
      <div className="runbook-sidebar">
        <div className="build-section">
          <h2>Build New Runbook</h2>
          
          <div className="runbook-name-input">
            <input
              type="text"
              placeholder="Suspicious Login Investigation"
              value={runbookName}
              onChange={(e) => setRunbookName(e.target.value)}
              className="form-input"
            />
          </div>

          <button 
            onClick={() => handleSave(false)}
            disabled={loading || !runbookName.trim() || steps.length === 0}
            className="save-btn"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>

          {steps.length === 0 && runbookName.trim() && (
            <button 
              onClick={() => handleSave(true)}
              disabled={loading}
              className="save-with-recommendations-btn"
            >
              Save with Recommendations
            </button>
          )}
        </div>

        <div className="step-types">
          {stepTypes.map(stepType => (
            <button
              key={stepType.key}
              onClick={() => addStep(stepType.key)}
              className={`step-type-btn ${stepType.key}`}
              style={{ backgroundColor: stepType.color }}
            >
              <stepType.icon size={16} />
              {stepType.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="runbook-main">
        <div className="runbook-header">
          <button onClick={() => navigate('/runbooks')} className="close-btn">
            <X size={20} />
          </button>
          <h1>Threat Hunting</h1>
        </div>

        <div className="steps-container">
          {steps.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Plus size={48} />
              </div>
              <h3>Start Building Your Runbook</h3>
              <p>Add steps using the buttons on the left to create your interactive runbook</p>
            </div>
          ) : (
            steps.map((step, index) => (
              <div key={step.id} className="step-card">
                <div className="step-header">
                  <div className="step-title-section">
                    <StepTypeIcon type={step.type} />
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => updateStepTitle(step.id, e.target.value)}
                      className="step-title-input"
                    />
                  </div>
                  <button onClick={() => removeStep(step.id)} className="remove-step-btn">
                    <X size={16} />
                  </button>
                </div>

                <div className="step-content">
                  <div className="step-items">
                    {step.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="step-item">
                        <input
                          type="checkbox"
                          className="step-checkbox"
                        />
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateStepItem(step.id, itemIndex, e.target.value)}
                          className="step-item-input"
                        />
                        <button 
                          onClick={() => removeStepItem(step.id, itemIndex)}
                          className="remove-item-btn"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => addStepItem(step.id)}
                    className="add-item-btn"
                  >
                    <Plus size={14} />
                    Add item
                  </button>
                </div>
              </div>
            ))
          )}

          {steps.length > 0 && (
            <button onClick={() => addStep('investigation')} className="add-step-btn">
              <Plus size={16} />
              Add step
            </button>
          )}
        </div>
      </div>

      {/* Chat Assistant */}
      <div className="chat-assistant">
        <div className="chat-header">
          <h3>Chat Assistant</h3>
        </div>

        <div className="chat-messages">
          {chatMessages.map((message, index) => (
            <div key={index} className={`chat-message ${message.type}`}>
              {message.type === 'assistant' && (
                <div className="assistant-message">
                  <MessageSquare size={16} />
                  <p>{message.content}</p>
                </div>
              )}

              {message.type === 'user' && (
                <div className="user-message">
                  <p>{message.content}</p>
                </div>
              )}

              {message.type === 'recommendation' && (
                <div className="recommendation-message">
                  <h4>{message.title}</h4>
                  <ul>
                    {message.items.map((item, itemIndex) => (
                      <li 
                        key={itemIndex} 
                        onClick={() => message.clickable ? handleRecommendationClick(item, message.stepType) : null}
                        className={message.clickable ? 'clickable-item' : ''}
                      >
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {message.type === 'question' && (
                <div className="question-message">
                  <p>{message.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleChatSubmit} className="chat-input-form">
          <input
            type="text"
            placeholder="Type your question..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="chat-input"
          />
          <button type="submit" className="chat-send-btn">
            <ChevronRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRunbook;
