import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Activity, Clock, AlertTriangle, Shield, TrendingUp, Info } from 'lucide-react';
import { apiService } from '../services/api';

const AnomalyDetail = () => {
  const { anomalyId } = useParams();
  const navigate = useNavigate();
  const [anomaly, setAnomaly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnomalyDetail();
  }, [anomalyId]);

  const fetchAnomalyDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAnomalyDetail(anomalyId);
      
      if (response.error) {
        setError(response.error);
      } else {
        setAnomaly(response.anomaly);
      }
    } catch (error) {
      console.error('Error fetching anomaly detail:', error);
      setError('Failed to load anomaly details');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadgeClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'severity-high';
      case 'medium': return 'severity-medium';
      case 'low': return 'severity-low';
      default: return 'severity-unknown';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'status-open';
      case 'closed': return 'status-closed';
      case 'investigating': return 'status-investigating';
      case 'resolved': return 'status-resolved';
      default: return 'status-unknown';
    }
  };

  if (loading) {
    return (
      <div className="anomaly-detail-page">
        <div className="anomaly-detail-header">
          <button onClick={() => navigate('/anomalies')} className="back-button">
            <ArrowLeft size={20} />
            Back to Anomalies
          </button>
          <h1>Loading Anomaly Details...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="anomaly-detail-page">
        <div className="anomaly-detail-header">
          <button onClick={() => navigate('/anomalies')} className="back-button">
            <ArrowLeft size={20} />
            Back to Anomalies
          </button>
          <h1>Error</h1>
        </div>
        <div className="error-message">
          <AlertTriangle size={48} />
          <h3>{error}</h3>
          <p>The requested anomaly could not be found or loaded.</p>
        </div>
      </div>
    );
  }

  if (!anomaly) {
    return (
      <div className="anomaly-detail-page">
        <div className="anomaly-detail-header">
          <button onClick={() => navigate('/anomalies')} className="back-button">
            <ArrowLeft size={20} />
            Back to Anomalies
          </button>
          <h1>Anomaly Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="anomaly-detail-page">
      <div className="anomaly-detail-header">
        <button onClick={() => navigate('/anomalies')} className="back-button">
          <ArrowLeft size={20} />
          Back to Anomalies
        </button>
        <div className="header-info">
          <h1>Anomaly Details: {anomaly.anomaly_id}</h1>
          <div className="header-badges">
            <span className={`severity-badge ${getSeverityBadgeClass(anomaly.severity)}`}>
              {anomaly.severity || 'Unknown'} Severity
            </span>
            <span className={`status-badge ${getStatusBadgeClass(anomaly.status)}`}>
              {anomaly.status || 'Unknown'}
            </span>
            {anomaly.false_positive === 'yes' && (
              <span className="false-positive-badge">False Positive</span>
            )}
          </div>
        </div>
      </div>

      <div className="anomaly-detail-content">
        <div className="anomaly-summary">
          <div className="summary-section">
            <h3>
              <Info size={20} />
              Anomaly Summary
            </h3>
            <p>{anomaly.anomaly_summary || 'No summary available'}</p>
          </div>
        </div>

        {/* Key Information Cards */}
        <div className="key-info-cards">
          <div className="key-info-card">
            <div className="card-header">
              <User size={18} />
              <span>User</span>
            </div>
            <div className="card-value">{anomaly.user || 'Unknown'}</div>
            <div className="card-meta">Source: {anomaly.source_data || 'N/A'}</div>
          </div>
          
          <div className="key-info-card">
            <div className="card-header">
              <Activity size={18} />
              <span>Type</span>
            </div>
            <div className="card-value">{anomaly.anomaly_type || 'N/A'}</div>
            <div className="card-meta">{anomaly.anomaly_subtype || 'No subtype'}</div>
          </div>
          
          <div className="key-info-card">
            <div className="card-header">
              <TrendingUp size={18} />
              <span>Confidence</span>
            </div>
            <div className="card-value confidence-score">
              {anomaly.confidence_score ? `${Math.round(anomaly.confidence_score * 100)}%` : 'N/A'}
            </div>
            <div className="card-meta">Detection accuracy</div>
          </div>
          
          <div className="key-info-card">
            <div className="card-header">
              <Clock size={18} />
              <span>Time</span>
            </div>
            <div className="card-value time-value">
              {anomaly.log_time ? new Date(anomaly.log_time).toLocaleDateString() : 'N/A'}
            </div>
            <div className="card-meta">
              {anomaly.log_time ? new Date(anomaly.log_time).toLocaleTimeString() : ''}
            </div>
          </div>
        </div>

        {/* Detailed Information Sections */}
        <div className="detail-sections">
          <div className="detail-section network-section">
            <div className="section-header">
              <MapPin size={20} />
              <h3>Network Activity</h3>
            </div>
            <div className="section-content">
              <div className="network-flow">
                <div className="network-node source">
                  <div className="node-label">Source</div>
                  <div className="node-ip">{anomaly.source_ip || 'N/A'}</div>
                  <div className="node-name">{anomaly.source_name || anomaly.log_source_ip || 'Unknown'}</div>
                </div>
                <div className="flow-arrow">→</div>
                <div className="network-node destination">
                  <div className="node-label">Destination</div>
                  <div className="node-ip">{anomaly.destination_ip || 'N/A'}</div>
                  <div className="node-name">{anomaly.destination_name || 'Unknown'}</div>
                </div>
              </div>
              {anomaly.endpoints && (
                <div className="endpoints-info">
                  <strong>Endpoints:</strong> {anomaly.endpoints}
                </div>
              )}
            </div>
          </div>

          <div className="detail-section analysis-section">
            <div className="section-header">
              <Activity size={20} />
              <h3>Detection Details</h3>
            </div>
            <div className="section-content">
              <div className="analysis-grid">
                <div className="analysis-item">
                  <span className="analysis-label">Detection Method</span>
                  <span className="analysis-value">{anomaly.detection_method || 'Rules-based'}</span>
                </div>
                <div className="analysis-item">
                  <span className="analysis-label">Model Used</span>
                  <span className="analysis-value">{anomaly.model_used || 'Standard'}</span>
                </div>
                <div className="analysis-item">
                  <span className="analysis-label">Actual Value</span>
                  <span className="analysis-value">{anomaly.actual_value || 'N/A'}</span>
                </div>
                <div className="analysis-item">
                  <span className="analysis-label">Threshold</span>
                  <span className="analysis-value">{anomaly.threshold_value || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section timeline-section">
            <div className="section-header">
              <Clock size={20} />
              <h3>Timeline Information</h3>
            </div>
            <div className="section-content">
              <div className="timeline-details">
                <div className="timeline-item">
                  <div className="timeline-label">Day of Week</div>
                  <div className="timeline-value">
                    {anomaly.day || 'Unknown'}
                    {anomaly.weekend !== null && (
                      <span className={`weekend-indicator ${anomaly.weekend ? 'weekend' : 'weekday'}`}>
                        {anomaly.weekend ? 'Weekend' : 'Weekday'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-label">Hour</div>
                  <div className="timeline-value">
                    {anomaly.hour !== null ? `${anomaly.hour}:00` : 'N/A'}
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-label">Log Severity</div>
                  <div className="timeline-value">{anomaly.log_severity || 'Normal'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Investigation Status - only show if there's meaningful data */}
          {(anomaly.assigned_to || anomaly.confirmed_anomaly !== null || anomaly.resolution_notes || anomaly.feedback_notes || anomaly.tags) && (
            <div className="detail-section investigation-section">
              <div className="section-header">
                <Shield size={20} />
                <h3>Investigation Status</h3>
              </div>
              <div className="section-content">
                <div className="investigation-grid">
                  {anomaly.assigned_to && (
                    <div className="investigation-item">
                      <span className="investigation-label">Assigned To</span>
                      <span className="investigation-value assigned-user">{anomaly.assigned_to}</span>
                    </div>
                  )}
                  {anomaly.confirmed_anomaly !== null && (
                    <div className="investigation-item">
                      <span className="investigation-label">Confirmed</span>
                      <span className={`investigation-value confirmation ${anomaly.confirmed_anomaly ? 'confirmed' : 'pending'}`}>
                        {anomaly.confirmed_anomaly === true ? 'Yes' : anomaly.confirmed_anomaly === false ? 'No' : 'Pending'}
                      </span>
                    </div>
                  )}
                  {anomaly.resolution_notes && (
                    <div className="investigation-item full-width">
                      <span className="investigation-label">Resolution Notes</span>
                      <div className="investigation-notes">{anomaly.resolution_notes}</div>
                    </div>
                  )}
                  {anomaly.feedback_notes && (
                    <div className="investigation-item full-width">
                      <span className="investigation-label">Feedback Notes</span>
                      <div className="investigation-notes">{anomaly.feedback_notes}</div>
                    </div>
                  )}
                  {anomaly.tags && (
                    <div className="investigation-item full-width">
                      <span className="investigation-label">Tags</span>
                      <div className="tags-container">
                        {typeof anomaly.tags === 'string' 
                          ? anomaly.tags.split(',').map((tag, index) => (
                              <span key={index} className="tag">{tag.trim()}</span>
                            ))
                          : <span className="tag">{anomaly.tags}</span>
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {anomaly.combined_text && (
          <div className="anomaly-raw-data">
            <h3>Combined Text Data</h3>
            <div className="raw-data-content">
              <pre>{anomaly.combined_text}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnomalyDetail;
