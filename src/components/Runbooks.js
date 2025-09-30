import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, ChevronRight } from 'lucide-react';
import { apiService } from '../services/api';
import RunbookChatAssistant from './RunbookChatAssistant';
import '../enhanced-runbooks.css';

const Runbooks = () => {
  const [runbooks, setRunbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRunbooks();
  }, []);

  const fetchRunbooks = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllRunbooks();
      setRunbooks(data);
    } catch (error) {
      console.error('Error fetching runbooks:', error);
      // Mock data for demonstration
      setRunbooks([
        {
          name: 'Data Exfiltration Response',
          description: 'Comprehensive response procedures for suspected data exfiltration incidents including containment, investigation, and remediation steps.'
        },
        {
          name: 'Brute Force Attack Mitigation',
          description: 'Step-by-step guide to identify, contain, and respond to brute force authentication attacks across various systems and services.'
        },
        {
          name: 'Malware Incident Response',
          description: 'Complete malware incident response playbook covering detection, isolation, analysis, eradication, and recovery procedures.'
        },
        {
          name: 'Insider Threat Investigation',
          description: 'Procedures for investigating suspected insider threats while maintaining legal compliance and preserving evidence.'
        },
        {
          name: 'Phishing Response',
          description: 'Rapid response procedures for phishing attacks including email analysis, user communication, and system protection measures.'
        },
        {
          name: 'Network Intrusion Response',
          description: 'Comprehensive network intrusion response procedures covering initial detection through full system recovery.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRunbooks = runbooks.filter(runbook =>
    runbook.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    runbook.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading runbooks...</div>;
  }

  return (
    <div className="runbooks-page-container">
      <div className="runbooks-main-content">
        <div className="runbooks-page">
          <div className="page-header">
            <h1>Security Runbooks</h1>
            <p className="page-description">
              Comprehensive incident response playbooks and procedures for security operations
            </p>
          </div>

          <div className="runbooks-controls">
            <div className="controls-left">
              <div className="search-container">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search runbooks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            
            <div className="controls-right">
              <div className="runbooks-stats">
                <span className="stat-item">
                  <strong>{filteredRunbooks.length}</strong> runbooks available
                </span>
              </div>
              
              <Link to="/runbooks/add" className="add-runbook-btn">
                Add Runbook
              </Link>
            </div>
          </div>

          <div className="runbooks-grid">
            {filteredRunbooks.map((runbook, index) => (
              <Link
                key={index}
                to={`/runbooks/${encodeURIComponent(runbook.name)}`}
                className="runbook-card"
              >
                <div className="runbook-icon">
                  <BookOpen size={24} />
                </div>
                
                <div className="runbook-content">
                  <h3 className="runbook-name">{runbook.name}</h3>
                  <p className="runbook-description">{runbook.description}</p>
                </div>
                
                <div className="runbook-arrow">
                  <ChevronRight size={20} />
                </div>
              </Link>
            ))}
          </div>

          {filteredRunbooks.length === 0 && !loading && (
            <div className="no-runbooks">
              <BookOpen size={48} className="no-runbooks-icon" />
              <h3>No runbooks found</h3>
              <p>No runbooks match your search criteria. Try adjusting your search terms.</p>
            </div>
          )}

          <div className="runbooks-footer">
            <p>
              <strong>Need help?</strong> Contact the SOC team for assistance with runbook procedures or to request new playbooks.
            </p>
          </div>
        </div>
      </div>

      <div className="runbooks-chat-container">
        <RunbookChatAssistant />
      </div>
    </div>
  );
};

export default Runbooks;

