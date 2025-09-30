import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const IncidentSummaryReport = () => {
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
      const data = await apiService.getIncidentSummaryReport();
      setReportData(data);
    } catch (err) {
      console.error('Error fetching incident summary report:', err);
      setError('Failed to load incident summary report');
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

  if (loading) {
    return (
      <div className="report-loading">
        <div className="loading-spinner"></div>
        <p>Generating Incident Summary Report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-error">
        <h3>Error Loading Report</h3>
        <p>{error}</p>
        <button onClick={fetchReport} className="retry-btn">Retry</button>
      </div>
    );
  }

  if (!reportData) return null;

  return (
    <div className="report-container">
      <div className="report-header">
        <button onClick={() => navigate('/reports')} className="back-btn">
          ← Back to Reports
        </button>
        <div className="report-title-section">
          <h1>📊 {reportData.report_type}</h1>
          <p className="report-timestamp">Generated: {formatDateTime(reportData.generated_at)}</p>
          <button onClick={fetchReport} className="refresh-btn">🔄 Refresh</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="report-summary-cards">
        <div className="summary-card incidents-total">
          <div className="card-icon">🎯</div>
          <div className="card-content">
            <h3>{reportData.summary.total_incidents}</h3>
            <p>Total Incidents</p>
          </div>
        </div>

        <div className="summary-card incidents-open">
          <div className="card-icon">🔓</div>
          <div className="card-content">
            <h3>{reportData.summary.open_incidents}</h3>
            <p>Open Incidents</p>
          </div>
        </div>

        <div className="summary-card incidents-resolved">
          <div className="card-icon">✅</div>
          <div className="card-content">
            <h3>{reportData.summary.resolved_incidents}</h3>
            <p>Resolved Incidents</p>
          </div>
        </div>

        <div className="summary-card mttr">
          <div className="card-icon">⏱️</div>
          <div className="card-content">
            <h3>{reportData.summary.mttr_hours}h</h3>
            <p>Mean Time to Respond</p>
          </div>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="report-metrics">
        <div className="metrics-row">
          {/* Category Breakdown */}
          <div className="metrics-card">
            <h3>📈 Incidents by Category</h3>
            <div className="category-metrics">
              {Object.entries(reportData.metrics.by_category).map(([category, count]) => (
                <div key={category} className="category-item">
                  <span className="category-name">{category}</span>
                  <div className="category-bar">
                    <div 
                      className="category-fill" 
                      style={{ 
                        width: `${(count / Math.max(...Object.values(reportData.metrics.by_category))) * 100}%` 
                      }}
                    ></div>
                    <span className="category-count">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Severity Breakdown */}
          <div className="metrics-card">
            <h3>🚨 Incidents by Severity</h3>
            <div className="severity-metrics">
              {Object.entries(reportData.metrics.by_severity).map(([severity, count]) => (
                <div key={severity} className={`severity-item ${getSeverityClass(severity)}`}>
                  <div className="severity-label">
                    <span className="severity-indicator"></span>
                    {severity}
                  </div>
                  <span className="severity-count">{count}</span>
                </div>
              ))}
            </div>
            <div className="resolution-rate">
              <p>Resolution Rate: <strong>{reportData.metrics.resolution_rate}%</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="report-section">
        <h3>🔍 Recent Incidents</h3>
        <div className="incidents-table-wrapper">
          <table className="incidents-report-table">
            <thead>
              <tr>
                <th>Incident ID</th>
                <th>Scenario</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Detection Time</th>
                <th>Assigned To</th>
                <th>Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {reportData.incidents.map((incident) => (
                <tr key={incident.id} className="incident-row">
                  <td>
                    <button 
                      className="incident-link"
                      onClick={() => navigate(`/incidents/${incident.id}`)}
                    >
                      {incident.id}
                    </button>
                  </td>
                  <td>{incident.scenario}</td>
                  <td>
                    <span className={`severity-badge ${getSeverityClass(incident.incident_severity)}`}>
                      {incident.incident_severity}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${incident.incident_status.toLowerCase().replace(' ', '-')}`}>
                      {incident.incident_status}
                    </span>
                  </td>
                  <td>{formatDateTime(incident.detection_timestamp)}</td>
                  <td>{incident.assigned_to || 'Unassigned'}</td>
                  <td>
                    <span className="risk-score">{incident.risk_score || 'N/A'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IncidentSummaryReport;
