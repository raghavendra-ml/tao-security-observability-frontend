import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, AlertTriangle, User, MapPin, Activity } from 'lucide-react';
import { apiService } from '../services/api';

const Anomalies = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [filteredAnomalies, setFilteredAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnomalies();
  }, []);

  useEffect(() => {
    filterAnomalies();
  }, [anomalies, searchTerm, filterSeverity, filterType, filterStatus]);

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllAnomalies();
      setAnomalies(data);
    } catch (error) {
      console.error('Error fetching anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAnomalies = () => {
    let filtered = anomalies;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(anomaly =>
        anomaly.anomaly_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        anomaly.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        anomaly.source_ip?.includes(searchTerm) ||
        anomaly.destination_ip?.includes(searchTerm) ||
        anomaly.anomaly_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        anomaly.anomaly_summary?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Severity filter
    if (filterSeverity !== 'All') {
      filtered = filtered.filter(anomaly => anomaly.severity === filterSeverity);
    }

    // Type filter
    if (filterType !== 'All') {
      filtered = filtered.filter(anomaly => anomaly.anomaly_type === filterType);
    }

    // Status filter
    if (filterStatus !== 'All') {
      filtered = filtered.filter(anomaly => anomaly.status === filterStatus);
    }

    setFilteredAnomalies(filtered);
  };

  const handleAnomalyClick = (anomalyId) => {
    navigate(`/anomalies/${anomalyId}`);
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

  const getUniqueValues = (field) => {
    const values = anomalies.map(anomaly => anomaly[field]).filter(Boolean);
    return [...new Set(values)].sort();
  };


  if (loading) {
    return (
      <div className="anomalies-page">
        <div className="anomalies-header">
          <h1>Anomalies</h1>
          <p>Loading anomalies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="anomalies-page">
      <div className="anomalies-header">
        <div className="header-content">
          <div className="header-info">
            <h1>Anomalies</h1>
            <p>Monitor and investigate anomalous activities in your system</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{anomalies.length}</span>
              <span className="stat-label">Total Anomalies</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{anomalies.filter(a => a.severity?.toLowerCase() === 'high').length}</span>
              <span className="stat-label">High Severity</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{anomalies.filter(a => a.false_positive?.toLowerCase() === 'no').length}</span>
              <span className="stat-label">Confirmed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="anomalies-controls">
        <div className="search-section">
          <div className="search-bar">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search anomalies by ID, user, IP, type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-item">
            <Filter size={16} />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Severities</option>
              {getUniqueValues('severity').map(severity => (
                <option key={severity} value={severity}>{severity}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <Activity size={16} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Types</option>
              {getUniqueValues('anomaly_type').map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <AlertTriangle size={16} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Status</option>
              {getUniqueValues('status').map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="anomalies-content">
        <div className="anomalies-list">
          {filteredAnomalies.length === 0 ? (
            <div className="no-anomalies">
              <AlertTriangle size={48} />
              <h3>No anomalies found</h3>
              <p>Try adjusting your search criteria or filters</p>
            </div>
          ) : (
            <div className="anomalies-table-container">
              <table className="anomalies-table">
                <thead>
                  <tr>
                    <th>Anomaly ID</th>
                    <th>Time</th>
                    <th>Anomaly</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Subtype</th>
                    <th>Source IP</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAnomalies.map((anomaly) => (
                    <tr
                      key={anomaly.anomaly_id}
                      className="anomaly-row"
                      onClick={() => handleAnomalyClick(anomaly.anomaly_id)}
                    >
                      <td className="anomaly-id-cell">
                        <strong>{anomaly.anomaly_id || 'N/A'}</strong>
                      </td>
                      <td className="time-cell">
                        {anomaly.log_time ? new Date(anomaly.log_time).toLocaleString() : 'N/A'}
                      </td>
                      <td className="anomaly-cell">
                        {anomaly.anomaly_summary || anomaly.anomaly_type || 'N/A'}
                      </td>
                      <td className="user-cell">
                        {anomaly.user || 'Unknown'}
                      </td>
                      <td className="type-cell">
                        {anomaly.anomaly_type || 'N/A'}
                      </td>
                      <td className="subtype-cell">
                        {anomaly.anomaly_subtype || 'N/A'}
                      </td>
                      <td className="source-ip-cell">
                        {anomaly.source_ip || 'N/A'}
                      </td>
                      <td className="severity-cell">
                        <span className={`severity-badge ${getSeverityBadgeClass(anomaly.severity)}`}>
                          {anomaly.severity || 'Unknown'}
                        </span>
                      </td>
                      <td className="status-cell">
                        <span className={`status-badge ${getStatusBadgeClass(anomaly.status)}`}>
                          {anomaly.status || 'Open'}
                        </span>
                      </td>
                      <td className="assigned-cell">
                        {anomaly.assigned_to || 'Unassigned'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="anomalies-footer">
        <p>Showing {filteredAnomalies.length} of {anomalies.length} anomalies</p>
      </div>

    </div>
  );
};

export default Anomalies;
