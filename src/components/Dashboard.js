import React, { useState, useEffect } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    summary_counts: { total_incidents: 0, high_severity: 0, new_incidents: 0 },
    severity_counts: [],
    mitre_tactics: [],
    incident_trend: []
  });
  const [anomalySubtypeDistribution, setAnomalySubtypeDistribution] = useState({ labels: [], counts: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  // Filter states - updated time range options, added back assignee
  const [filters, setFilters] = useState({
    timeRange: 'All',
    severity: 'All',
    assignee: 'All'
  });
  
  // Dynamic assignee options
  const [assigneeOptions, setAssigneeOptions] = useState(['All']);

  useEffect(() => {
    fetchAvailableAssignees();
  }, []); // Fetch assignees once on mount

  useEffect(() => {
    fetchDashboardData();
  }, [filters]); // Re-fetch when filters change

  const fetchAvailableAssignees = async () => {
    try {
      const response = await apiService.getAvailableAssignees();
      console.log('[Dashboard] Available assignees response:', response);
      if (response && response.available_assignees) {
        setAssigneeOptions(response.available_assignees);
        console.log('[Dashboard] Set assignee options to:', response.available_assignees);
      }
    } catch (error) {
      console.error('Error fetching available assignees:', error);
      // Fallback to default options if API fails
      setAssigneeOptions(['All']);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch filtered dashboard data
      let filteredData = {
        summary_counts: { total_incidents: 0, high_severity: 0, new_incidents: 0 },
        severity_counts: [],
        mitre_tactics: [],
        incident_trend: []
      };
      let anomalySubtypeData = { labels: [], counts: [], total: 0 };
      
      try {
        filteredData = await apiService.getFilteredDashboardData(filters.timeRange, filters.severity, filters.assignee);
        console.log('[Dashboard] Filtered data loaded:', filteredData);
        
        // Use anomaly data from filtered response
        anomalySubtypeData = filteredData.anomaly_distribution || { labels: [], counts: [], total: 0 };
      } catch (error) {
        console.error('Error fetching filtered dashboard data:', error);
        
        // Fallback to separate API call if main call fails
        try {
          anomalySubtypeData = await apiService.getAnomalySubtypeDistribution();
          console.log('[Dashboard] Anomaly distribution loaded as fallback');
        } catch (error2) {
          console.error('Error fetching anomaly subtype distribution fallback:', error2);
        }
      }
      
      setDashboardData(filteredData);
      setAnomalySubtypeDistribution(anomalySubtypeData || { labels: [], counts: [], total: 0 });
    } catch (error) {
      console.error('Error in fetchDashboardData:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extract metrics from filtered dashboard data
  const totalIncidents = dashboardData.summary_counts.total_incidents;
  const highSeverityIncidents = dashboardData.summary_counts.high_severity;
  const newIncidents = dashboardData.summary_counts.new_incidents;

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Updated filter options
  const severityOptions = ['All', 'High', 'Medium', 'Low'];
  const timeRangeOptions = ['Last 1 Hour', 'Last 4 Hours', 'Last 12 Hours', 'Last 24 Hours', 'All'];
  // assigneeOptions is now dynamically fetched and stored in state

  // Generate MITRE ATT&CK tactics display from real data
  const getMitreAttackTactics = () => {
    const tactics = dashboardData.mitre_tactics || [];
    if (tactics.length === 0) {
      return [
        { name: "No MITRE data", count: 0, color: "tactic-dot" }
      ];
    }
    
    // Map tactics to display format with appropriate colors
    const colorClasses = ['initial-access', 'execution', 'credential-access', 'credential'];
    return tactics.slice(0, 4).map((tactic, index) => ({
      name: tactic.mitre_tactic || tactic.tactic || 'Unknown',
      count: tactic.count,
      color: colorClasses[index % colorClasses.length]
    }));
  };

  // Generate incident trend chart data from real data
  const getIncidentTrendData = () => {
    const trendData = dashboardData.incident_trend || [];
    
    if (trendData.length === 0) {
      return {
        labels: ['No data'],
        datasets: [{
          data: [0],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        }]
      };
    }

    // Sort by hour and prepare for chart
    const sortedData = trendData.sort((a, b) => new Date(a.hour) - new Date(b.hour));
    const labels = sortedData.map(item => {
      const date = new Date(item.hour);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const counts = sortedData.map(item => item.incident_count);

    return {
      labels,
      datasets: [{
        data: counts,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      }]
    };
  };

  // Get chart data
  const trendData = getIncidentTrendData();
  const mitreAttackTactics = getMitreAttackTactics();

  const trendOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#E5E7EB',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Pie chart data for anomaly subtype distribution
  const pieChartData = {
    labels: anomalySubtypeDistribution.labels,
    datasets: [
      {
        data: anomalySubtypeDistribution.counts,
        backgroundColor: [
          '#3B82F6', // Blue
          '#10B981', // Green
          '#F59E0B', // Amber
          '#EF4444', // Red
          '#8B5CF6', // Violet
          '#F97316', // Orange
          '#06B6D4', // Cyan
          '#84CC16', // Lime
          '#EC4899', // Pink
          '#6B7280'  // Gray
        ],
        borderColor: [
          '#2563EB',
          '#059669',
          '#D97706',
          '#DC2626',
          '#7C3AED',
          '#EA580C',
          '#0891B2',
          '#65A30D',
          '#DB2777',
          '#4B5563'
        ],
        borderWidth: 2,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',  // Changed from 'bottom' to 'right' for vertical layout
        align: 'start',     // Align labels to start vertically
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 12,
          },
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = anomalySubtypeDistribution.total;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard">
      <div className="filters">
        <div className="filter-item">
          <span>Filters:</span>
        </div>
        <div className="filter-item">
          <span>Time Range:</span>
          <select 
            value={filters.timeRange}
            onChange={(e) => handleFilterChange('timeRange', e.target.value)}
            className="filter-select"
          >
            {timeRangeOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="filter-item">
          <span>Severity:</span>
          <select 
            value={filters.severity}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
            className="filter-select"
          >
            {severityOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="filter-item">
          <span>Assignee:</span>
          <select 
            value={filters.assignee}
            onChange={(e) => handleFilterChange('assignee', e.target.value)}
            className="filter-select"
          >
            {assigneeOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="metrics-cards">
        <div className="metric-card primary">
          <h3>Open Incidents</h3>
          <div className="metric-value">{totalIncidents}</div>
        </div>
        
        <div className="metric-card">
          <h3>High Severity</h3>
          <div className="metric-value high-severity">{highSeverityIncidents}</div>
        </div>
        
        <div className="metric-card">
          <h3>New Incidents</h3>
          <div className="metric-value new-incidents">{newIncidents}</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="left-panel">
          <div className="mitre-overview">
            <h3>MITRE ATT&CK Tactics Overview</h3>
            <div className="tactics-grid">
              {mitreAttackTactics.map((tactic, index) => (
                <div key={index} className="tactic">
                  <span className={`tactic-dot ${tactic.color}`}></span>
                  {tactic.name}
                  <span className="tactic-count">({tactic.count})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="incident-trend">
            <h3>Incident Trend ({filters.timeRange})</h3>
            <div className="chart-container">
              <Line data={trendData} options={trendOptions} />
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="anomaly-distribution">
            <h3>Anomaly Subtype Distribution</h3>
            <div className="pie-chart-container">
              {anomalySubtypeDistribution.total > 0 ? (
                <Pie data={pieChartData} options={pieChartOptions} />
              ) : (
                <div className="no-data">
                  <p>No anomaly subtype data available</p>
                </div>
              )}
            </div>
            <div className="distribution-summary">
              <p className="total-count">
                Total Anomalies: <strong>{anomalySubtypeDistribution.total}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="status-bar">
        <div className="status-item">
          <span>System Health: </span>
          <span className="status-good">Good</span>
        </div>
        <div className="status-item">
          <span>Notifications: 3</span>
        </div>
        <div className="status-item">
          <span>User: {user?.full_name || user?.username || 'Unknown User'}</span>
        </div>
        <div className="status-item help-toggle">
          <button 
            className="help-btn" 
            onClick={() => setShowHelp(!showHelp)}
            title="Show/Hide Help"
          >
            {showHelp ? '?' : '?'} Help
          </button>
        </div>
      </div>

      {/* Help Section */}
      {showHelp && (
        <div className="help-section">
          <div className="help-modal">
            <div className="help-header">
              <h3>📚 Dashboard Help & Quick Guide</h3>
              <button className="close-help" onClick={() => setShowHelp(false)}>×</button>
            </div>
            
            <div className="help-content">
            <div className="help-column">
              <div className="help-card">
                <h4>🎯 Understanding Metrics</h4>
                <ul>
                  <li><strong>Open Incidents:</strong> Total active security incidents requiring attention</li>
                  <li><strong>High Severity:</strong> Critical incidents that need immediate response</li>
                  <li><strong>New Incidents:</strong> Recently detected incidents from the last 6 hours</li>
                </ul>
              </div>
              
              <div className="help-card">
                <h4>📊 Charts & Visualizations</h4>
                <ul>
                  <li><strong>Incident Trend:</strong> Shows incident volume over the last 24 hours</li>
                  <li><strong>Anomaly Distribution:</strong> Pie chart showing types of detected anomalies</li>
                  <li><strong>MITRE Tactics:</strong> Attack tactics mapped to MITRE ATT&CK framework</li>
                </ul>
              </div>
            </div>
            
            <div className="help-column">
              <div className="help-card">
                <h4>⚡ Quick Actions</h4>
                <ul>
                  <li>Click on <strong>incident metrics</strong> to view detailed incident list</li>
                  <li>Use <strong>Chat Assistant</strong> to query incidents and get AI insights</li>
                  <li>Access <strong>Incident Management</strong> to investigate individual cases</li>
                  <li>Check <strong>Models</strong> page to manage ML detection algorithms</li>
                </ul>
              </div>
              
              <div className="help-card">
                <h4>🚨 Severity Levels</h4>
                <ul>
                  <li><span className="severity-high">High:</span> Immediate action required, potential security breach</li>
                  <li><span className="severity-medium">Medium:</span> Suspicious activity, investigate within 24h</li>
                  <li><span className="severity-low">Low:</span> Minor anomaly, monitor and review</li>
                </ul>
              </div>
            </div>
            
            <div className="help-column">
              <div className="help-card">
                <h4>🔍 Navigation Tips</h4>
                <ul>
                  <li>Use the <strong>left sidebar</strong> to navigate between different sections</li>
                  <li><strong>Filters</strong> at the top help narrow down incident views</li>
                  <li>Click on <strong>anomalies</strong> in incident details for comprehensive information</li>
                  <li>Use <strong>Runbooks</strong> for standardized incident response procedures</li>
                </ul>
              </div>
              
              <div className="help-card">
                <h4>🤖 AI Assistant Features</h4>
                <ul>
                  <li><strong>Natural Language Queries:</strong> "Show me high severity incidents"</li>
                  <li><strong>Root Cause Analysis:</strong> Click RCA button for AI-powered analysis</li>
                  <li><strong>Update Management:</strong> "Update false positive yes for INC-123"</li>
                  <li><strong>Interactive Responses:</strong> Get contextual suggestions and actions</li>
                </ul>
              </div>
            </div>
          </div>
          
            <div className="help-footer">
              <p><strong>💡 Pro Tip:</strong> Use the chat assistant for natural language queries like "show incidents from user john" or "what are the latest high severity threats"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
