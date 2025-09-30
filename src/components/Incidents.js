import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const Incidents = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [sourceIpFilter, setSourceIpFilter] = useState('');
  
  // New filter states
  const [anomalyTypeFilter, setAnomalyTypeFilter] = useState('All');
  const [anomalySubtypeFilter, setAnomalySubtypeFilter] = useState('All');
  
  // Available options for dropdowns
  const [availableAnomalyTypes, setAvailableAnomalyTypes] = useState(['All']);
  const [availableAnomalySubtypes, setAvailableAnomalySubtypes] = useState(['All']);

  useEffect(() => {
    fetchFilterOptions();
    fetchIncidents();
  }, []);

  useEffect(() => {
    // Re-fetch incidents when filters change
    fetchIncidents();
  }, [filter, anomalyTypeFilter, anomalySubtypeFilter]);

  const fetchFilterOptions = async () => {
    try {
      // Fetch available anomaly types
      const typesResponse = await apiService.getAvailableAnomalyTypes();
      if (typesResponse && typesResponse.available_types) {
        setAvailableAnomalyTypes(typesResponse.available_types);
      }

      // Fetch available anomaly subtypes  
      const subtypesResponse = await apiService.getAvailableAnomalySubtypes();
      if (subtypesResponse && subtypesResponse.available_subtypes) {
        setAvailableAnomalySubtypes(subtypesResponse.available_subtypes);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      // Convert 'all' to 'All' for consistency with backend
      const severityFilter = filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1);
      const data = await apiService.getIncidents(severityFilter, anomalyTypeFilter, anomalySubtypeFilter);
      setIncidents(data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIncidentClick = (incidentId, event) => {
    // Check if clicked element is an action button to prevent navigation
    if (event.target.closest('.incident-actions')) {
      return;
    }
    navigate(`/incidents/${incidentId}`);
  };

  const handleManageIncident = (incidentId, event) => {
    event.stopPropagation();
    navigate(`/incidents/${incidentId}/manage`);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSeverityOrder = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

  const getStatusOrder = (status) => {
    switch (status?.toLowerCase()) {
      case 'new': return 4;
      case 'open': return 3;
      case 'in progress': return 2;
      case 'resolved': return 1;
      case 'closed': return 0;
      default: return -1;
    }
  };

  const isNewIncident = (incidentTime) => {
    if (!incidentTime) return false;
    
    const now = new Date();
    const incidentDate = new Date(incidentTime);
    const sixHoursAgo = new Date(now.getTime() - (6 * 60 * 60 * 1000)); // 6 hours in milliseconds
    
    return incidentDate >= sixHoursAgo;
  };

  const filteredAndSortedIncidents = incidents
    .filter(incident => {
      // Filter by severity
      const severityMatch = filter === 'all' || incident.incident_severity.toLowerCase() === filter;
      
      // Filter by source IP
      const sourceIpMatch = !sourceIpFilter || 
        incident.source_ip?.toLowerCase().includes(sourceIpFilter.toLowerCase());
      
      return severityMatch && sourceIpMatch;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      
      let aValue, bValue;
      
      switch (sortField) {
        case 'severity':
          aValue = getSeverityOrder(a.incident_severity);
          bValue = getSeverityOrder(b.incident_severity);
          break;
        case 'status':
          aValue = getStatusOrder(a.incident_status);
          bValue = getStatusOrder(b.incident_status);
          break;
        default:
          return 0;
      }
      
      if (sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

  const newIncidentsCount = filteredAndSortedIncidents.filter(incident => isNewIncident(incident.time)).length;

  const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'severity-high';
      case 'medium':
        return 'severity-medium';
      case 'low':
        return 'severity-low';
      default:
        return 'severity-unknown';
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'status-new';
      case 'in progress':
        return 'status-progress';
      case 'resolved':
        return 'status-resolved';
      default:
        return 'status-unknown';
    }
  };

  if (loading) {
    return <div className="loading">Loading incidents...</div>;
  }

  return (
    <div className="incidents-page">
      <div className="page-header">
        <h1>Security Incidents</h1>
        <div className="filters">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <select 
            value={anomalyTypeFilter} 
            onChange={(e) => setAnomalyTypeFilter(e.target.value)}
            className="filter-select"
          >
            {availableAnomalyTypes.map(type => (
              <option key={type} value={type}>
                {type === 'All' ? 'All Anomaly Types' : type}
              </option>
            ))}
          </select>

          <select 
            value={anomalySubtypeFilter} 
            onChange={(e) => setAnomalySubtypeFilter(e.target.value)}
            className="filter-select"
          >
            {availableAnomalySubtypes.map(subtype => (
              <option key={subtype} value={subtype}>
                {subtype === 'All' ? 'All Anomaly Subtypes' : subtype}
              </option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Search by Source IP..."
            value={sourceIpFilter}
            onChange={(e) => setSourceIpFilter(e.target.value)}
            className="ip-filter-input"
          />
          <button onClick={fetchIncidents} className="refresh-btn">
            Refresh
          </button>
        </div>
      </div>

      <div className="incidents-summary">
        <div className="summary-card">
          <h3>Total Incidents</h3>
          <div className="summary-value">{filteredAndSortedIncidents.length}</div>
        </div>
        <div className="summary-card">
          <h3>High Severity</h3>
          <div className="summary-value high">
            {filteredAndSortedIncidents.filter(i => 
              i.incident_severity && i.incident_severity.toLowerCase() === 'high'
            ).length}
          </div>
        </div>
        <div className="summary-card">
          <h3>New</h3>
          <div className="summary-value new">
            {newIncidentsCount}
          </div>
          <div className="summary-note">
            Last 6 Hours
          </div>
        </div>
      </div>

      <div className="incidents-table-container">
        <table className="incidents-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Scenario</th>
              <th 
                className={`sortable-header ${sortField === 'severity' ? 'sorted' : ''}`}
                onClick={() => handleSort('severity')}
              >
                Severity 
                {sortField === 'severity' && (
                  <span className="sort-indicator">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className={`sortable-header ${sortField === 'status' ? 'sorted' : ''}`}
                onClick={() => handleSort('status')}
              >
                Status 
                {sortField === 'status' && (
                  <span className="sort-indicator">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th>Type</th>
              <th>Source IP</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedIncidents.map((incident) => (
              <tr 
                key={incident.id} 
                className="incident-row clickable-row"
                onClick={(e) => handleIncidentClick(incident.id, e)}
              >
                <td>{incident.id}</td>
                <td>{incident.user}</td>
                <td>{incident.scenario}</td>
                <td>
                  <span className={`severity-badge ${getSeverityClass(incident.incident_severity)}`}>
                    {incident.incident_severity}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${getStatusClass(incident.incident_status)}`}>
                    {incident.incident_status}
                  </span>
                </td>
                <td>{incident.incident_type}</td>
                <td>{incident.source_ip}</td>
                <td>
                  <div className="incident-actions">
                    <button 
                      onClick={(e) => handleManageIncident(incident.id, e)}
                      className="manage-btn"
                    >
                      Manage
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedIncidents.length === 0 && !loading && (
        <div className="no-incidents">
          <p>No incidents found matching the current filters.</p>
        </div>
      )}
    </div>
  );
};

export default Incidents;
