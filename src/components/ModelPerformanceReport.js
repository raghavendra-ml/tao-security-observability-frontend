import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const ModelPerformanceReport = () => {
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
      const data = await apiService.getModelPerformanceReport();
      setReportData(data);
    } catch (err) {
      console.error('Error fetching model performance report:', err);
      setError('Failed to load model performance report');
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

  const getPerformanceColor = (value, type) => {
    if (type === 'precision' || type === 'recall' || type === 'f1') {
      if (value >= 0.9) return '#28a745'; // Green
      if (value >= 0.8) return '#ffc107'; // Yellow
      return '#dc3545'; // Red
    }
    if (type === 'false_positive') {
      if (value <= 10) return '#28a745';
      if (value <= 20) return '#ffc107';
      return '#dc3545';
    }
    return '#6c757d';
  };

  const getStatusBadgeClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'training': return 'status-training';
      default: return 'status-unknown';
    }
  };

  if (loading) {
    return (
      <div className="report-loading">
        <div className="loading-spinner"></div>
        <p>Generating Model Performance Report...</p>
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
          <h1>🤖 {reportData.report_type}</h1>
          <p className="report-timestamp">Generated: {formatDateTime(reportData.generated_at)}</p>
          <button onClick={fetchReport} className="refresh-btn">🔄 Refresh</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="report-summary-cards">
        <div className="summary-card models-total">
          <div className="card-icon">🎯</div>
          <div className="card-content">
            <h3>{reportData.summary.total_models}</h3>
            <p>Total Models</p>
          </div>
        </div>

        <div className="summary-card models-active">
          <div className="card-icon">🟢</div>
          <div className="card-content">
            <h3>{reportData.summary.active_models}</h3>
            <p>Active Models</p>
          </div>
        </div>

        <div className="summary-card avg-precision">
          <div className="card-icon">🎯</div>
          <div className="card-content">
            <h3>{(reportData.summary.avg_precision * 100).toFixed(1)}%</h3>
            <p>Avg Precision</p>
          </div>
        </div>

        <div className="summary-card total-anomalies">
          <div className="card-icon">⚠️</div>
          <div className="card-content">
            <h3>{reportData.summary.total_anomalies_generated}</h3>
            <p>Anomalies Generated</p>
          </div>
        </div>
      </div>

      {/* Models Performance Table */}
      <div className="report-section">
        <h3>📊 Model Performance Metrics</h3>
        <div className="models-table-wrapper">
          <table className="models-report-table">
            <thead>
              <tr>
                <th>Model Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1 Score</th>
                <th>False Positive Rate</th>
                <th>Anomalies Generated</th>
                <th>High Severity</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {reportData.models.map((model) => (
                <tr key={model.model_name} className="model-row">
                  <td>
                    <strong>{model.model_name}</strong>
                  </td>
                  <td>
                    <span className="model-type">{model.model_type}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(model.status)}`}>
                      {model.status}
                    </span>
                  </td>
                  <td>
                    <div className="metric-cell">
                      <span 
                        className="metric-value"
                        style={{ color: getPerformanceColor(model.precision, 'precision') }}
                      >
                        {(model.precision * 100).toFixed(1)}%
                      </span>
                      <div 
                        className="metric-bar"
                        style={{ 
                          background: `linear-gradient(to right, ${getPerformanceColor(model.precision, 'precision')} ${model.precision * 100}%, #e9ecef ${model.precision * 100}%)`
                        }}
                      ></div>
                    </div>
                  </td>
                  <td>
                    <div className="metric-cell">
                      <span 
                        className="metric-value"
                        style={{ color: getPerformanceColor(model.recall, 'recall') }}
                      >
                        {(model.recall * 100).toFixed(1)}%
                      </span>
                      <div 
                        className="metric-bar"
                        style={{ 
                          background: `linear-gradient(to right, ${getPerformanceColor(model.recall, 'recall')} ${model.recall * 100}%, #e9ecef ${model.recall * 100}%)`
                        }}
                      ></div>
                    </div>
                  </td>
                  <td>
                    <div className="metric-cell">
                      <span 
                        className="metric-value"
                        style={{ color: getPerformanceColor(model.f1_score, 'f1') }}
                      >
                        {(model.f1_score * 100).toFixed(1)}%
                      </span>
                      <div 
                        className="metric-bar"
                        style={{ 
                          background: `linear-gradient(to right, ${getPerformanceColor(model.f1_score, 'f1')} ${model.f1_score * 100}%, #e9ecef ${model.f1_score * 100}%)`
                        }}
                      ></div>
                    </div>
                  </td>
                  <td>
                    <span 
                      className="metric-value"
                      style={{ color: getPerformanceColor(model.false_positive_rate, 'false_positive') }}
                    >
                      {model.false_positive_rate.toFixed(1)}%
                    </span>
                  </td>
                  <td>
                    <span className="anomalies-count">{model.anomalies_generated}</span>
                  </td>
                  <td>
                    <span className="high-severity-count">{model.high_severity_anomalies}</span>
                  </td>
                  <td>{formatDateTime(model.last_updated)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="report-section">
        <h3>💡 Performance Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>🎯 Top Performing Models</h4>
            <ul>
              {reportData.models
                .sort((a, b) => b.f1_score - a.f1_score)
                .slice(0, 3)
                .map((model) => (
                  <li key={model.model_name}>
                    <strong>{model.model_name}</strong> - F1: {(model.f1_score * 100).toFixed(1)}%
                  </li>
                ))}
            </ul>
          </div>

          <div className="insight-card">
            <h4>⚠️ Models Needing Attention</h4>
            <ul>
              {reportData.models
                .filter(m => m.false_positive_rate > 15 || m.precision < 0.8)
                .slice(0, 3)
                .map((model) => (
                  <li key={model.model_name}>
                    <strong>{model.model_name}</strong> - FP Rate: {model.false_positive_rate.toFixed(1)}%
                  </li>
                ))}
            </ul>
          </div>

          <div className="insight-card">
            <h4>📈 Recommendations</h4>
            <ul>
              <li>Consider retraining models with FP rate > 20%</li>
              <li>Review threshold settings for low precision models</li>
              <li>Analyze feature importance for underperforming models</li>
              <li>Implement A/B testing for model improvements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelPerformanceReport;
