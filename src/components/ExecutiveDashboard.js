import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const ExecutiveDashboard = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getExecutiveDashboard();
      setReportData(data);
    } catch (err) {
      console.error('Error fetching executive dashboard:', err);
      setError('Failed to load executive dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeStr) => {
    try {
      return new Date(dateTimeStr).toLocaleString();
    } catch {
      return dateTimeStr;
    }
  };

  const getSeverityClass = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'high': return 'severity-high';
      case 'medium': return 'severity-medium';
      case 'low': return 'severity-low';
      default: return 'severity-unknown';
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'resolved': return '#28a745';
      case 'open': return '#dc3545';
      case 'new': return '#ffc107';
      case 'in progress': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className="report-loading">
        <div className="loading-spinner"></div>
        <p>Generating Executive Security Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-error">
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button onClick={fetchReport} className="retry-btn">Retry</button>
      </div>
    );
  }

  if (!reportData) return null;

  return (
    <div className="report-container executive-dashboard">
      <div className="report-header">
        <button onClick={() => navigate('/reports')} className="back-btn">
          ← Back to Reports
        </button>
        <div className="report-title-section">
          <h1>👔 {reportData.report_type}</h1>
          <p className="report-timestamp">Generated: {formatDateTime(reportData.generated_at)}</p>
          <button onClick={fetchReport} className="refresh-btn">🔄 Refresh</button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="executive-metrics-grid">
        <div className="executive-card primary-metrics">
          <h3>🛡️ Security Overview</h3>
          <div className="metric-row">
            <div className="metric-item">
              <span className="metric-value">{reportData.key_metrics.total_anomalies}</span>
              <span className="metric-label">Total Anomalies</span>
            </div>
            <div className="metric-item">
              <span className="metric-value">{reportData.key_metrics.total_incidents}</span>
              <span className="metric-label">Security Incidents</span>
            </div>
            <div className="metric-item">
              <span className="metric-value">{reportData.key_metrics.active_models}</span>
              <span className="metric-label">Active Models</span>
            </div>
          </div>
        </div>

        <div className="executive-card incident-status">
          <h3>📊 Incident Status</h3>
          <div className="status-chart">
            <div className="status-item">
              <div className="status-indicator open"></div>
              <span className="status-label">Open</span>
              <span className="status-count">{reportData.key_metrics.open_incidents}</span>
            </div>
            <div className="status-item">
              <div className="status-indicator resolved"></div>
              <span className="status-label">Resolved</span>
              <span className="status-count">{reportData.key_metrics.resolved_incidents}</span>
            </div>
            <div className="resolution-rate">
              <p>Resolution Rate: <strong>{reportData.operational_status.incident_resolution_rate}%</strong></p>
            </div>
          </div>
        </div>

        <div className="executive-card automation-metrics">
          <h3>🤖 Automation & Response</h3>
          <div className="automation-stats">
            <div className="automation-item">
              <span className="automation-label">Available Runbooks</span>
              <span className="automation-value">{reportData.key_metrics.available_runbooks}</span>
            </div>
            <div className="automation-item">
              <span className="automation-label">Automation Rate</span>
              <span className="automation-value">{reportData.key_metrics.response_automation_rate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Status */}
      <div className="executive-section">
        <h3>⏱️ Operational Performance</h3>
        <div className="operational-grid">
          <div className="operational-card">
            <div className="operational-icon">🔍</div>
            <div className="operational-content">
              <h4>Mean Time to Detect</h4>
              <span className="operational-value">{reportData.operational_status.mean_time_to_detect}</span>
            </div>
          </div>

          <div className="operational-card">
            <div className="operational-icon">⚡</div>
            <div className="operational-content">
              <h4>Mean Time to Respond</h4>
              <span className="operational-value">{reportData.operational_status.mean_time_to_respond}</span>
            </div>
          </div>

          <div className="operational-card">
            <div className="operational-icon">🎯</div>
            <div className="operational-content">
              <h4>Detection Coverage</h4>
              <span className="operational-value">{reportData.model_performance.detection_coverage}</span>
            </div>
          </div>

          <div className="operational-card">
            <div className="operational-icon">📊</div>
            <div className="operational-content">
              <h4>False Positive Rate</h4>
              <span className="operational-value">{reportData.model_performance.false_positive_rate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Risks */}
      <div className="executive-section">
        <h3>🚨 Top Security Risks</h3>
        {reportData.top_risks && reportData.top_risks.length > 0 ? (
          <div className="risks-table-wrapper">
            <table className="risks-table">
              <thead>
                <tr>
                  <th>Risk ID</th>
                  <th>Scenario</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Detection Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reportData.top_risks.map((risk) => (
                  <tr key={risk.id} className="risk-row">
                    <td>
                      <button 
                        className="risk-link"
                        onClick={() => navigate(`/incidents/${risk.id}`)}
                      >
                        {risk.id}
                      </button>
                    </td>
                    <td>{risk.scenario}</td>
                    <td>
                      <span className={`severity-badge ${getSeverityClass(risk.incident_severity)}`}>
                        {risk.incident_severity}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="status-dot"
                        style={{ backgroundColor: getStatusColor(risk.incident_status) }}
                      ></span>
                      {risk.incident_status}
                    </td>
                    <td>{formatDateTime(risk.time)}</td>
                    <td>
                      <button 
                        className="view-incident-btn"
                        onClick={() => navigate(`/incidents/${risk.id}`)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-risks">
            <p>✅ No high-severity incidents currently identified</p>
          </div>
        )}
      </div>

      {/* Threat Trends */}
      <div className="executive-section">
        <h3>📈 Threat Correlation Trends</h3>
        {reportData.threat_trends && reportData.threat_trends.length > 0 ? (
          <div className="threat-trends">
            <div className="trends-chart">
              {reportData.threat_trends.map((trend, index) => (
                <div key={index} className="trend-item">
                  <div className="trend-date">{trend.date}</div>
                  <div className="trend-type">{trend.incident_type}</div>
                  <div className="trend-count">
                    <span className="trend-number">{trend.count}</span>
                    <span className="trend-label">incidents</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-trends">
            <p>📊 Threat trend data is being collected...</p>
          </div>
        )}
      </div>

      {/* Executive Summary */}
      <div className="executive-section">
        <h3>📋 Executive Summary</h3>
        <div className="summary-cards">
          <div className="summary-card positive">
            <h4>✅ Strengths</h4>
            <ul>
              <li>Response automation rate: {reportData.key_metrics.response_automation_rate}%</li>
              <li>Active monitoring with {reportData.key_metrics.active_models} models</li>
              <li>Incident resolution rate: {reportData.operational_status.incident_resolution_rate}%</li>
            </ul>
          </div>

          <div className="summary-card attention">
            <h4>⚠️ Areas for Attention</h4>
            <ul>
              <li>{reportData.key_metrics.open_incidents} incidents require immediate attention</li>
              <li>False positive rate at {reportData.model_performance.false_positive_rate}</li>
              <li>Consider expanding runbook coverage</li>
            </ul>
          </div>

          <div className="summary-card recommendations">
            <h4>💡 Strategic Recommendations</h4>
            <ul>
              <li>Invest in additional automation for common incident types</li>
              <li>Enhance model tuning to reduce false positives</li>
              <li>Consider threat hunting initiatives for emerging risks</li>
              <li>Review and update incident response procedures</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
