import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle, AlertTriangle, Users, Clock } from 'lucide-react';
import { apiService } from '../services/api';
import RunbookChatAssistant from './RunbookChatAssistant';
import '../enhanced-runbooks.css';

const RunbookDetail = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [runbook, setRunbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('investigation');

  useEffect(() => {
    fetchRunbookDetail();
  }, [name]);

  const fetchRunbookDetail = async () => {
    try {
      setLoading(true);
      const data = await apiService.getRunbookByName(name);
      // Extract the runbook object from the API response
      if (data && data.runbook) {
        setRunbook(data.runbook);
      } else {
        console.error('Invalid API response structure:', data);
        throw new Error('Invalid API response structure');
      }
    } catch (error) {
      console.error('Error fetching runbook detail:', error);
      // Mock data for demonstration
      setRunbook({
        name: decodeURIComponent(name),
        description: 'Comprehensive response procedures for suspected data exfiltration incidents including containment, investigation, and remediation steps.',
        investigation_steps: `1. Initial Detection and Verification
   - Verify the alert authenticity and gather initial evidence
   - Document the time, scope, and nature of the suspected exfiltration
   - Identify affected systems, users, and data types

2. Immediate Containment
   - Isolate affected systems from the network if necessary
   - Preserve system state and create forensic images
   - Block suspicious network connections or user accounts
   - Notify legal and compliance teams if required

3. Evidence Collection
   - Collect network logs, system logs, and application logs
   - Document file access patterns and data transfer activities
   - Gather user activity logs and authentication records
   - Preserve email communications and chat logs if relevant

4. Impact Assessment
   - Determine the scope of data potentially compromised
   - Identify the sensitivity and classification of affected data
   - Assess potential regulatory and legal implications
   - Estimate the timeline of the incident`,
        response_actions: `1. Immediate Response (0-1 hours)
   - Activate incident response team
   - Implement containment measures
   - Begin evidence preservation
   - Notify key stakeholders

2. Short-term Response (1-24 hours)
   - Complete forensic analysis
   - Determine root cause
   - Implement additional security controls
   - Prepare preliminary incident report

3. Recovery and Remediation
   - Remove malicious actors and tools
   - Patch vulnerabilities that enabled the incident
   - Restore systems from clean backups if necessary
   - Implement additional monitoring

4. Post-Incident Activities
   - Conduct lessons learned session
   - Update security controls and policies
   - Provide security awareness training
   - Monitor for indicators of compromise`
      });
    } finally {
      setLoading(false);
    }
  };

  const parseSteps = (stepsText) => {
    if (!stepsText) return [];
    
    // Enhanced parser to handle both old (-) and new (•) formats
    const sections = stepsText.split('\n\n').filter(section => section.trim().length > 0);
    
    return sections.map((section, index) => {
      const lines = section.split('\n').filter(line => line.trim().length > 0);
      let title = lines[0] || `Section ${index + 1}`;
      
      // Clean up title formatting (remove ** markdown)
      title = title.replace(/^\*\*(.*?)\*\*$/, '$1').trim();
      
      // Extract steps - handle multiple bullet formats and encoding variations
      const rawSteps = lines.slice(1).filter(line => {
        const trimmed = line.trim();
        return trimmed.startsWith('•') || 
               trimmed.startsWith('ò') ||  // Handle encoding variations
               trimmed.startsWith('o ') || // Simple o bullet
               trimmed.startsWith('-') || 
               trimmed.startsWith('*') ||
               (trimmed.length > 0 && !trimmed.startsWith('**'));
      }).map(line => {
        const trimmed = line.trim();
        // Remove various bullet characters and clean up
        return trimmed
          .replace(/^[•òo\-\*]\s*/, '') // Remove bullet chars (including encoding variations)
          .replace(/^and\s+/i, '')      // Remove leading "and"
          .trim();
      });
      
      // Handle comma-separated items and clean up
      const steps = [];
      rawSteps.forEach(step => {
        if (!step || step.length === 0) return;
        
        // Split by comma only if it looks like a list
        if (step.includes(',') && step.split(',').length <= 4) {
          const parts = step.split(',').map(part => part.trim());
          parts.forEach(part => {
            if (part && part.length > 2) { // Minimum length check
              steps.push(part);
            }
          });
        } else {
          // Single step, add as is
          steps.push(step);
        }
      });
      
      return {
        id: index,
        title: title || 'Procedure Steps',
        steps: steps.filter(step => step && step.length > 0) // Remove empty steps
      };
    });
  };

  const handleDownloadPDF = () => {
    // Create HTML content for PDF
    const htmlContent = generatePDFContent();
    
    // Create a new window for printing/saving as PDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Trigger print dialog (user can choose Save as PDF)
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handlePrintRunbook = () => {
    // Create printable version
    const htmlContent = generatePrintContent();
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Trigger print dialog
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const generatePDFContent = () => {
    const investigationSections = parseSteps(runbook.investigation_steps);
    const responseSections = parseSteps(runbook.response_actions);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${runbook.name} - Runbook</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 10px; }
          .description { font-size: 14px; color: #666; margin-bottom: 20px; }
          .section { margin-bottom: 40px; }
          .section-title { font-size: 20px; font-weight: bold; color: #333; margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          .step-section { margin-bottom: 25px; }
          .step-header { font-size: 16px; font-weight: bold; color: #444; margin-bottom: 10px; }
          .step-list { margin-left: 20px; }
          .step-item { margin-bottom: 5px; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${runbook.name}</div>
          <div class="description">${runbook.description}</div>
          <div style="font-size: 12px; color: #666;">
            Generated on: ${new Date().toLocaleString()} | SOC Team
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Investigation Steps</div>
          ${investigationSections.map((section, index) => `
            <div class="step-section">
              <div class="step-header">${index + 1}. ${section.title}</div>
              <ul class="step-list">
                ${section.steps.map(step => `<li class="step-item">${step}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
        
        <div class="section">
          <div class="section-title">Response Actions</div>
          ${responseSections.map((section, index) => `
            <div class="step-section">
              <div class="step-header">${index + 1}. ${section.title}</div>
              <ul class="step-list">
                ${section.steps.map(step => `<li class="step-item">${step}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
        
        <div class="footer">
          <strong>Security Runbook</strong> - This document contains security procedures and should be handled according to organizational policies.
        </div>
      </body>
      </html>
    `;
  };

  const generatePrintContent = () => {
    // Same as PDF content but optimized for direct printing
    return generatePDFContent();
  };

  if (loading) {
    return <div className="loading">Loading runbook details...</div>;
  }

  if (!runbook) {
    return (
      <div className="error-page">
        <h2>Runbook Not Found</h2>
        <p>The requested runbook could not be found.</p>
        <button onClick={() => navigate('/runbooks')} className="back-btn">
          <ArrowLeft size={20} />
          Back to Runbooks
        </button>
      </div>
    );
  }

  const investigationSections = parseSteps(runbook.investigation_steps);
  const responseSections = parseSteps(runbook.response_actions);

  return (
    <div className="runbook-detail-page-container">
      <div className="runbook-detail-main">
        <div className="runbook-detail-page">
          <div className="runbook-detail-header">
            <button onClick={() => navigate('/runbooks')} className="back-btn">
              <ArrowLeft size={20} />
              Back to Runbooks
            </button>
          </div>

          <div className="runbook-detail-content">
        <div className="runbook-header">
          <div className="runbook-title-section">
            <div className="runbook-icon">
              <BookOpen size={32} />
            </div>
            <div>
              <h1>{runbook.name}</h1>
              <p className="runbook-description">{runbook.description}</p>
            </div>
          </div>
          
          <div className="runbook-meta">
            <div className="meta-item">
              <Clock size={16} />
              <span>Last updated: Today</span>
            </div>
            <div className="meta-item">
              <Users size={16} />
              <span>SOC Team</span>
            </div>
          </div>
        </div>

        <div className="runbook-tabs">
          <button 
            className={`tab-btn ${activeSection === 'investigation' ? 'active' : ''}`}
            onClick={() => setActiveSection('investigation')}
          >
            <AlertTriangle size={18} />
            Investigation Steps
          </button>
          <button 
            className={`tab-btn ${activeSection === 'response' ? 'active' : ''}`}
            onClick={() => setActiveSection('response')}
          >
            <CheckCircle size={18} />
            Response Actions
          </button>
        </div>

        <div className="runbook-content">
          {activeSection === 'investigation' && (
            <div className="steps-section">
              <h2>Investigation Steps</h2>
              <p className="section-description">
                Follow these investigation procedures to analyze and understand the security incident.
              </p>
              
              <div className="steps-container">
                {investigationSections.map((section, index) => (
                  <div key={section.id} className="step-section">
                    <div className="step-header">
                      <div className="step-number">{index + 1}</div>
                      <h3>{section.title}</h3>
                    </div>
                    
                    <div className="step-content">
                      <ul className="step-list">
                        {section.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="step-item">
                            <CheckCircle size={16} className="step-icon" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'response' && (
            <div className="steps-section">
              <h2>Response Actions</h2>
              <p className="section-description">
                Execute these response actions to contain, remediate, and recover from the security incident.
              </p>
              
              <div className="steps-container">
                {responseSections.map((section, index) => (
                  <div key={section.id} className="step-section">
                    <div className="step-header">
                      <div className="step-number">{index + 1}</div>
                      <h3>{section.title}</h3>
                    </div>
                    
                    <div className="step-content">
                      <ul className="step-list">
                        {section.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="step-item">
                            <CheckCircle size={16} className="step-icon" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

            <div className="runbook-actions">
              <button className="action-btn primary">
                Start Execution
              </button>
              <button className="action-btn secondary" onClick={handleDownloadPDF}>
                Download PDF
              </button>
              <button className="action-btn secondary" onClick={handlePrintRunbook}>
                Print Runbook
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="runbook-detail-chat-container">
        <RunbookChatAssistant />
      </div>
    </div>
  );
};

export default RunbookDetail;

